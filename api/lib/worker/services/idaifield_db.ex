defmodule Services.IdaiFieldDb do
  alias Core.CorePropertiesAtomizing
  alias Services.ResultHandler
  require Logger

  # todo if to be moved
  def get_target_docs(documents, get) do
    Enum.reduce(documents, %{},
      fn %{ resource: resource }, target_documents ->
        if resource.relations == nil do
          target_documents
        else
          Enum.reduce(resource.relations, target_documents,
            fn {relation_name, relation_target_ids}, target_documents ->
              Enum.reduce(relation_target_ids, target_documents,
                fn relation_target_id, target_documents ->
                  put_in(target_documents, [relation_target_id], get.(relation_target_id))
                end)
            end)
        end
      end)
  end

  def get_doc(db, id) do
    auth = [hackney: [basic_auth: {Core.Config.get(:couchdb_user), Core.Config.get(:couchdb_password)}]]
    HTTPoison.get("#{Core.Config.get(:couchdb_url)}/#{db}/#{id}", %{}, auth)
    |> ResultHandler.handle_result
    |> CorePropertiesAtomizing.format_document
  end

  def fetch_changes(db) do
    auth = [hackney: [basic_auth: {Core.Config.get(:couchdb_user), Core.Config.get(:couchdb_password)}]]
    HTTPoison.get("#{Core.Config.get(:couchdb_url)}/#{db}/_changes?include_docs=true", %{}, auth)
    |> ResultHandler.handle_result
    |> get_in(["results"])
    |> CorePropertiesAtomizing.format_changes
    |> update_in([Access.all(), :doc], &(Map.drop(&1, [:_id, :_rev, :_attachments])))
  end
end
