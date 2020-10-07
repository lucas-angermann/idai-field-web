defmodule Api.Auth.Router do
  use Plug.Router
  import RouterUtils, only: [send_json: 2]
  alias Api.Auth.Bearer
  alias Api.Auth.Guardian

  plug :match
  plug :dispatch

  # One may or may not pass a Bearer token when calling this
  get "/show" do

    bearer = List.first get_req_header(conn, "authorization")
    rights = Bearer.get_user_for_bearer(bearer)

    conn
    |> put_resp_content_type("text/plain")
    |> send_json(%{ status: "ok", rights: rights })
  end

  # As body, pass json like this
  # {
  #    "name": "user-1",
  #    "pass": "pass-1"
  # }
  #
  # Issues a token for the user, which can be used in follow up requests
  # to claim to be that same user
  post "/sign_in" do
    {:ok, token, _claims} = Guardian.encode_and_sign(conn.body_params)
    conn
    |> put_resp_content_type("text/plain")
    |> send_json(%{ token: token })
  end
end
