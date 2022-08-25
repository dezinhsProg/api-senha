const express = require('express');
var cors = require('cors');

const bcrypt = require('bcryptjs');
const app = express();
const User = require('./models/Users');
const path = require('path');
const port = 3030
app.use(express.json());
app.use(express.urlencoded({ extended: true}))
app.use('/files', express.static(path.join(__dirname, "public", "upload")));

app.use( (req, res, next) =>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    app.use(cors());
    next();
})
app.get("/", function (request, response) {
    response.send("Serviço API Rest iniciada...");
})
app.get("/users", async (req, res) =>{    
    await User.findAll({
        attributes: ['id', 'name', 'email', 'password'],
        order:[['id', 'ASC']]
    })
    .then( (users) =>{
        return res.json({
            erro: false,
            users
        });
    }).catch( (err) => {
        return res.status(400).json({
            erro: true,
            mensagem: `Erro: ${err} ou Nenhum Usuário encontrado!!!`
        })
    })


})
app.get('/user/show:id', async (req, res) => {
    const { id } = req.params;
    try {
        // await User.findAll({ where: {id: id}})
        const users = await User.findByPk(id);
        if(!users){
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Nenhum Usuário encontrado!"
            })
        }
        res.status(200).json({
            erro:false,
            users
        })
    } catch (err){
        res.status(400).json({
            erro: true,
            mensagem: `Erro: ${err}`
        })
    }
});
app.post("/Create",  async (req, res) => {
    var dados = req.body;
    dados.password = await bcrypt.hash(dados.password, 8);
   
    await User.create(dados)
    .then( ()=>{
        return res.status(201).json({
            erro: false,
            mensagem: 'Usuário cadastrado com sucesso!'
        });
    }).catch( (err)=>{
        return res.status(400).json({
            erro:true,
            mensagem: `Erro: Usuário não cadastrado... ${err}`
        })
    })
})
app.post("/login", async (req, res) => {
    
    const user = await User.findOne({
        attributes: ['id', 'name', 'email', 'password'],
        where: {
            email: req.body.email
        }
    })
    if(user === null){
        return res.status(400).json({
            erro: true,
            mensagem:"Erro: Email ou senha incorreta!!"
        })
    }
    if(!(await bcrypt.compare(req.body.password, user.password))){
        return res.json({
            erro: true,
            mensagem: "Erro: Email ou senha incorreta!!!"
        })
    }
    return res.json({
        erro:false,
        mensagem: "Login realizado com sucesso!!!",
    })
})
app.listen(port, () => {
    console.log(`Servidor iniciado na porta ${port} http://localhost:${port}`);
});