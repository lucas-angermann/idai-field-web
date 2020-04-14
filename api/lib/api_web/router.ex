defmodule ApiWeb.Router do
  use ApiWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", ApiWeb do
    pipe_through :api

    get "/resources", ResourceController, :index
    get "/resources/:id", ResourceController, :show
  end
end
