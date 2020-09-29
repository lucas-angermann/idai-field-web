defmodule Worker.Services.TilesCreator do

  def create_tiles(project, image_id, image_size = {width, height}) do
    template = create_template(Enum.max([width, height]), @tile_size)
    commands = Enum.map(template, fn {{rescale, entries}, z} ->
      ImageMagickTiling.rescale(project, image_id, floor(rescale))
      Enum.map(entries,
        fn entry ->
          ImageMagickTiling.crop(project, @tile_size, image_id, rescale, z, entry)
          nil
        end)
    end)
    nil
  end

  defp create_template(image_size, tile_size) do
    Stream.unfold({:continue, image_size}, fn {run, current_size} ->
      if run != :continue, do: nil, else:
        {
          {
            current_size,
            List.flatten(calc_template(current_size, tile_size))
          },
          {
            if current_size < tile_size do :halt else :continue end,
            current_size / 2
          }
        }
    end) |> Enum.to_list() |> Enum.reverse() |> Enum.with_index()
  end

  defp calc_template(current_size, tile_size) do
    fit_times = Integer.floor_div(floor(current_size), tile_size) + if Integer.mod(floor(current_size), tile_size) != 0 do 1 else 0 end
    Enum.reduce(
      0 .. fit_times-1,
      [],
      fn x_val, x_acc ->
        x_acc ++ [
          Enum.reduce(
            0 .. fit_times-1,
            [],
            fn y_val, y_acc ->
              y_acc ++ [
                %{
                  x_index: x_val,
                  y_index: y_val,
                  x_pos: x_val * tile_size,
                  y_pos: y_val * tile_size
                }
              ]
            end
          )
        ]
      end
    )
  end
end