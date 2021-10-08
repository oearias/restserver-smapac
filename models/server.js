const express = require('express');
const cors = require('cors');

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT
        this.usuariosPath = '/api/usuarios'
        this.contratosPath = '/api/contratos'

        //Middlewares
        this.middlewares();

        //Rutas de mi Aplicación
        this.routes();
    }

    middlewares() {


        //CORS
        this.app.use(cors());

        //Lectura y parseo del body
        this.app.use(express.json());

        //Directorio público
        this.app.use(express.static('public'));

        this.app.use(express.json());
        this.app.unsubscribe(express.urlencoded({extended: false}))
    }

    routes() {

        this.app.use(this.usuariosPath, require('../routes/usuarios'));
        this.app.use(this.contratosPath, require('../routes/contratos'))

    }

    listen() {
        this.app.listen(process.env.PORT, () => {
            console.log('Server running on port: ', this.port);
        });
    }

}

module.exports = Server;