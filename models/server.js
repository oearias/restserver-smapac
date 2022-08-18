const express = require('express');
const cors = require('cors');

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT

        this.authPath = '/api/auth'
        this.usuariosPath = '/api/usuarios'
        this.contratosPath = '/api/contratos'
        this.periodosPath = '/api/periodos'
        this.ordersPath = '/api/orders'
        this.recibosPath = '/api/recibos'

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

        //Handlebars
        this.app.set('view engine', 'hbs');

        //Directorio público
        this.app.use(express.static('public'));

        //this.app.unsubscribe(express.urlencoded({extended: false}))
        this.app.use(express.urlencoded({extended: true}));
        
    }

    routes() {

        this.app.use(this.authPath, require('../routes/auth'));
        this.app.use(this.contratosPath, require('../routes/contratos'));
        this.app.use(this.usuariosPath, require('../routes/usuarios'));
        this.app.use(this.periodosPath, require('../routes/periodos'));
        this.app.use(this.ordersPath, require('../routes/checkout'));
        this.app.use(this.recibosPath, require('../routes/recibos'));

    }

    listen() {
        this.app.listen(process.env.PORT, () => {
            console.log('Server running on port: ', this.port);
        });
    }

}

module.exports = Server;