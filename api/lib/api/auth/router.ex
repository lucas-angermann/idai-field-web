defmodule Api.Auth.Router do
  use Plug.Router
  import Api.RouterUtils, only: [send_json: 2]
  alias Api.Auth

  plug :match
  plug :dispatch


  @doc """
  One may or may not pass a Bearer token when calling this
  """
  get "/show" do
    bearer = List.first get_req_header(conn, "authorization")
    user = get_user_for_bearer(bearer)

    conn
    |> put_resp_content_type("text/plain")
    |> send_json(%{ status: "ok", user: user })
  end


  @doc """
  As body, pass json like this
  {
     "name": "user-1",
     "pass": "pass-1"
  }

  Issues a token for the user, which can be used in follow up requests
  to claim to be that same user
  """
  post "/sign_in" do
    {:ok, token, claims} = User.by(conn.body_params) |> Auth.Guardian.encode_and_sign

    conn
    |> put_resp_content_type("text/plain")
    |> send_json(%{ token: token })
  end


  defp get_user_for_bearer(nil), do: User.anonymous()

  defp get_user_for_bearer(bearer) do
    token = String.replace bearer, "Bearer ", ""
    {:ok, user, _} = Auth.Guardian.resource_from_token(token)
    user
   end
end