defmodule Worker.Services.ImageMagickTiling do

  @imageroot "/imageroot"
  @required_imagemagick_version [6, 9]
  @required_delegates ["jp2", "png", "jpeg"]
  @source_format_suffix "jp2"
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

  defp img_path(project, image_id) do
    "#{@imageroot}/#{project}/#{image_id}"
  end

  def exists?(project, image_id) do
    File.exists?("#{img_path(project, image_id)}.#{@source_format_suffix}")
  end

  def rescale(project, image_id, rescale) do
    {mkdir_cmd, mkdir_args, rescale_cmd, rescale_args} = {
      "mkdir",
      [
        "-p", "#{img_path(project, image_id)}"
      ],
      "convert",
      [
        "#{img_path(project, image_id)}.#{@source_format_suffix}",
        "-resize",
        "#{rescale}x#{rescale}",
        "#{img_path(project, image_id)}/#{image_id}.#{rescale}.#{@intermediate_format_suffix}"
      ]
    }
    System.cmd(mkdir_cmd, mkdir_args)
    System.cmd(rescale_cmd, rescale_args)
  end

  def crop(
         project,
         tile_size,
         image_id,
         rescale,
         z_index,
         %{x_index: x_index, y_index: y_index, x_pos: x_pos, y_pos: y_pos}) do

    {mkdir_cmd, mkdir_args, crop_cmd, crop_args} = {
      "mkdir",
      [
        "-p", "#{img_path(project, image_id)}/#{z_index}/#{x_index}"
      ],
      "convert",
      [
        "#{img_path(project, image_id)}/#{image_id}.#{rescale}.#{@intermediate_format_suffix}",
        "-quiet", # suppress 'convert: geometry does not contain image', some tiles simply will have no content with tiled rectangular images
        "-crop", "#{tile_size}x#{tile_size}+#{x_pos}+#{y_pos}",
        "-background", "transparent",
        "-extent", "#{tile_size}x#{tile_size}",
        "#{img_path(project, image_id)}/#{z_index}/#{x_index}/#{y_index}.png"
      ]
    }
    System.cmd(mkdir_cmd, mkdir_args)
    System.cmd(crop_cmd, crop_args)
  end
end