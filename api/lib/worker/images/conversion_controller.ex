defmodule Worker.Images.ConversionController do

  require Logger
  alias Core.Config
  import Worker.Images.ImageMagickImageConverter

  defp log_start_project(project) do
    Logger.info "Start image conversion for '#{project}'"
  end

  def convert_images_for_project(project) do
    log_start_project project
    if sources_exist? project do
      convert_files project
    else
      Logger.error "Sources do not exist for '#{project}'"
    end
  end

  def convert_images_for_all_projects do
    projects = Config.get(:couchdb_databases)
    for project <- projects do
      log_start_project project
      if sources_exist? project do
        convert_files project
      else
        Logger.warn "Sources do not exist for '#{project}'. Will skip image conversions for this project"
      end
    end
  end
end