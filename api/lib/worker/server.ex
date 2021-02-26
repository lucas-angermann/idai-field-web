defmodule Api.Worker.Server do
  use GenServer
  require Logger
  alias Api.Worker.IndexingSupervisor
  alias Api.Worker.Indexer

  @doc """
  Triggers the indexing of projects.
  Returns :ok, or :rejected, in case indexing for any of the given projects is already running.
  """
  def index_projects(projects) do
    GenServer.call(__MODULE__, {:index, projects})
  end

  def stop_index_project(project) do
    GenServer.call(__MODULE__, {:stop_reindex, project})
  end

  ##########################################################

  def start_link(opts) do
    Logger.debug "Start #{__MODULE__}"
    GenServer.start_link(__MODULE__, :ok, opts)
  end

  @impl true
  def init(:ok), do: {:ok, _tasks = %{}} # tasks of running indexing processes with project names as keys

  # TODO handle projects not found, with :reindex and :stop_reindex
  @impl true
  def handle_call({:index, projects}, _from, tasks) do
    
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
          "Other indexing processes still running. Conflicts: #{conflicts}"
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
  def handle_call({:stop_reindex, project}, _from, tasks) do

    if tasks[project] != nil do
      pid = tasks[project].pid
      Process.exit(pid, :killed_by_user)
      Logger.info "Reindexing stopped by admin. Did not finish reindexing '#{project}'"
      # TODO remove newly created, now stale, index
      {
        :reply,
        {
          :ok,
          "Stopped reindexing #{project}"
        },
        Map.delete(tasks, project)
      }
    else
      {
        :reply,
        {
          :ignored,
          "Currently no reindexing process is running for #{project}"
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
  def handle_info({:DOWN, _ref, :process, _pid, :normal}, tasks), do: {:noreply, tasks}
  def handle_info({:DOWN, _ref, :process, _pid, :killed_by_user}, tasks), do: {:noreply, tasks}
  def handle_info({:DOWN, ref, :process, _pid, _error}, tasks) do

    case Enum.find(Map.to_list(tasks), fn {_, %{ref: r}} -> r == ref end) do
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
        task
      }
    end
  end
end
