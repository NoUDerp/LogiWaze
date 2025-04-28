using System.Text.Json;
using System.Numerics;

var roads = await JsonSerializer.DeserializeAsync<Roads>(Console.OpenStandardInput());

var angleTolerance = float.Parse(args[0]);
var distanceTolerance = float.Parse(args[1]);

var paths = new Dictionary<int, (PathSimplifier.Path Path, Properties Properties)>();

foreach(var r in roads.features)
    paths.Add(paths.Count, (new PathSimplifier.Path(paths.Count, r.geometry.coordinates.Select(c => new PathSimplifier.PathPoint(new Vector2(c[0], c[1]))).ToList()), r.properties));

var simplified = PathSimplifier.SimplifyPaths(paths.Values.Select(p => p.Path).ToList(), angleTolerance * 180f / MathF.PI, distanceTolerance);

var simplifiedPaths = simplified.Select(p => roads.features[p.PathId] switch { var m => m with { geometry =  m.geometry with { coordinates = p.Points.Select(c => new float[]{c.Position[0], c.Position[1]}).ToArray()} } });

roads = roads with { features = simplifiedPaths.ToArray() };

await using var file = Console.OpenStandardError();
await JsonSerializer.SerializeAsync(file, roads);

record struct Roads(string type, string name, CRS crs, Feature[] features);

record struct CRS(string type, props properties);

record struct props(string name);

record struct Feature(Properties properties, string type, Geometry geometry);

record struct Properties(string region, int tier);

record struct Geometry(string type, float[][] coordinates);

public static class PathSimplifier
{
    public class PathPoint
    {
        public Vector2 Position { get; set; }

        public PathPoint(Vector2 position)
        {
            Position = position;
        }
    }

    public class Path
    {
        public int PathId { get; set; }
        public List<PathPoint> Points { get; set; }

        public Path(int pathId, List<PathPoint> points)
        {
            PathId = pathId;
            Points = points;
        }
    }

    /// <summary>
    /// Simplifies a set of line paths by removing points where the angle change is less than angleToleranceRadians
    /// and where the resulting gap between points doesn't exceed distanceTolerance.
    /// Points that are shared between multiple paths are preserved.
    /// </summary>
    /// <param name="paths">List of paths, where each path has an ID and a list of points</param>
    /// <param name="angleToleranceRadians">Minimum angle change in radians required to keep a point</param>
    /// <param name="distanceTolerance">Maximum allowed distance between adjacent points after simplification</param>
    /// <returns>List of simplified paths</returns>
    public static List<Path> SimplifyPaths(
        List<Path> paths, 
        float angleToleranceRadians, 
        float distanceTolerance)
    {
        // Find shared points across different paths
        HashSet<Vector2> sharedPoints = FindSharedPoints(paths);
        
        // Create new list for simplified paths
        List<Path> simplifiedPaths = new List<Path>();
        
        // Process each path
        foreach (var path in paths)
        {
            if (path.Points.Count < 3)
            {
                // Paths with fewer than 3 points can't be simplified
                simplifiedPaths.Add(new Path(path.PathId, new List<PathPoint>(path.Points)));
                continue;
            }
            
            List<PathPoint> simplifiedPoints = new List<PathPoint>();
            simplifiedPoints.Add(path.Points[0]); // Always include the first point
            
            for (int i = 1; i < path.Points.Count - 1; i++)
            {
                Vector2 prevPoint = path.Points[i - 1].Position;
                Vector2 currentPoint = path.Points[i].Position;
                Vector2 nextPoint = path.Points[i + 1].Position;
                
                // Always keep shared points
                if (sharedPoints.Contains(currentPoint))
                {
                    simplifiedPoints.Add(path.Points[i]);
                    continue;
                }
                
                // Check angle between segments
                Vector2 prevVector = Vector2.Normalize(currentPoint - prevPoint);
                Vector2 nextVector = Vector2.Normalize(nextPoint - currentPoint);
                
                float dotProduct = Vector2.Dot(prevVector, nextVector);
                // Clamp dotProduct to valid range for acos
                dotProduct = Math.Clamp(dotProduct, -1.0f, 1.0f);
                float angle = (float)Math.Acos(dotProduct);
                
                // Check potential distance if this point is removed
                float distanceBetweenAdjacentPoints = Vector2.Distance(prevPoint, nextPoint);
                
                // Keep point if angle is significant or if removing it would create too large a gap
                if (angle > angleToleranceRadians || distanceBetweenAdjacentPoints > distanceTolerance)
                {
                    simplifiedPoints.Add(path.Points[i]);
                }
            }
            
            simplifiedPoints.Add(path.Points[path.Points.Count - 1]); // Always include the last point
            simplifiedPaths.Add(new Path(path.PathId, simplifiedPoints));
        }
        
        return simplifiedPaths;
    }
    
