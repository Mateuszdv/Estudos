//modulos externos
const inquirer = require("inquirer")
const chalk = require("chalk")

//modulos internos
const fs = require("fs")
const { create } = require("domain")
const { parse } = require("path")

console.log("Iniciamos o Accounts")

operation()

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
          "Criar Conta",
          "Consultar Saldo",
          "Depositar",
          "Transferir",
          "Sacar",
          "Exibir extrato",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"]

      if (action === "Criar Conta") {
        createAccount()
      } else if (action === "Consultar Saldo") {
        getAccountBalance()
      } else if (action === "Depositar") {
        deposit()
      } else if (action === "Transferir") {
        transfer()
      } else if (action === "Exibir extrato") {
        transactionHistory()
      } else if (action === "Sacar") {
        withdraw()
      } else if (action === "Sair") {
        console.log(chalk.bgBlue.black("Obrigado por usar o Accounts"))
        process.exit()
      }
    })
    .catch((err) => console.log(err))
}

// create an account
function createAccount() {
  console.log(chalk.bgGreen.black("Parabéns por escolher o nosso banco"))
  console.log(chalk.green("Defina as opções da sua conta a seguir"))

  buildAccount()
}

function buildAccount() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite um nome para a sua conta:",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"]
      console.info(accountName)

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts")
      }

      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
          chalk.bgRed.black("Esta conta já existe, escolha outro nome.")
        )
        buildAccount()
        return
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{ "balance": 0, "transactions": []}',
        function (err) {
          console.log(err)
        }
      )

      console.log(chalk.green("Parabéns, a sua conta foi criada."))
      operation()
    })
    .catch((err) => console.log(err))
}

//add an amount to user account
function deposit() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"]

      //verify if account exists
      if (!checkAccount(accountName)) {
        return deposit()
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja depositar? ",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"]

          //add an amount
          addAmount(accountName, amount)
          operation()
        })
        .catch((err) => console.log(err))
    })
    .catch((err) => console.log(err))
}

function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.bgRed.black("Esta conta não existe, escolha outro nome"))
    return false
  }
  return true
}

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName)
  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!")
    )
    return deposit()
  }
  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)
  accountData.transactions.push({ type: "deposit", amount: parseFloat(amount) })

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err)
    }
  )

  console.log(
    chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`)
  )
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf8",
    flag: "r",
  })
  return JSON.parse(accountJSON)
}

// show account balance
function getAccountBalance() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"]

      //verify if account exists
      if (!checkAccount(accountName)) {
        return getAccountBalance()
      }

      const accountData = getAccount(accountName)

      console.log(
        chalk.bgBlue.black(
          `Olá, o saldo da sua conta é de R$${accountData.balance}`
        )
      )
      operation()
    })
    .catch((err) => console.log(err))
}

// withdraw an amount from user account
function withdraw() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"]

      if (!checkAccount(accountName)) {
        return withdraw()
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja sacar?",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"]
          removeAmount(accountName, amount)
        })
        .catch((err) => console.log(err))
    })
    .catch((err) => console.log(err))
}

function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName)

  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!")
    )
    return withdraw()
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black("Valor indisponível!"))
    return withdraw()
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)
  accountData.transactions.push({
    type: "withdrawal",
    amount: parseFloat(amount),
  })

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err)
    }
  )

  console.log(
    chalk.green(`Foi realizado um saque de R$${amount} da sua conta!`)
  )
  operation()
}

// transfer between two accounts
function transfer() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual a sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"]

      if (!checkAccount(accountName)) {
        return transfer()
      }
      inquirer
        .prompt([
          {
            name: "accountName2",
            message: "Para qual conta deseja transferir?",
          },
        ])
        .then((answer) => {
          const accountName2 = answer["accountName2"]

          if (!checkAccount(accountName2)) {
            return transfer()
          }
          inquirer
            .prompt([
              {
                name: "amount",
                message: `Quanto deseja transferir da conta ${accountName} para a conta ${accountName2}`,
              },
            ])
            .then((answer) => {
              const amount = answer["amount"]
              transferAmount(accountName, accountName2, amount)
            })
            .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
    })
    .catch((err) => console.log(err))
}

function transferAmount(accountName, accountName2, amount) {
  const accountData = getAccount(accountName)
  const account2Data = getAccount(accountName2)

  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!")
    )
    return transfer()
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black("Valor indisponível!"))
    return transfer()
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)
  account2Data.balance = parseFloat(account2Data.balance) + parseFloat(amount)

  accountData.transactions.push({
    type: "transfer out",
    amount: parseFloat(amount),
    toAccount: accountName2,
  })
  account2Data.transactions.push({
    type: "transfer in",
    amount: parseFloat(amount),
    fromAccount: accountName,
  })

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err)
    }
  )
  fs.writeFileSync(
    `accounts/${accountName2}.json`,
    JSON.stringify(account2Data),
    function (err) {
      console.log(err)
    }
  )
  console.log(
    chalk.green(
      `Foi realizado uma transferência de R$${amount} da sua conta para a conta ${accountName2}`
    )
  )
  operation()
}

// Transaction History
function transactionHistory() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite o nome da conta!",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"]
      if (!checkAccount(accountName)) {
        return transactionHistory()
      }

      displayTransactionHistory(accountName)
    })
    .catch((err) => console.log(err))
}

function displayTransactionHistory(accountName) {
  const accountData = getAccount(accountName)

  console.log(
    chalk.bgYellow.black(`Extrato de transações para a conta: ${accountName}`)
  )

  if (accountData.transactions.length === 0) {
    console.log(chalk.yellow("Nenhuma transação registrada."))
  } else {
    console.log("Transações:")
    accountData.transactions.forEach((transaction, index) => {
      let transactionInfo = `  ${index + 1}. Tipo: ${
        transaction.type
      }, Valor: R$${transaction.amount}`
      if (transaction.toAccount) {
        transactionInfo += `, Transferência para: ${transaction.toAccount}`
      }
      if (transaction.fromAccount) {
        transactionInfo += `, Transferência de: ${transaction.fromAccount}`
      }
      if (
        transaction.type === "deposit" ||
        transaction.type === "transfer in"
      ) {
        console.log(chalk.green(transactionInfo))
      } else if (
        transaction.type === "withdrawal" ||
        transaction.type === "transfer out"
      ) {
        console.log(chalk.red(transactionInfo))
      } else {
        console.log(transactionInfo)
      }
    })
  }
  operation()
}
