defmodule Api.Auth.Router do
  use Plug.Router
  import Api.RouterUtils, only: [send_json: 2]
  alias Api.Auth

  plug :match
  plug :dispatch


  get "/" do
    IO.puts "...."
    conn
    |> put_resp_content_type("text/plain")
    |> send_resp(200, "HelloWorld!!\n")
  end


  get "/show" do
    IO.puts "/show"
    bearer = List.first get_req_header(conn, "authorization")
    bearer = String.replace bearer, "Bearer ", ""
    decoded = Api.Auth.decode_and_verify(bearer)

    IO.inspect decoded

    IO.puts "current resource"
    IO.inspect {:ok, resource, claims} = Auth.Guardian.resource_from_token(bearer)

    conn
    |> put_resp_content_type("text/plain")
    |> send_resp(200, "HelloWorld!!!\n")
  end


  @doc """
  As body, pass json like this
  {
     "name": "user-1",
     "pass": "pass-1"
  }
  """
  post "/sign_in" do
    {:ok, token, claims} = User.by(conn.body_params) |> Auth.Guardian.encode_and_sign

    conn
    |> put_resp_content_type("text/plain")
    |> send_json(%{ token: token })
  end
end