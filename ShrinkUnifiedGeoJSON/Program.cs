using System;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.IO;
using System.Linq;

namespace ShrinkUnifiedGeoJSON
{
    class Program
    {
        static void Main(string[] args)
        {
            JObject Source = JObject.Parse(System.IO.File.ReadAllText("Unified.geojson"));
            //foreach (var current_feature in (from feature in Source["features"] where !feature["geometry"].HasValues select feature).ToList()) // move the blank ones
            //  current_feature.Remove();
            foreach (var current_feature in from feature in Source["features"] where feature["geometry"].HasValues select (feature, geometry: feature["geometry"]))
                current_feature.geometry["coordinates"] = JArray.FromObject(
                    from coordinateset in current_feature.geometry.Value<JArray>("coordinates")
                    select JArray.FromObject(coordinateset.Where(x => !(x is JArray)).Select((coordinate_value, index) => (index % 2 == 0 ? 128.0 : -128.0) + Math.Round(double.Parse((string)coordinate_value) * 128.0 / 20037508.3427892439067364, 4))));
            using (StreamWriter file = File.CreateText("Unified.fitted-for-leaflet.geojson"))
            using (JsonTextWriter writer = new JsonTextWriter(file))
                Source.WriteTo(writer);
        }
    }
}
