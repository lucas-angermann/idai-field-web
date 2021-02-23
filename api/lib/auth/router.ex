defmodule Api.Auth.Router do
  use Plug.Router
  import Api.RouterUtils, only: [send_json: 2]
  alias Api.Auth.Bearer
  alias Api.Auth.Helpers

  plug :match
  plug :dispatch

  # One may or may not pass a Bearer token when calling this
  get "/info" do

    bearer = List.first get_req_header(conn, "authorization")
    token_content = Bearer.get_user_for_bearer(bearer)

    conn
    |> put_resp_content_type("text/plain")
    |> send_json(token_content)
  end

  # As body, pass json like this
  # {
  #    "name": "user-1",
  #    "pass": "pass-1"
  # }
  #
  # Issues a token for the user, which can be used in follow up requests
  # to claim to be that same user.
  #
  # IMPL NOTE: The token will only act as an identifier, but in itself will
  #   not contain the user's role (i.e. if he is admin). This is on purpose, so
  #   routers and plugs always have the chance to apply rules with the latest state.
  post "/sign_in" do
    response = Helpers.sign_in(
      Api.Core.Utils.atomize(conn.body_params), 
      Api.Core.Config.get(:auth).users)
    conn
    |> put_resp_content_type("text/plain")
    |> send_json(response)
  end
end
