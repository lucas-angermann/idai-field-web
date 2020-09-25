defmodule Worker.Services.TilesCalculator do

  @imageroot "/imageroot/"

  def calc_tiles() do

    size = 6000
    tile_size = 256
    project = "wes"

    template = create_template(size, tile_size)

    commands = Enum.map(template, fn {{rescale, entries}, z} ->
      rescale = floor(rescale)
      {cmd, args} = make_rescale_command(project, rescale, rescale)
      System.cmd(cmd, args)
      Enum.map(entries,
        fn entry ->
           {cmd_a, args_a, cmd_b, args_b} = make_crop_commands(project, tile_size, "6c5f936b-dba9-bf57-b681-5fc292e00e0b.#{rescale}.jpg","6c5f936b-dba9-bf57-b681-5fc292e00e0b",z, entry)
           System.cmd(cmd_a, args_a)
           System.cmd(cmd_b, args_b)
           nil
        end)
    end)
    nil
  end

  def make_rescale_command(project, rescale_x, rescale_y) do
    {"convert",
      [
        @imageroot <> project <> "/6c5f936b-dba9-bf57-b681-5fc292e00e0b.jpg",
        "-resize",
        "#{rescale_x}x#{rescale_y}",
        @imageroot <> project <> "/6c5f936b-dba9-bf57-b681-5fc292e00e0b.#{rescale_x}.jpg" # todo rescale_y
      ]
    }
  end

  defp make_crop_commands(
         project,
         tile_size,
         input,
         output,
         z_index,
         %{x_index: x_index, y_index: y_index, x_pos: x_pos, y_pos: y_pos}) do
    {
      "mkdir",
      [
        "-p", @imageroot <> project <> "/#{output}/#{z_index}/#{x_index}"
      ],
      "convert",
      [
        @imageroot <> project <> "/#{input}",
        "-crop", "#{tile_size}x#{tile_size}+#{x_pos}+#{y_pos}",
        "-background", "transparent",
        "-extent", "#{tile_size}x#{tile_size}",
        "/imageroot/wes/#{output}/#{z_index}/#{x_index}/#{y_index}.png"
      ]
    }
  end

  defp create_template(size, output_tile_size) do
    Stream.unfold({:ok, size, 1}, fn {run, current_size, scale_factor} ->

      if run != :ok do
        nil
      else
        {
          {
            current_size,
            List.flatten(calc_template(current_size, output_tile_size, scale_factor))
          },
          {
            if current_size < output_tile_size do :halt else :ok end,
            current_size / 2,
            scale_factor * 2
          }
        }
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
                  x_pos: x_val * tile_size,
                  y_pos: y_val * tile_size
                }
              ]
            end
          )
        ]
      end
    )
  end
end