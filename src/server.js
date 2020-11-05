const express = require("express")
const server = express()

// Pegar banco de dados
const db = require("./database/db")

//utilizando template engine
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})

// configurar pasta public
server.use(express.static("public"))

// Habilitar uso do req.body na aplicação
server.use(express.urlencoded({ extended: true }))


// configurar rotas da aplicação
// pagina inicial

server.get("/", (req, res) => {
    return res.render("index.html")
})

server.get("/create-point", (req, res) => {

    // req.query: Query Strings da nossa url

    return res.render("create-point.html")
})

server.post("/savepoint", (req, res) => {
    //req.body: O corpo do formulário
    // console.log(req.body)

    //Inserir dados no banco de dados
    const query = `
        INSERT INTO places (
            image,
            name,
            address,
            address2,
            state,
            city,
            items
        ) VALUES (?,?,?,?,?,?,?);
    `

    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
    ]

    function afterInsertData(err) {
        if(err) {
            console.log(err)
            return res.send("Erro no cadastro!")
        }

        console.log("cadastrado com sucesso!")
        console.log(this)

        return res.render("create-point.html", { saved: true })
    }

    db.run(query, values, afterInsertData)

})

server.get("/search", (req, res) => {
    const search = req.query.search

    if(search == "") {
        // pesquisa vazia
        return res.render("search-results.html", { total: 0 })
    }

    // Pegar os dados do banco de dados
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err, rows) {
        if(err) {
            return console.log(err)
        }

        const total = rows.length

        //Mostrar a pg html com os dados do banco de dados
        return res.render("search-results.html", { places: rows, total })
    })
})

//ligar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));