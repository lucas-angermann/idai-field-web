defmodule Worker.Server do
  use GenServer
  require Logger
  alias Worker.IndexingSupervisor
  alias Worker.Indexer

  @doc """
  Triggers the indexing of projects.
  Returns :ok, or :rejected, in case indexing for any of the given projects is already running.
  """
  def index_projects(projects) do
    GenServer.call(__MODULE__, {:index, projects})
  end

  ##########################################################

  def start_link(opts) do
    Logger.debug "Start #{__MODULE__}"
    GenServer.start_link(__MODULE__, :ok, opts)
  end

  @impl true
  def init(:ok), do: {:ok, %{}}

  @impl true
  def handle_call({:index, projects}, _from, refs) do
    
    conflicts = MapSet.intersection(
      MapSet.new(projects), 
      MapSet.new(Map.keys(refs)))
      |> MapSet.to_list

    if Enum.count(conflicts) > 0 do
      {
        :reply,
        {
          :rejected, "Other indexing processes still running. " 
          <> "Conflicts: #{Enum.join(Enum.map(conflicts, fn conflict -> "'" <> conflict <> "'" end), ", ")}"
        },
        refs
      }
    else
      new_refs = start_reindex_processes projects
      { 
        :reply,
        {:ok, "Start indexing #{Enum.join(projects, ", ")}"},
        Map.merge(refs, new_refs)
      }    
    end
  end

  @impl true
  def handle_info({_, {:finished_reindex_project, project}}, refs) do
    {:noreply, Map.delete(refs, project)}
  end
  def handle_info({:DOWN, _ref, :process, _pid, :normal}, refs), do: {:noreply, refs}
  def handle_info({:DOWN, ref, :process, _pid, _error}, refs) do
    # TODO maybe prevent error from being logged automatically. Instead log _error here.
    {project, _ref} = Enum.find(Map.to_list(refs), fn {_,v} -> v == ref end) # TODO Handle not found
    Logger.error "Something went wrong. Could not finish reindexing '#{project}'"
    {:noreply, Map.delete(refs, project)}
  end
  def handle_info(msg, state) do
    Logger.error "Something went wrong #{msg}"
    {:noreply, state}
  end
  
  defp start_reindex_processes(projects) do
    for project <- projects, into: %{} do
      task = Task.Supervisor.async_nolink(
        IndexingSupervisor, Indexer, :reindex, [project]) 
        {
          project,
          task.ref
        }
    end
  end
end
