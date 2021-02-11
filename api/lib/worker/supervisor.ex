defmodule Worker.Supervisor do
  use Supervisor

  def start_link(opts) do
    Supervisor.start_link(__MODULE__, :ok, opts)
  end

  @impl true
  def init(:ok) do
    children = [
      {Task.Supervisor, name: Worker.IndexingSupervisor},
      {Worker.Server, name: Worker.Server}
    ]
    opts = [strategy: :one_for_all]
    Supervisor.init(children, opts)
  end
end
