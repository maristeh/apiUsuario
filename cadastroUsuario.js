const express = require('express')
const app = express()
const port = process.env.PORT
const cors = require("cors")

app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cors())

const sqlite = require('sqlite3').verbose();
let sql;

let db= new sqlite.Database('./user.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE, (err) => {
    if (err && err.code == "SQLITE_CANTOPEN") {
        createDatabase();
        return;
        } else if (err) {
            console.log("Getting error " + err);
            exit(1);
    }
});

// sql = `create table user (
//     user_id int primary key not null,
//     user_nome text not null,
//     user_nascimento text not null,
//     user_sexo text not null,
//     user_email text not null,
//     user_rua text not null,
//     user_numero int not null,
//     user_complemento text,
//     user_bairro text not null,
//     user_cidade text not null,
//     user_estado text not null,
//     user_cep text not null
// );`;
// db.run(sql);

app.post('/usuarios', (req, res) => {
    var usuario = {
        nome: req.body.nome,
        dataNascimento: req.body.dataNascimento,
        sexo: req.body.sexo,
        email: req.body.email,
        rua: req.body.rua,
        numero: req.body.numero,
        complemento: req.body.complemento,
        bairro: req.body.bairro,
        cidade: req.body.cidade,
        estado: req.body.estado,
        cep: req.body.cep
    }

    var emailPattern =  /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
    var emailValido = emailPattern.test(usuario.email);
    if(!emailValido){
        return res
            .status(400)
            .send({ message: "Email inválido" });
    } 

    var tempo = Math.abs(Date.now() - new Date(usuario.dataNascimento).getTime());
    var idade = Math.floor((tempo / (1000 * 3600 * 24))/365.25);
    if (idade < 18) {
        return res
            .status(412)
            .send({ message: "Não é possível cadastrar usuário menor de 18 anos" });
    }

    var id = Math.floor(Math.random() * 100);

    sql = `insert into user (user_id, user_nome, user_nascimento, user_sexo, user_email, user_rua, user_numero, user_complemento, user_bairro, user_cidade, user_estado, user_cep)
        values (?,?,?,?,?,?,?,?,?,?,?,?);`;
    db.run(sql,[id, usuario.nome, usuario.dataNascimento, usuario.sexo, usuario.email, usuario.rua, usuario.numero, usuario.complemento, usuario.bairro, usuario.cidade,usuario.estado,usuario.cep], (err)=>
    {
        if(err){
            console.log(err)
            return res.status(500).send({
                message: "Erro ao inserir o usuário",
                err: err.message,
              });
        }
    })

    res.status(201).send({
        message:'endpoint cadastro de contatos',
        usuarioEnviado: usuario
    })
})

function createDatabase() {
    var newdb = new sqlite.Database('user.db', (err) => {
        if (err) {
            console.log("Getting error " + err);
            exit(1);
        }
    });
}

app.listen(port, ()=> {
    console.log(`executando em http://localhost:${port}`)
})