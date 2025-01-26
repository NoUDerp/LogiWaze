#!/usr/bin/env node

const APIManager = require('./src/API.js').API;
var shard = null;
const yargs = require('yargs')(process.argv.slice(2));
const zlib = require('zlib');
const argv = yargs
    .option('output', {
        alias: 'o',
        description: 'Selects the output file',
        type: 'string',
    })
    .help()
    .demandOption(['output'])
    .argv;

function pad2(n) { return n < 10 ? '0' + n : n }
var date = new Date();
var stamp = date.getUTCFullYear().toString() + pad2(date.getUTCMonth() + 1) + pad2(date.getUTCDate()) + pad2(date.getUTCHours()) + pad2(date.getUTCMinutes());

APIManager.update(() => setTimeout(() => {
	
	stamp = 'WC'.concat(APIManager.war.warNumber.toString()).concat('-').concat(stamp);
	delete APIManager.variogram; zlib.brotliCompress(Buffer.from(JSON.stringify(APIManager), 'utf-8'), { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY, } }, (err, buffer) => require('fs').writeFileSync(argv.output.replace('%T', stamp), buffer)) }, 0), shard);

