FROM elixir:latest

COPY . /opt/src/worker

WORKDIR "/opt/src/worker"

RUN apt-get update && apt-get -y install libproj-dev

RUN ["mix", "local.hex", "--force"]
RUN ["mix", "local.rebar", "--force"]
RUN ["mix", "deps.get"]
RUN ["mix", "deps.compile", "proj"]

ENTRYPOINT ["mix", "run", "--no-halt"]
