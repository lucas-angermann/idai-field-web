defmodule Api.Private.PrivGuardian do
  use Guardian, otp_app: :api

  def subject_for_token(resource, _claims) do
    IO.puts "subject for token #{inspect resource}"
    {:ok, to_string(resource.id)}
  end

  def resource_from_claims(claims) do
    {:ok, %{a: 1}}
  end
end