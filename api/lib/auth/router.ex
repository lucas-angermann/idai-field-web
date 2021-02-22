defmodule Api.Auth.Router do
  use Plug.Router
  import Api.RouterUtils, only: [send_json: 2]
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
  # to claim to be that same user.
  #
  # IMPL NOTE: The token will only act as an identifier and contain the readable
  #   projects, but it will not maintain the users role, i.e. if he has admin rights.
  #   This is handled by the plugs and routers.
  post "/sign_in" do
    user = user_by(conn.body_params, Api.Core.Config.get(Api.Auth, :users))

    {:ok, token, _claims} = Guardian.encode_and_sign(user)
    response = %{ 
      token: token,
      admin: (if user[:admin] == true, do: true, else: false) # TODO review; alternative: Api.Auth.Helpers.is_admin(username)
    }
    conn
    |> put_resp_content_type("text/plain")
    |> send_json(response)
  end

  defp user_by(%{"name" => name, "pass" => pass}, users) do
    auth_ok? = fn u -> u.name == name and u.pass == pass end
    [found_user|_] = Enum.filter users, auth_ok?
    found_user
  end
end
