/* eslint-disable no-console*/
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var TRANSLATIONS_DIR = './languages/translations/';

var copyFromPath = process.argv[2];
var copyToPath = process.argv[3];

fs.readdirSync(TRANSLATIONS_DIR)
  .filter((fileName) => fileName !== 'en.json')
  .forEach((fileName) => {
      console.log('updating ' + fileName);
      var filePath = path.resolve(TRANSLATIONS_DIR + fileName);
      var file = fs.readFileSync(filePath);
      var json = JSON.parse(file);

      var from = _.get(json, copyFromPath);
      if (from) {
          _.set(json, copyToPath, from);
      }

      fs.writeFileSync(filePath, JSON.stringify(json, null, 4) + '\n');
  });
