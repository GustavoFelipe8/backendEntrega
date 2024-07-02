const express = require("express");
const { Client } = require('pg');
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

var conString = config.urlConnection;
var client = new Client(conString);
client.connect(function (err) {
    if (err) {
        return console.error('Não foi possível conectar ao banco.', err);
    }
    client.query('SELECT NOW()', function (err, result) {
        if (err) {
            return console.error('Erro ao executar a query.', err);
        }
        console.log(result.rows[0]);
    });
});

app.get("/", (req, res) => {
    console.log("Response ok.");
    res.send("Ok – Servidor disponível.");
});

app.get("/usuario/:id", (req, res) => {
    try {
        console.log("Rota: usuario/" + req.params.id);
        client.query(
            "SELECT * FROM entrega WHERE id = $1", [req.params.id],
            (err, result) => {
                if (err) {
                    return console.error("Erro ao executar a qry de SELECT id", err);
                }
                res.send(result.rows);
            }
        );
    } catch (error) {
        console.log(error);
    }
});

app.post("/usuario", (req, res) => {
    try {
        console.log("Alguém enviou um post com os dados:", req.body);
        const { cpf, nome, cep, numero, complemento, produto } = req.body;
        client.query(
            "INSERT INTO entrega (cpf, nome, cep, numero, complemento, produto) VALUES ($1, $2, $3, $4, $5, $6) RETURNING * ", [cpf, nome, cep, numero, complemento, produto],
            (err, result) => {
                if (err) {
                    return console.error("Erro ao executar a qry de INSERT", err);
                }
                const { id } = result.rows[0];
                res.setHeader("id", `${id}`);
                res.status(201).json(result.rows[0]);
                console.log(result);
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});

app.put("/usuario/:id", (req, res) => {
    try {
        console.log("Alguém enviou um update com os dados:", req.body);
        const id = req.params.id;
        const { cpf, nome, cep, numero, complemento, produto } = req.body;
        client.query(
            "UPDATE entrega SET cpf=$1, nome=$2, cep=$3, numero=$4, complemento=$5, produto=$6 WHERE id =$7 ",
            [cpf, nome, cep, numero, complemento, produto, id],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de UPDATE", err);
                } else {
                    res.setHeader("id", id);
                    res.status(202).json({ "identificador": id });
                    console.log(result);
                }
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});

//Final do arquivo
app.listen(config.port, () =>
    console.log("Servidor funcionando na porta " + config.port)
);