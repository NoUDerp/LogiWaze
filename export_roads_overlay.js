const sharp = require("sharp")

sharp("Roads.svg")
  .png()
  .toFile("Roads.png")
  .then(function(info) {
    console.log(info)
  })
  .catch(function(err) {
    console.log(err)
  })