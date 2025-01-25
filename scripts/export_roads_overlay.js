import sharp from 'sharp';
import fs from "fs";

try {
    const args = process.argv.slice(2);
    const svg = await sharp(args[0]).resize(11264, 12432).toBuffer({ resolveWithObject: true });
    const map = await sharp(args[1]) .toBuffer({ resolveWithObject: true });
    await map.composite([svg]).png().toFile(args[2]);
    console.log(info);
} catch (err) {
    console.log(err)
}
