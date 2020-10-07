defmodule Worker.Services.TilesCreator do

  require Logger
  alias Worker.Services.ImageMagickImageConverter

  @tile_size 256

  def create_tiles({project, image_id, image_size}), do: create_tiles(project, image_id, image_size)
  def create_tiles(project, image_id, {width, height}) do
    unless ImageMagickImageConverter.exists?(project, image_id)
    do
      Logger.error "Cannot generate tile for #{project}/#{image_id}. Source image not found."
    else
      template = create_template(Enum.max([width, height]), @tile_size)
      Enum.map(template, fn {{rescale, entries}, z} ->
        ImageMagickImageConverter.rescale(project, image_id, floor(rescale))
        Enum.map(entries,
          fn entry ->
            ImageMagickImageConverter.crop(project, @tile_size, image_id, floor(rescale), z, entry)
            nil
          end)
      end)
      Logger.info "Successfully generated tiles for #{project}/#{image_id}."
    end
  end

  defp create_template(image_size, tile_size) do
    Stream.unfold(
      image_size,
      fn current_size ->
        {
          {
            current_size,                          # our "rescale"
            calc_template(current_size, tile_size) # our "entries"
          },
          current_size / 2
        }
      end
    )
    |> Stream.take_while(fn {current_size, _} -> (current_size * 2) > tile_size end)
    |> Enum.reverse()
    |> Enum.with_index()                           # index will be our "z"
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
    |> List.flatten()
  end
end