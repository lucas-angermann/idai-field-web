defmodule Api.Worker.Server do
  use GenServer
  require Logger
  alias Api.Worker.IndexingSupervisor
  alias Api.Worker.Indexer
  alias Api.Worker.Images.TilesController

  @moduledoc """
  The general design is that per project (at most) one
  task can run at any time.
  """

  @doc """
  Triggers the indexing of projects.
  Returns :ok, or :rejected, in case indexing for any of the given projects is already running.
  """
  def reindex(projects), do: GenServer.call(__MODULE__, {:reindex, projects})

  def stop_process(project), do: GenServer.call(__MODULE__, {:stop_process, project})

  def show_processes(), do: GenServer.call(__MODULE__, {:show_processes})

  def tilegen(projects), do: GenServer.call(__MODULE__, {:tilegen, projects})

  ##########################################################

  def start_link(opts) do
    Logger.debug "Start #{__MODULE__}"
    GenServer.start_link(__MODULE__, :ok, opts)
  end

  @impl true
  def init(:ok), do: {:ok, _tasks = %{}} # tasks of running indexing processes with project names as keys

  # TODO handle projects not found, with :reindex and :stop_reindex
  @impl true
  def handle_call({:reindex, projects}, _from, tasks) do
    
    conflicts = MapSet.intersection(
      MapSet.new(projects), 
      MapSet.new(Map.keys(tasks)))
      |> MapSet.to_list

    if Enum.count(conflicts) > 0 do
      conflicts = conflicts
        |> Enum.map(&("'" <> &1 <> "'"))
        |> Enum.join(", ")
      {
        :reply,
        {
          :rejected, 
          "Other processes still running. Conflicts: #{conflicts}"
        },
        tasks
      }
    else
      new_tasks = start_reindex_processes projects
      { 
        :reply,
        {
          :ok, 
          "Start indexing #{Enum.join(projects, ", ")}"
        },
        Map.merge(tasks, new_tasks)
      }    
    end
  end
  def handle_call({:tilegen, projects}, _from, tasks) do
    
    # TODO get rid of code duplication
    conflicts = MapSet.intersection(
      MapSet.new(projects), 
      MapSet.new(Map.keys(tasks)))
      |> MapSet.to_list

    if Enum.count(conflicts) > 0 do
      conflicts = conflicts
        |> Enum.map(&("'" <> &1 <> "'"))
        |> Enum.join(", ")
      {
        :reply,
        {
          :rejected, 
          "Other processes still running. Conflicts: #{conflicts}"
        },
        tasks
      }
    else
      new_tasks = start_tilegen_processes projects
      { 
        :reply,
        {
          :ok, 
          "Start generating tiles for #{Enum.join(projects, ", ")}"
        },
        Map.merge(tasks, new_tasks)
      }    
    end
  end
  def handle_call({:show_processes}, _from, tasks) do
    {
      :reply,
      {
        :ok,
        Enum.map(
          Map.keys(tasks), 
          fn task -> "#{task}[#{Atom.to_string(tasks[task].type)}]" end)
      },
      tasks
    }
  end
  def handle_call({:stop_process, project}, _from, tasks) do

    if tasks[project] != nil do
      pid = tasks[project].task.pid
      Process.exit pid, :killed_by_user
      Indexer.stop_reindex project # TODO Review timing; deletion of index after process killed; an existing working index must never be allowed to get deleted by accident
      Logger.info "Process stopped by admin. Did not finish task for '#{project}'"
      {
        :reply,
        {
          :ok,
          "Stopped process for #{project}"
        },
        Map.delete(tasks, project)
      }
    else
      {
        :reply,
        {
          :ignored,
          "Currently no process is running for #{project}"
        },
        tasks
      }
    end
  end

  @impl true
  def handle_info({_, {:finished_reindex_project, project}}, tasks) do
    {
      :noreply, 
      Map.delete(tasks, project)
    }
  end
  def handle_info({_, {:finished_tilegen_project, project}}, tasks) do # TODO review
    {
      :noreply,
      Map.delete(tasks, project)
    }
  end
  def handle_info({:DOWN, _ref, :process, _pid, :normal}, tasks), do: {:noreply, tasks}
  def handle_info({:DOWN, _ref, :process, _pid, :killed_by_user}, tasks), do: {:noreply, tasks}
  def handle_info({:DOWN, ref, :process, _pid, _error}, tasks) do

    case Enum.find(Map.to_list(tasks), fn {_, %{ task: %{ ref: r }}} -> r == ref end) do
      {project, _task} -> 
        Logger.error "Something went wrong. Could not finish reindexing '#{project}'"
        {
          :noreply, 
          Map.delete(tasks, project)
        }
      nil -> 
        Logger.error "Something went wrong. Could not finish reindexing"
        Logger.error "Could not find process handle for reference '#{inspect ref}'"
        {
          :noreply, 
          tasks
        }
    end
  end
  def handle_info(msg, tasks) do
    Logger.error "Something went wrong #{inspect msg}"
    {
      :noreply,
      tasks
    }
  end
  
  defp start_reindex_processes(projects) do
    for project <- projects, into: %{} do
      task = Task.Supervisor.async_nolink(
        IndexingSupervisor, Indexer, :reindex, [project]) 
      {
        project,
        %{ task: task, type: :reindex }
      }
    end
  end

  defp start_tilegen_processes(projects) do
    # TODO review code duplications
    for project <- projects, into: %{} do
      task = Task.Supervisor.async_nolink(
        IndexingSupervisor, TilesController, :make_tiles, [[project]] # TODO review params 
      )
      { 
        project,
        %{ task: task, type: :tilegen }
      }
    end
  end
end
