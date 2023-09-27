const fs = require("fs")

console.log("Inicio")

fs.writeFile("async.txt", "oi", function(err) {
  setTimeout(function() {
    console.log("arquivo criado")
  }, 1000);
})

console.log("Fim")