const inquirer = require("inquirer")
const chalk = require("chalk")

try {
  inquirer
    .prompt([
      {
        name: "nome",
        message: "Qual o seu nome? ",
      },
      {
        name: "idade",
        message: "Qual a sua idade?",
      },
    ])
    .then((answers) => {
      if(!answers.nome || !answers.idade ) {
        throw new Error("O nome e idade são obrigatórios!")
      }
      console.log(
        chalk.bgYellow.black(
          `O nome é ${answers.nome} e sua idade é ${answers.idade}`
        )
      )
    })
} catch (err) {
  console.log(err)
}
