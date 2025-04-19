const roads = require('../Roads.json');

let road_sources;

onmessage = (e) => {
    const context = e.data as { operation: string, arguments: any };
    switch (context.operation) {
        case "roads": // draw roads
        {
            const args = context.arguments as {
                coords: { x: number, y: number, z: number },
                grid_depth: number,
                offset,
                roadWidth,
                controlWidth,
                grid_x_size,
                grid_y_size,
                controls,
                pixelScale,
                width: number,
                height: number
            };

            const canvas = new OffscreenCanvas(args.width, args.height);
            const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;

            ctx.fillStyle = "#FFFFFF00";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            //drawRoads(args.tile, ctx, args.coords, args.grid_depth, args.sources, args.offset, args.roadWidth, args.controlWidth, args.grid_x_size, args.grid_y_size, args.controls, args.pixelScale);

            //async function drawRoads(tile: OffscreenCanvas, ctx : OffscreenCanvasRenderingContext2D, coords, grid_depth: number, sources, offset, roadWidth, controlWidth, grid_x_size, grid_y_size, controls, pixelScale) {
            ctx.lineJoin = 'miter';
            ctx.lineCap = 'round';

            const scale = Math.pow(2, args.grid_depth - args.coords.z);
            const start_x = Math.floor(args.coords.x * scale);
            const start_y = Math.floor(args.coords.y * scale);

            const end_x = Math.ceil((args.coords.x + 1) * scale);
            const end_y = Math.ceil((args.coords.y + 1) * scale);

            const depth_inverse = Math.pow(2, args.coords.z);
            const innerWidth = args.controlWidth * depth_inverse;

            function draw(start_x: number, start_y: number, end_x: number, end_y: number) {
                ctx.lineWidth = innerWidth;
                const colors = ['#516C4B', '#235683', '#303030', '#CCCC44'];

                for (let y = start_y; y <= end_y; y++)
                    for (let x = start_x; x <= end_x; x++, i = 0)
                        if (x >= 0 && y >= 0 && x < args.grid_x_size && y < args.grid_y_size) {
                            for (let i = 0; i < road_sources[x][y].length; i++) {
                                const j = road_sources[x][y][i];
                                if (args.controls[0]) {
                                    ctx.strokeStyle = colors[j.options.control];
                                    ctx.beginPath();
                                    const coordsx = args.coords.x * args.width / args.pixelScale;
                                    const coordsy = args.coords.y * args.height / args.pixelScale;
                                    const x1 = (j.points[0][1] + args.offset[0]) * depth_inverse - coordsx;
                                    const y1 = (j.points[0][0] + args.offset[1]) * depth_inverse - coordsy;
                                    const x2 = (j.points[1][1] + args.offset[0]) * depth_inverse - coordsx;
                                    const y2 = (j.points[1][0] + args.offset[1]) * depth_inverse - coordsy;
                                    ctx.moveTo(x1, y1);
                                    ctx.lineTo(x2, y2);
                                    ctx.stroke();
                                }
                            }
                        }
            }

            draw(start_x, start_y, end_x, end_y);


            const bitmap = canvas.transferToImageBitmap();
            postMessage({bitmap}, null, [bitmap]);


            break;
        }
        case "initialize":
        {
            road_sources = context.arguments.roads;
            break;
        }
    }
}