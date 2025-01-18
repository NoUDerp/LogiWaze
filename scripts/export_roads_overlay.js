import sharp from 'sharp';

try {
    const args = process.argv.slice(2);
    const map = await sharp(args[1]).toBuffer({resolveWithObject: true});
    const {data} = await sharp(args[0]).resize( map.info.width, map.info.height).toBuffer({resolveWithObject: true}); // 11264, 12432 
    await sharp(map.data).composite([{input:data}]).png().toFile(args[2]);
} catch (err) {
    console.log(err)

}
