const fs = require("fs") //file system

fs.readFile("/Prática/Node.js/1_Intro/2_Primeiro_módulo/arquivo.txt", "utf8", (err, data) => {
  if (err) {
    console.log(err)
  }

  console.log(data)
})
