using System;
using System.Threading.Tasks;
using System.Xml.Linq;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Drawing.Processing;
using System.Net.Http;
using System.Collections.Generic;
using SixLabors.ImageSharp.Memory;
using System.IO;

namespace Stitcher
{
    class Program
    {
        static async Task Main(string[] args)
        {
            var model = XDocument.Load(File.OpenRead(args[0]));
            float? forcewidth = model.Root.Attribute("force-width") != null ? (float)model.Root.Attribute("force-width")! : null;
            float? forceheight = model.Root.Attribute("force-height") != null ? (float)model.Root.Attribute("force-height")! : null;
            float? forcex = model.Root.Attribute("force-x") != null ? (float)model.Root.Attribute("force-x")! : null;
            float? forcey = model.Root.Attribute("force-y") != null ? (float)model.Root.Attribute("force-y")! : null;

            var W = (int)Math.Round((float)(model.Root!.Attribute("width")!) * forcewidth ?? 1);
            var H = (int)Math.Round((float)(model.Root!.Attribute("height")!) * forceheight ?? 1);
            using var output = new Image<RgbaVector>(W, H);
            output.Mutate(i => i.Clear(Color.Transparent));
            await foreach (var map in GetImages(model.Root.Elements("map"), .5f * W, .5f * H, forcewidth, forceheight, forcex, forcey))
            {
                var x = (int)Math.Round(map.X);
                var y = (int)Math.Round(map.Y);
                map.Image.Mutate(i => i.Transform(new AffineTransformBuilder().AppendTranslation(new PointF(map.X - x, map.Y - y))));
                output.Mutate(i => i.DrawImage(map.Image, new Point(x, y), new GraphicsOptions() { Antialias = true, AlphaCompositionMode = PixelAlphaCompositionMode.SrcOver, ColorBlendingMode = PixelColorBlendingMode.Normal }));
                map.Image.Dispose();
            }

            await using var stdout = File.OpenWrite(args[1]);// Console.OpenStandardInput();
            await output.SaveAsPngAsync(stdout);
        }

        static async IAsyncEnumerable<(Image Image, float X, float Y)> GetImages(IEnumerable<XElement> maps, float offsetX, float offsetY, float? forceImageWidth = null, float? forceImageHeight = null, float? forceX = null, float? forceY = null)
        {
            using var client = new HttpClient();
            foreach (var s in maps)
            {
                var url = new Uri(s.Value, UriKind.RelativeOrAbsolute);
                var stream = !url.IsFile ? await client.GetStreamAsync(url) : File.OpenRead("." + url.LocalPath);
                using var image = await Image<RgbaVector>.LoadAsync(stream);
                var image2 = Mask2(/*URL.LocalPath, */image, forceImageWidth ?? image.Width, forceImageHeight ?? image.Height, forceX, forceY);
                // better to transform the decimal value and offset the whole numbers (for memory use)
                yield return (image2, (float)s.Attribute("x")! * (forceImageWidth ?? image.Width) + offsetX - (forceImageWidth ?? image.Width) * .5f, -(float)s.Attribute("y")! * (forceImageHeight ?? image.Height) + offsetY - (forceImageHeight ?? image.Height) * .5f);
            }
        }
        static Image<Rgba64> Mask2(Image Image, float Width, float Height, float? X = null, float? Y = null)
        {
            var OffsetX = X ?? (Image.Width - Width) * .5f;
            var OffsetY = Y ?? (Image.Height - Height) * .5f;
            using var Temp = new Image<RgbaVector>(Image.Width, Image.Height);

            var Shape = new PointF[] {new PointF(OffsetX, Height * .5f + OffsetY), new PointF(Width * .25f + OffsetX, OffsetY), // 2
                    new PointF(Width * .75f + OffsetX, OffsetY), new PointF(Width + OffsetX, Height * .5f + OffsetY), // 4
                    new PointF(Width * .75f + OffsetX, Height + OffsetY), new PointF(Width * .25f + OffsetX, Height + OffsetY) }; // 6

            Temp.Mutate(x =>
                x.Clear(Color.Transparent).
                FillPolygon(
                    new DrawingOptions()
                    {
                        GraphicsOptions = new GraphicsOptions()
                        {
                            Antialias = true,
                            AlphaCompositionMode = PixelAlphaCompositionMode.Src,
                            ColorBlendingMode = PixelColorBlendingMode.Normal
                        }
                    },
                    Color.White,
                    Shape).
                    DrawPolygon(
                    new DrawingOptions()
                    {
                        GraphicsOptions = new GraphicsOptions()
                        {
                            Antialias = true,
                            AlphaCompositionMode = PixelAlphaCompositionMode.SrcOver,
                            ColorBlendingMode = PixelColorBlendingMode.Normal
                        }
                    },
                    Color.White,
                    2.0f,
                    Shape).
                DrawImage(Image, new GraphicsOptions() { AlphaCompositionMode = PixelAlphaCompositionMode.SrcIn })
                );

            Image.Mutate(x => x.Clear(Color.Transparent).DrawImage(Temp, new GraphicsOptions()));
            var Final = new Image<Rgba64>(Image.Width, Image.Height);
            Final.Mutate(x => x.DrawImage(Image, new GraphicsOptions() { AlphaCompositionMode = PixelAlphaCompositionMode.Src }));
            //Final.SaveAsPng($"cropped/{Name.Replace("/height/", "")}");
            return Final;
        }
        static Image<Rgba64> Mask(string Name, Image Image, float Width, float Height, float? X = null, float? Y = null)
        {
            var OffsetX = X ?? (Image.Width - Width) * .5f;
            var OffsetY = Y ?? (Image.Height - Height) * .5f;
            using var Temp = new Image<RgbaVector>(Image.Width, Image.Height);

            var Shape = new PointF[] {new PointF(OffsetX, Height * .5f + OffsetY), new PointF(Width * .25f + OffsetX, OffsetY), // 2
                    new PointF(Width * .75f + OffsetX, OffsetY), new PointF(Width + OffsetX, Height * .5f + OffsetY), // 4
                    new PointF(Width * .75f + OffsetX, Height + OffsetY), new PointF(Width * .25f + OffsetX, Height + OffsetY) }; // 6

            Temp.Mutate(x =>
                x.Clear(Color.Transparent).
                FillPolygon(
                    new DrawingOptions()
                    {
                        GraphicsOptions = new GraphicsOptions()
                        {
                            Antialias = true,
                            AlphaCompositionMode = PixelAlphaCompositionMode.Src,
                            ColorBlendingMode = PixelColorBlendingMode.Normal
                        }
                    },
                    Color.White,
                    Shape).
                    DrawPolygon(
                    new DrawingOptions()
                    {
                        GraphicsOptions = new GraphicsOptions()
                        {
                            Antialias = true,
                            AlphaCompositionMode = PixelAlphaCompositionMode.SrcOver,
                            ColorBlendingMode = PixelColorBlendingMode.Normal
                        }
                    },
                    Color.White,
                    2.0f,
                    Shape).
                DrawImage(Image, new GraphicsOptions() { AlphaCompositionMode = PixelAlphaCompositionMode.SrcIn })
                );

            Image.Mutate(x => x.Clear(Color.Transparent).DrawImage(Temp, new GraphicsOptions()));
            var Final = new Image<Rgba64>(Image.Width, Image.Height);
            Final.Mutate(x => x.DrawImage(Image, new GraphicsOptions() { AlphaCompositionMode = PixelAlphaCompositionMode.Src }));
            Final.SaveAsPng($"cropped/{Name.Replace("/height/", "")}");
            return Final;
        }
    }
}
