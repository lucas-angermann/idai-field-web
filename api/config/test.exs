import Config

config :api,

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
