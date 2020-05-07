defmodule Api.Private.PrivRouter do
  use Plug.Router

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
    decoded = Api.Private.PrivGuardian.decode_and_verify(bearer)

    IO.inspect decoded

    IO.puts "current resource"
    IO.inspect {:ok, resource, claims} = Api.Private.PrivGuardian.resource_from_token(bearer)

    conn
    |> put_resp_content_type("text/plain")
    |> send_resp(200, "HelloWorld!!\n")
  end

  get "/sign_in" do
    IO.puts "/sign_in"
    conn = conn
           |> Api.Private.PrivGuardian.Plug.sign_in(%{abc: 123, id: 3})

    IO.inspect conn

    conn
    |> put_resp_content_type("text/plain")
    |> send_resp(200, "HelloWorld!!\n")
  end
end