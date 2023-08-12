const sharp = require("sharp")

sharp("Roads.svg")
  .resize(11264, 12432)
  .png()
  .toFile("Roads.png")
  .then(function(info) {
    console.log(info)
  })
  .catch(function(err) {
    console.log(err)
  })