    /// <summary>
    /// Finds points that are shared between multiple paths
    /// </summary>
    private static HashSet<Vector2> FindSharedPoints(List<Path> paths)
    {
        Dictionary<Vector2, int> pointCounts = new Dictionary<Vector2, int>();
        
        // Count occurrences of each point
        foreach (var path in paths)
        {
            foreach (var point in path.Points)
            {
                if (pointCounts.ContainsKey(point.Position))
                {
                    pointCounts[point.Position]++;
                }
                else
                {
                    pointCounts[point.Position] = 1;
                }
            }
        }
        
        // Return points that appear in more than one path
        return new HashSet<Vector2>(
            pointCounts.Where(kvp => kvp.Value > 1)
                      .Select(kvp => kvp.Key));
    }
}
// public static class CatmullRomSpline
// {
//     /// <summary>
//     /// Calculates a point on a Catmull-Rom spline at a given t value.
//     /// </summary>
//     /// <param name="points">The control points defining the spline.</param>
//     /// <param name="t">Normalized parameter between 0 and 1 representing position along the entire spline.</param>
//     /// <param name="alpha">Tension parameter (0 = uniform, 0.5 = centripetal, 1.0 = chordal).</param>
//     /// <returns>The point on the spline at parameter t.</returns>
//     public static Vector2 GetPointOnSpline(List<Vector2> points, float t, float alpha = 0.5f)
//     {
//         if (points == null || points.Count < 2)
//             throw new ArgumentException("At least 2 points are required to define a spline.");
//
//         // Handle edge cases for t = 0 and t = 1 to ensure the spline passes through first and last points
//         if (t <= 0)
//             return points[0];
//         if (t >= 1)
//             return points[points.Count - 1];
//
//         // Calculate the total length of the spline
//         List<float> cumulativeDistances = CalculateCumulativeDistances(points);
//         float totalDistance = cumulativeDistances[cumulativeDistances.Count - 1];
//
//         // Convert t to actual distance along the spline
//         float targetDistance = t * totalDistance;
//
//         // Find the segment that contains the point
//         int segmentIndex = 0;
//         for (int i = 0; i < cumulativeDistances.Count - 1; i++)
//         {
//             if (targetDistance <= cumulativeDistances[i + 1])
//             {
//                 segmentIndex = i;
//                 break;
//             }
//         }
//
//         // Calculate the local t value within the segment
//         float segmentStart = cumulativeDistances[segmentIndex];
//         float segmentEnd = cumulativeDistances[segmentIndex + 1];
//         float localT = (targetDistance - segmentStart) / (segmentEnd - segmentStart);
//
//         // Get the four control points needed for the Catmull-Rom calculation
//         Vector2 p0, p1, p2, p3;
//         
//         p1 = points[segmentIndex];
//         p2 = points[segmentIndex + 1];
//         
//         // Handle edge cases for first and last segments
//         if (segmentIndex == 0)
//         {
//             // For the first segment, duplicate the first point for p0
//             p0 = 2 * p1 - p2;
//         }
//         else
//         {
//             p0 = points[segmentIndex - 1];
//         }
//         
//         if (segmentIndex == points.Count - 2)
//         {
//             // For the last segment, duplicate the last point for p3
//             p3 = 2 * p2 - p1;
//         }
//         else
//         {
//             p3 = points[segmentIndex + 2];
//         }
//
//         // Calculate the point using the Catmull-Rom formula
//         return CalculateCatmullRomPoint(p0, p1, p2, p3, localT, alpha);
//     }
//
//     /// <summary>
//     /// Calculates the cumulative distances along the skeletal points.
//     /// </summary>
//     /// <param name="points">The skeletal points.</param>
//     /// <returns>A list of cumulative distances, starting from 0.</returns>
//     public static List<float> CalculateCumulativeDistances(List<Vector2> points)
//     {
//         List<float> distances = new List<float> { 0 }; // Start with 0
//         float cumulativeDistance = 0;
//
//         for (int i = 1; i < points.Count; i++)
//         {
//             cumulativeDistance += Vector2.Distance(points[i - 1], points[i]);
//             distances.Add(cumulativeDistance);
//         }
//         
//         return distances;
//     }
//
//     /// <summary>
//     /// Calculates a point on a Catmull-Rom spline segment using four control points.
//     /// </summary>
//     /// <param name="p0">First control point</param>
//     /// <param name="p1">Second control point (start of segment)</param>
//     /// <param name="p2">Third control point (end of segment)</param>
//     /// <param name="p3">Fourth control point</param>
//     /// <param name="t">Parameter between 0 and 1</param>
//     /// <param name="alpha">Tension parameter (0 = uniform, 0.5 = centripetal, 1.0 = chordal)</param>
//     /// <returns>The interpolated point</returns>
//     private static Vector2 CalculateCatmullRomPoint(Vector2 p0, Vector2 p1, Vector2 p2, Vector2 p3, float t, float alpha)
//     {
//         // Convert to matrix form
//         float t2 = t * t;
//         float t3 = t2 * t;
//
//         // Catmull-Rom basis matrix coefficients
//         float b0 = -alpha * t3 + 2 * alpha * t2 - alpha * t;
//         float b1 = (2 - alpha) * t3 + (alpha - 3) * t2 + 1;
//         float b2 = (alpha - 2) * t3 + (3 - 2 * alpha) * t2 + alpha * t;
//         float b3 = alpha * t3 - alpha * t2;
//
//         // Calculate the point using the basis functions
//         return b0 * p0 + b1 * p1 + b2 * p2 + b3 * p3;
//     }
//
//     /// <summary>
//     /// Generate points along the entire Catmull-Rom spline with a specified step size.
//     /// </summary>
//     /// <param name="points">The control points defining the spline.</param>
//     /// <param name="numSamples">Number of points to generate along the spline.</param>
//     /// <param name="alpha">Tension parameter (0 = uniform, 0.5 = centripetal, 1.0 = chordal).</param>
//     /// <returns>A list of points along the spline.</returns>
//     public static List<Vector2> GenerateSplineCurve(List<Vector2> points, int numSamples, float alpha = 0.5f)
//     {
//         List<Vector2> curvePoints = new List<Vector2>();
//         
//         if (points == null || points.Count < 2)
//             return curvePoints;
//
//         // Always include the first point
//         curvePoints.Add(points[0]);
//         
//         // If numSamples is 2, we only want the start and end points
//         if (numSamples == 2)
//         {
//             curvePoints.Add(points[points.Count - 1]);
//             return curvePoints;
//         }
//         
//         // Generate intermediate points (excluding first and last)
//         float step = 1.0f / (numSamples - 1);
//         
//         for (int i = 1; i < numSamples - 1; i++)
//         {
//             float t = i * step;
//             curvePoints.Add(GetPointOnSpline(points, t, alpha));
//         }
//         
//         // Always include the last point
//         curvePoints.Add(points[points.Count - 1]);
//         
//         return curvePoints;
//     }
// }