import Config

config :logger, :console,
       format: {IdaiConsoleLogger, :format},
       metadata: [:mfa]

import_config "#{Mix.env()}.exs"