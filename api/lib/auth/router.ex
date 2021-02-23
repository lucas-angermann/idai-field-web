defmodule Api.Auth.Router do
  use Plug.Router
  import Api.RouterUtils, only: [send_json: 2]
  alias Api.Auth.Bearer
  alias Api.Auth.Guardian

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
    user = user_by(conn.body_params, Api.Core.Config.get(Api.Auth, :users))

    response = case user do
      %{ name: "anonymous" } -> %{ is_admin: user.admin }
      %{ } -> {:ok, token, _claims} = Guardian.encode_and_sign(user)
              %{ token: token, is_admin: user.admin }
      nil -> %{ info: :not_found }
    end
    
    conn
    |> put_resp_content_type("text/plain")
    |> send_json(response)
  end

  defp user_by(%{"name" => "anonymous"}, users) do
    anon? = fn u -> u.name == "anonymous" end
    case Enum.filter users, anon? do
      [found_user|_] -> update_admin(found_user)
      [] -> %{ name: "anonymous", admin: false }
    end
  end
  defp user_by(%{"name" => name, "pass" => pass}, users) do
    auth_ok? = fn u -> u.name == name and u.pass == pass end
    case Enum.filter users, auth_ok? do
      [found_user|_] -> update_admin(found_user)
      [] -> nil
    end
  end
  defp user_by(_, _users), do: nil

  defp update_admin(user) do
    if user[:admin] == true do
      user
    else
      put_in(user[:admin], false)
    end
  end
end
