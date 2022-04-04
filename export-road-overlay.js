const sharp = require("sharp")

sharp("roads.svg")
  .png()
  .toFile("roads.png")
  .then(function(info) {
    console.log(info)
  })
  .catch(function(err) {
    console.log(err)
  })