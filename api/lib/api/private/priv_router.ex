defmodule Api.Private.PrivRouter do
  use Plug.Router

  plug :match
  plug Api.Private.PrivPlug

  get "/", do: conn
end