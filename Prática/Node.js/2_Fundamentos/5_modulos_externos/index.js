const minimist = require("minimist")

const args =  minimist(process.argv.slice(2))

console.log(args)

const nome = args["nome"]
const idade = args["idade"]

console.log(nome, idade)

console.log(`O nome é ${nome} e possui ${idade} anos`)