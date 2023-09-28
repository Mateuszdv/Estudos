const http = require("http")

const port = 3333

const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader("content-type", "text/html")
  res.end(
    "<h1>Olá, este é meu primeiro server com HTML!</h1><p>Testando Atualização</p>"
  )
})

server.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})
