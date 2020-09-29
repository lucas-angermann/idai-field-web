defmodule Worker.Services.TilesCalculator do

  alias Worker.Services.ImageMagickAdapter

  @tile_size 256

  # size = 6000
  # project = "wes"
  # image_id = "6c5f936b-dba9-bf57-b681-5fc292e00e0b"
  # todo it is necessary for indexing to run before tile generation
  def trigger_tile_calculation() do
    %{ documents: docs } = Api.Documents.Index.search "*", 10, 0, [], [], ["resource.georeference"], ["wes"]
    entries = Enum.map(docs, fn %{resource: %{ :id => id, "width" => width, "height" => height }} -> {id, width, height} end)
    IO.inspect entries
    nil
  end

  def calc_tiles(project, image_id, image_size = {width, height}) do
    template = create_template(Enum.max([width, height]), @tile_size)
    commands = Enum.map(template, fn {{rescale, entries}, z} ->
      rescale = floor(rescale)
      {mkdir_cmd, mkdir_args, rescale_cmd, rescale_args} =
        ImageMagickAdapter.make_rescale_commands(project, image_id, rescale)
      System.cmd(mkdir_cmd, mkdir_args)
      System.cmd(rescale_cmd, rescale_args)
      Enum.map(entries,
        fn entry ->
           {mkdir_cmd, mkdir_args, crop_cmd, crop_args} =
             ImageMagickAdapter.make_crop_commands(project, @tile_size, image_id, rescale, z, entry)
           System.cmd(mkdir_cmd, mkdir_args)
           System.cmd(crop_cmd, crop_args)
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