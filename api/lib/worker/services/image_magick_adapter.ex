defmodule Worker.Services.ImageMagickAdapter do

  @imageroot "/imageroot/"
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

  # todo make private and provide a public function which executes the command
  def make_rescale_commands(project, image_id, rescale) do
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

  def make_crop_commands(
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