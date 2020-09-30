defmodule Worker.Services.TilesCreator do

  require Logger
  alias Worker.Services.ImageMagickTiling

  @tile_size 256

  # todo investigate: "convert: cache resources exhausted `/imageroot/wes/3440aa1a-013c-dba2-c38d-414b96dd5ef1.jpg' @ error/cache.c/OpenPixelCache/4083."

  def create_tiles({project, image_id, image_size}), do: create_tiles(project, image_id, image_size)
  def create_tiles(project, image_id, {width, height}) do
    unless ImageMagickTiling.exists?(project, image_id)
    do
      Logger.error "Cannot generate tile for #{project}/#{image_id}. Source image not found."
    else
      template = create_template(Enum.max([width, height]), @tile_size)
      Enum.map(template, fn {{rescale, entries}, z} ->
        ImageMagickTiling.rescale(project, image_id, floor(rescale))
        Enum.map(entries,
          fn entry ->
            ImageMagickTiling.crop(project, @tile_size, image_id, floor(rescale), z, entry)
            nil
          end)
      end)
      Logger.info "Successfully generated tiles for #{project}/#{image_id}."
    end
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
    end) |> Enum.to_list() |> Enum.reverse() |> Enum.with_index() # todo try do the break with filter or something, we could determine if another iteration is to be done from the "outside"
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