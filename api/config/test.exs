import Config

config :api,
  config_dir: "test/resources",
  couchdb_databases: ["a", "b"],

  default_filters: [
    %{
      field: "field1",
      label: %{ de: "Feld 1", en: "Field 1" }
    },
    %{
      field: "field2",
      label: %{ de: "Feld 2", en: "Field 2" }
    },
    %{
      field: "field3",
      label: %{ de: "Feld 3", en: "Field 3" }
    }
  ]

config :api, Elixir.Api.Auth,
  users: [
    %{ name: "user-1", pass: "pass-1" },
    %{ name: "user-2", pass: "pass-2" },
    %{ name: "user-3", pass: "pass-3" }
  ],
  readable_projects: %{
    "user-1" => ["a", "b", "c", "d"],
    "user-2" => ["a", "b", "c"],
    "user-3" => ["a", "b"],
    "anonymous" => ["a"]
  }
