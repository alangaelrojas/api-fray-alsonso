const express = require('express');
const http = require('http')
const bodyParser = require('body-parser')
app = express()

//settings
const PORT = 3002;

//http + express
const server = http.createServer(app)

///Routes
app.use(require('./src/routes/android'));

//Middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json()),

//starting
server.listen(PORT, ()=>{
    console.log(`Server on port ${PORT}`);
});