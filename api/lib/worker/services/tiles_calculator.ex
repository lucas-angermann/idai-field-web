defmodule Worker.Services.TilesCalculator do

  @imageroot "/imageroot/"
  @tile_size 256
  @required_imagemagick_version [6, 9]
  @required_delegates ["jp2", "png", "jpeg"]
  @intermediate_format_suffix "jpg"

  def required_version_matches(version, [required_major, required_minor]) do
    [major, minor, _] = String.split(version, ".")
    {major, _} = Integer.parse major
    {minor, _} = Integer.parse minor
    major > required_major or (major == required_major and minor >= required_minor)
  end

  def required_delegates_present(delegates) do
    Enum.empty?(@required_delegates -- delegates)
  end

  def environment_ready() do
    {result, result_status} = System.cmd("convert", ["--version"])
    lines = String.split(result, "\n")
    [delegates] = Enum.filter(lines, fn line -> String.starts_with?(line, "Delegates") end)
    [_, delegates] = String.split(delegates, ":")
    delegates = String.split(delegates)
    [version] = Enum.filter(lines, fn line -> String.starts_with?(line, "Version") end)
    [version] = Enum.filter(String.split(version), fn part -> String.match?(part, ~r/\d*\.\d\.\d/) end)

    result_status == 0
    and required_version_matches(version, @required_imagemagick_version)
    and required_delegates_present(delegates)
  end

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
      {mkdir_cmd, mkdir_args, rescale_cmd, rescale_args} = make_rescale_commands(project, image_id, rescale)
      System.cmd(mkdir_cmd, mkdir_args)
      System.cmd(rescale_cmd, rescale_args)
      Enum.map(entries,
        fn entry ->
           {mkdir_cmd, mkdir_args, crop_cmd, crop_args} = make_crop_commands(
             project, @tile_size, image_id, rescale, z, entry)
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

  defp make_rescale_commands(project, image_id, rescale) do
    {
      "mkdir",
      [
        "-p", "#{@imageroot}#{project}/#{image_id}"
      ],
      "convert",
      [
        "#{@imageroot}#{project}/#{image_id}.jpg", # todo make param for suffix
        "-resize",
        "#{rescale}x#{rescale}",
        "#{@imageroot}#{project}/#{image_id}/#{image_id}.#{rescale}.#{@intermediate_format_suffix}"
      ]
    }
  end

  defp make_crop_commands(
         project,
         tile_size,
         image_id,
         rescale,
         z_index,
         %{x_index: x_index, y_index: y_index, x_pos: x_pos, y_pos: y_pos}) do
    {
      "mkdir",
      [
        "-p", "#{@imageroot}#{project}/#{image_id}/#{z_index}/#{x_index}"
      ],
      "convert",
      [
        "#{@imageroot}#{project}/#{image_id}/#{image_id}.#{rescale}.#{@intermediate_format_suffix}",
        "-quiet", # suppress 'convert: geometry does not contain image', some tiles simply will have no content with tiled rectangular images
        "-crop", "#{tile_size}x#{tile_size}+#{x_pos}+#{y_pos}",
        "-background", "transparent",
        "-extent", "#{tile_size}x#{tile_size}",
        "/imageroot/wes/#{image_id}/#{z_index}/#{x_index}/#{y_index}.png"
      ]
    }
  end
end