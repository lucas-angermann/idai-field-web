defmodule Worker.Images.TilesCreator do

  require Logger
  alias Worker.Images.ImageMagickImageConverter

  @tile_size 256

  def create_tiles({project, image_id, image_size}), do: create_tiles(project, image_id, image_size)
  def create_tiles(project, image_id, {width, height}) do
    Logger.info "Start generating tiles for #{project}/#{image_id}"
    unless ImageMagickImageConverter.source_exists?(project, image_id)
    do
      Logger.warn "Cannot generate tile for '#{image_id}' of '#{project}'. Source image not found in 'converted' folder. "
                  <> "Conversions are expected to be done first, so that the originals should be there."
    else
      template = create_template(Enum.max([width, height]), @tile_size)

      if (rescale_images(template, project, image_id) == false) do
        Logger.error "Could not rescale all images for '#{image_id}' in preparation of tiling. Skip tile generation"
      else
        generate_tiles(template, project, image_id)
        Logger.info "Successfully generated tiles for #{project}/#{image_id}"
      end
    end
  end

  defp generate_tiles(template, project, image_id) do
    Enum.map(template, fn {{rescale, entries}, z} ->
      Enum.map(entries,
        fn entry ->
          ImageMagickImageConverter.crop(project, @tile_size, image_id, floor(rescale), z, entry)
          nil
        end)
    end)
  end

  # Returns true if everything went fine.
  defp rescale_images(template, project, image_id) do
    (Enum.map(
      template,
      fn {{rescale, _entries}, _z} ->
        Logger.info "Rescale to #{floor(rescale)}"
        ImageMagickImageConverter.rescale(project, image_id, floor(rescale))
      end
    )
    |> Enum.filter(&(&1 != true))
    |> Enum.count) == 0
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