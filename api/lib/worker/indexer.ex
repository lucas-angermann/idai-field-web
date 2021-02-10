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
    {:ok, %{ projects: [], refs: %{} }}
  end

  @impl true
  def handle_call({:index, project}, _from, state = 
  %{ projects: currently_reindexing_projects, refs: refs }) do
    
    if project == :all do
      if not Enum.empty? currently_reindexing_projects do
        {
          :reply,
          {:rejected, "Other indexing processes still running"},
          state
        }
      else
        projects = Config.get :projects
        refs = start_reindex_processes projects
        { 
          :reply,
          {:ok, "Start indexing #{Enum.join(projects)}"},
          %{ projects: projects, refs: refs }
        }    
      end
    else
      if project in currently_reindexing_projects do
        {
          :reply,
          {:rejected, "Another indexing process for #{project} still running"},
          state
        }
      else
        refs = Map.merge refs, start_reindex_processes [project]
        projects = [project|currently_reindexing_projects]
        { 
          :reply,
          {:ok, "Start indexing #{project}"},
          %{ projects: projects, refs: refs }
        }    
      end
    end
  end

  @impl true
  def handle_info({_, {:finished_reindex_project, project}}, %{projects: projects, refs: refs}) do

    state = %{ 
      projects: Enum.filter(projects, fn p -> p != project end),
      refs: Map.delete(refs, project)
    }
    {:noreply, state}
  end
  def handle_info(msg, state) do
    # TODO handle DOWN
    IO.puts "handle_info #{inspect msg} : #{inspect state}"
    {:noreply, state}
  end

  ##########################################################

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

  def reindex(project) do
    configuration = ProjectConfigLoader.get(project)

    #raise "raised"
    #:timer.sleep(2000)
    #IO.puts "slept"

    {new_index, old_index} = IndexAdapter.create_new_index_and_set_alias project

    IdaiFieldDb.fetch_changes(project)
    |> Enum.filter(&filter_non_owned_document/1)
    |> Enum.map(Mapper.process)
    |> log_finished("mapping", project)
    |> Enricher.process(project, IdaiFieldDb.get_doc(project), configuration)
    |> log_finished("enriching", project)
    |> Enum.map(IndexAdapter.process(project, new_index))
    |> log_finished("indexing", project)

    IndexAdapter.add_alias_and_remove_old_index project, new_index, old_index
    {:finished_reindex_project, project}
  end

  defp log_finished(change, step, project) do
    Logger.info "Finished #{step} #{project}"
    change
  end

  defp filter_non_owned_document(_change = %{ doc: %{ project: _project } }), do: false
  defp filter_non_owned_document(_change), do: true
end
