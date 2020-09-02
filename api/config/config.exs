import Config

config :logger, :console,
       format: {IdaiConsoleLogger, :format},
       metadata: [:mfa]

config :tesla, :adapter, Tesla.Adapter.Ibrowse

import_config "#{Mix.env()}.exs"