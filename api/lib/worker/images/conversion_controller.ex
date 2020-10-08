defmodule Worker.Images.ConversionController do

  require Logger

  def convert_images_for_project(project) do
    Logger.info "Start image conversion for '#{project}'"
    if Worker.Images.ImageMagickImageConverter.sources_exist?(project) do
      Worker.Images.ImageMagickImageConverter.convert_files(project)
    else
      Logger.error "Sources do not exist for '#{project}'"
    end
  end

  def convert_images_for_all_projects do
    Worker.Images.ImageMagickImageConverter.convert_folders()
  end
end