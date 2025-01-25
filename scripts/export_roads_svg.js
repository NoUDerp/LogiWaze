require.extensions['.geojson'] = require.extensions['.json'];
const geojson = require('../Roads.json');

// set the line width
const zoom = 7;
const width = .3;

const features = geojson.features;
process.stdout.write(`<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 -256 256 256\"><style type=\"text/css\">.road{fill:none; stroke-width: ${width};}\n .tier-1,.tier-4 {stroke:#5a9565}\n .tier-2,.tier-5{stroke:#94954e}\n .tier-3,.tier-6{stroke:#957458}</style>`);
for(let i=0; i<features.length; i++)
{
	const feature = features[i];
	if(feature.type === "Feature" && feature.properties.tier !== undefined)
	{
		const tier = feature.properties.tier;
		const coordinates_set = feature.geometry.coordinates;
		process.stdout.write("<polyline stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"road tier-");
                process.stdout.write((tier+1).toString());
                process.stdout.write("\" points=\"");
                let first = true;
		
		for(let j=0; j<coordinates_set.length; j++)
		{
			const coord = coordinates_set[j];
			if(!first)
				process.stdout.write(" ");
			process.stdout.write(coord[0].toString());
			process.stdout.write(",");
			process.stdout.write((-coord[1]-256).toString());
			
			first = false;
		}
		process.stdout.write("\" />");
	}
}
process.stdout.write("</svg>");
