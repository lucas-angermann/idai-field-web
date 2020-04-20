defmodule Ticker do
  use GenServer

  def start_link do
    GenServer.start_link(__MODULE__, %{})
  end

  def init(_) do
    Process.send_after(self(), :work, 1000)
    IO.puts "init"
    {:ok, 0}
  end

  def handle_info(:work, state) do
    IO.puts "hello #{state}"
    Process.send_after(self(), :work, 1000)
    {:noreply, state + 1}
  end
end