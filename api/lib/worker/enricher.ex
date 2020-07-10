defmodule Enricher do

    def process(change = %{deleted: true}, _project), do: change

    def process(change, project) do
        put_in(change, [:doc, :project], project)
        |> add_coordinates_from_gazetteer
    end

    def add_coordinates_from_gazetteer(change = %{ doc: %{ resource: %{ gazId: gazId, category: "Project" }}}) do
        coordinates = get_coordinates_from_gazetteer(gazId)
        add_geometry(change, coordinates)
    end

    def add_coordinates_from_gazetteer(change), do: change

    def get_coordinates_from_gazetteer(gazetteer_id) do
        Gazetteer.get_place(gazetteer_id)
        |> get_coordinates_from_place
    end

    def add_geometry(change, coordinates = [_, _]) do
        put_in change, [:doc, :resource, :geometry], %{ type: "Point", coordinates: coordinates }
    end

    def add_geometry(change, _coordinates), do: change

    def get_coordinates_from_place(%{ prefLocation: %{ coordinates: [longitude, latitude] }}) do
        [longitude, latitude]
    end

    def get_coordinates_from_place(_place), do: nil
end
