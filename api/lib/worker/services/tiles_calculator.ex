defmodule Worker.Services.TilesCalculator do

  def calc_tiles() do

    size = 6000
    tile_size = 256

    commands = Enum.flat_map(create_template(size, tile_size), fn {entries, z} ->
      Enum.map(entries,
        fn entry ->

          make_commands(tile_size, "6c5f936b-dba9-bf57-b681-5fc292e00e0b.jpg","6c5f936b-dba9-bf57-b681-5fc292e00e0b",z, entry)

        end)
    end)

    IO.inspect commands
    nil
  end

  defp make_commands(
         output_tile_size,
         input,
         output,
         z_index,
         %{x_index: x_index, y_index: y_index, x_pos: x_pos, y_pos: y_pos, tile_size: tile_size}) do

    {
    "mkdir -p /imageroot/wes/#{output}/#{z_index}/#{x_index}/#{y_index}",
    "convert"
    <> " /imageroot/wes/#{input}"
    <> " -crop #{tile_size}x#{tile_size}+#{x_pos}+#{y_pos}"
    <> " -background transparent"
    <> " -extent #{output_tile_size}x#{output_tile_size}"
    <> " /imageroot/wes/#{output}/#{z_index}/#{x_index}/#{y_index}.png"}
  end

  defp create_template(size, output_tile_size) do
    Stream.unfold({:ok, size, 1}, fn {run, current_size, scale_factor} ->

      if run != :ok do
        nil
      else
        template = List.flatten(calc_template(current_size, output_tile_size, scale_factor))
        if current_size < output_tile_size do
          {template, {:halt, current_size, scale_factor*2}}
        else
          {template, {:ok, current_size / 2, scale_factor*2}}
        end
      end

    end) |> Enum.to_list() |> Enum.reverse() |> Enum.with_index()
  end

  defp calc_template(current_size, tile_size, scale_factor) do
    fit_times = Integer.floor_div(floor(current_size), tile_size) + if Integer.mod(floor(current_size), tile_size) != 0 do 1 else 0 end
    Enum.reduce(
      0..fit_times - 1,
      [],
      fn x_val, acc ->
        acc ++ [
          Enum.reduce(
            0..fit_times - 1,
            [],
            fn y_val, acc ->
              acc ++ [
                %{
                  x_index: x_val,
                  y_index: y_val,
                  tile_size: scale_factor * tile_size,
                  x_pos: x_val * tile_size * scale_factor,
                  y_pos: y_val * tile_size * scale_factor
                }
              ]
            end
          )
        ]
      end
    )
  end
end