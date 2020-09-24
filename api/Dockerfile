FROM elixir:latest

COPY . /opt/src/api

WORKDIR "/opt/src/api"

RUN ["apt-get", "update", "-y"]
RUN ["apt-get", "install", "python-gdal", "-y"]

RUN ["mix", "local.hex", "--force"]
RUN ["mix", "local.rebar", "--force"]
RUN ["mix", "deps.get"]
RUN ["mix", "deps.compile"]

ENTRYPOINT ["mix", "run", "--no-halt"]
