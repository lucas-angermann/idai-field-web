defmodule Worker.Controller do
  use GenServer
  require Logger

  @doc """
  Triggers the indexing of projects.
  Returns :ok, or :rejected, in case indexing for any of the given projects is already running.

  During reindexing, for every project (identified by its alias) a new index gets created.
  When reindexing for the project is finished, the alias will change to point to the new index 
  while the old index gets removed.
  """
  def index_projects(projects) do
    GenServer.call(__MODULE__, {:index, projects})
  end

  ##########################################################

  def start_link(opts) do
    Logger.info "Start #{__MODULE__}"
    GenServer.start_link(__MODULE__, :ok, opts)
  end

  @impl true
  def init(:ok) do
    {:ok, %{ refs: %{} }}
  end

  @impl true
  def handle_call({:index, projects}, _from, state = %{ refs: refs }) do
    
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
        state
      }
    else
      new_refs = start_reindex_processes projects
      { 
        :reply,
        {:ok, "Start indexing #{Enum.join(projects, ", ")}"},
        %{ refs: Map.merge(refs, new_refs) }
      }    
    end
  end

  @impl true
  def handle_info({_, {:finished_reindex_project, project}}, %{refs: refs}) do
    state = %{ 
      refs: Map.delete(refs, project)
    }
    {:noreply, state}
  end
  def handle_info(_msg, state) do
    # TODO handle DOWN
    # IO.puts "handle_info #{inspect msg} : #{inspect state}"
    {:noreply, state}
  end

  
  defp start_reindex_processes(projects) do
    for project <- projects, into: %{} do
      task = Task.Supervisor.async_nolink(
        Worker.IndexingSupervisor, Worker.Indexer, :reindex, [project]) 
        {
          project,
          task.ref
        }
    end
  end
end
