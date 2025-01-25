using System;
using System.IO;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Linq;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Processing.Processors.Transforms;
using SixLabors.ImageSharp.Drawing.Processing;

var commandline = args.Select((x, i) => new { index = i, option = x }).Where(x => x.option.StartsWith('-')).Select(x =>
    new
    {
        option = x.option[1..],
        arguments = args.Skip(x.index + 1).TakeWhile(m => !m.StartsWith("-")).ToArray()
    }).ToDictionary(x => x.option.ToLower(), x => x.arguments);

if (args.Length == 0 || commandline.ContainsKey("h") || commandline.ContainsKey("help"))
{
    var executable = new FileInfo(Environment.GetCommandLineArgs()[0]).FullName;

    if (!System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(System.Runtime.InteropServices.OSPlatform
            .Windows))
        executable = $"./{executable}";

    Console.Write("Tiler XYZ tile maker v1.0\n" +
                  "Usage:\n" +
                  $"{executable} image.jpg\n" +
                  " or\n" +
                  $"{executable} -input image.jpg -size 256 -zoom 6 -filename \"image.jpg-tiles{Path.DirectorySeparatorChar}{{z}}_{{x}}_{{y}}.png\"\n");

    return;
}

var sourceFile = commandline.Count == 0 && args.Length > 0 ? args[0] : commandline["input"].First();
var tileSize = commandline.TryGetValue("size", value: out var Value) ? int.Parse(Value.First()) : 256;
using var originalSource =
    commandline.ContainsKey("stdin") ? Image.Load(Console.OpenStandardInput()) : Image.Load(sourceFile);

var maxZoom = commandline.TryGetValue("zoom", out var v)
    ? int.Parse(v.First())
    : (int)Math.Ceiling(Math.Log(Math.Max(originalSource.Width, originalSource.Height) / (double)tileSize)) +
      1; // auto detect max level

for (var zoom = 0; zoom <= maxZoom; zoom++)
{
    var tiles = (int)Math.Pow(2.0, zoom);
    var size = tiles * tileSize;
    using var scaled = new Image<Rgba32>(size, size);
    scaled.Mutate(i => i.Clear(Color.Transparent)); // Clear the background to transparent

    int width, height;

    if (originalSource.Width > originalSource.Height) // Calculate the right scale ratio
        (width, height) = (scaled.Width, scaled.Width * originalSource.Height / originalSource.Width);
    else
        (height, width) = (scaled.Height, scaled.Height * originalSource.Width / originalSource.Height);

    var Sampler = // Use Lanczos3 for reducing, Bicubic for upscaling
        width < originalSource.Width || height < originalSource.Height
            ? (IResampler)new LanczosResampler(3.0f)
            : new BicubicResampler();

    // Scale the entire image
    using var rescaled = new Image<Rgba32>(originalSource.Width, originalSource.Height);
    rescaled.Mutate(x => x.DrawImage(originalSource, new Point(0, 0), 1.0f).Resize(width, height, Sampler));
    scaled.Mutate(x => x.DrawImage(rescaled, new Point((scaled.Width - width) / 2, (scaled.Height - height) / 2), new GraphicsOptions()));

    // Take tiles from it
    Enumerable.Range(0, tiles).SelectMany(x => Enumerable.Range(0, tiles).Select(y => new { x, y }))
        .AsParallel().WithDegreeOfParallelism(8).ForAll((c) =>
        {
            using var tile = new Image<Rgba32>(tileSize, tileSize);
            lock (scaled)
                tile.Mutate(x =>
                    x.DrawImage(
                        scaled.Clone(i =>
                            i.Crop(new Rectangle(c.x * tileSize, c.y * tileSize, tileSize, tileSize))),
                        new Point(0, 0), new GraphicsOptions()));

            var Variables = new Dictionary<string, int>(StringComparer.InvariantCultureIgnoreCase)
                { { "z", zoom }, { "x", c.x }, { "y", c.y } };

            var Filename = Regex.Replace(
                commandline.ContainsKey("filename") && commandline["filename"].Length > 0
                    ? commandline["filename"].First()
                    : $"{sourceFile}-tiles{Path.DirectorySeparatorChar}{{z}}_{{x}}_{{y}}.png",
                @"{(?<var>[^}]+)}", new MatchEvaluator(m => $"{Variables[m.Groups["var"].Value]}"));

            var OutputDirectory = Path.GetDirectoryName(Filename);

            if (OutputDirectory != null && !Directory.Exists(OutputDirectory))
                Directory.CreateDirectory(OutputDirectory);

            tile.Save(Filename);
        });
}