defmodule Worker.Indexer do
  @moduledoc """
  This coordinates calls to indexing processes.
  """
  use GenServer
  require Logger
  alias Worker.IndexAdapter
  alias Worker.Mapper
  alias Worker.Services.IdaiFieldDb
  alias Worker.Enricher.Enricher
  alias Core.ProjectConfigLoader
  alias Core.Config

  @doc """
  Triggers the indexing of all configured projects.
  Returns :ok, or :rejected, in case it is already running.

  While reindexing, every project, identified by its alias, a new index gets created.
  When reindexing for the project is finished, the alias will change to point to the new index 
  while the old index gets removed.
  """
  def trigger do
    GenServer.call(__MODULE__, {:index, :all})
  end
  def trigger(project) do
    GenServer.call(__MODULE__, {:index, project})
  end

  def start_link(opts) do
    Logger.info "Start #{__MODULE__}"
    GenServer.start_link(__MODULE__, :ok, opts)
  end

  ##########################################################

  @impl true
  def init(:ok) do
    {:ok, %{ update_mapping_and_reindex_all: :idle }}
  end

  @impl true
  def handle_call({:index, project}, _from, state = 
  %{ update_mapping_and_reindex_all: reindex_all_state }) do
    
    if reindex_all_state != :idle do
      {:reply, {:rejected, "Already running"}, state}
    else
      if project == :all do
        Task.async fn -> process(); :finished_mapping_and_reindex_all end
        {
          :reply, 
          {:ok, "Start indexing all projects"}, 
          Map.put(state, :update_mapping_and_reindex_all, :running)
        }
      else
        Task.async fn -> reindex(project) end
        {
          :reply, 
          {:ok, "Start indexing single project #{project}"}, 
          Map.put(state, :update_mapping_and_reindex_all, :running)
        }
      end
    end
  end

  @impl true
  def handle_info({_, :finished_mapping_and_reindex_all}, state) do
    {:noreply, Map.put(state, :update_mapping_and_reindex_all, :idle)}
  end
  def handle_info(msg, state) do
    IO.puts "handle_info #{inspect msg} : #{inspect state}"
    {:noreply, state}
  end

  ##########################################################

  defp process do
    processes = for db <- Config.get(:projects), do: Task.async fn -> reindex(db) end
    Enum.map(processes, &Task.await(&1, :infinity))
  end

  defp reindex(db) do
    configuration = ProjectConfigLoader.get(db)

    {new_index, old_index} = IndexAdapter.create_new_index_and_set_alias db

    IdaiFieldDb.fetch_changes(db)
    |> Enum.filter(&filter_non_owned_document/1)
    |> Enum.map(Mapper.process)
    |> log_finished("mapping", db)
    |> Enricher.process(db, IdaiFieldDb.get_doc(db), configuration)
    |> log_finished("enriching", db)
    |> Enum.map(IndexAdapter.process(db, new_index))
    |> log_finished("indexing", db)

    IndexAdapter.add_alias_and_remove_old_index db, new_index, old_index
  end

  defp log_finished(change, step, db) do
    Logger.info "Finished #{step} #{db}"
    change
  end

  defp filter_non_owned_document(_change = %{ doc: %{ project: _project } }), do: false
  defp filter_non_owned_document(_change), do: true
end
