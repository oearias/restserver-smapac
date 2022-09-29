const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');

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
        this.inspectoresPath = '/api/inspectores'
        this.tipoReportePath = '/api/tipoReporte'
        this.reportesPath = '/api/reportes'
        this.reporteStatusPath = '/api/reporteStatus'
        this.reportesFotoPath = '/api/reportesFoto'

        //Middlewares
        this.middlewares();

        //Rutas de mi Aplicación
        this.routes();
    }

    middlewares() {

        //CORS
        this.app.use(cors());

        //Lectura y parseo del body
        this.app.use(express.json({
            limit: '200mb'
        }));

        //parsers
        // parse application/x-www-form-urlencoded
        this.app.use(
            express.urlencoded({
                extended: false
            })
        )

        //Handlebars
        this.app.set('view engine', 'hbs');

        //Directorio público
        this.app.use(express.static('public'));

        this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: '/tmp/',
            createParentPath: true
        }))

        //this.app.unsubscribe(express.urlencoded({extended: false}))
        this.app.use(express.urlencoded({ extended: true }));

    }

    routes() {

        this.app.use(this.authPath, require('../routes/auth'));
        this.app.use(this.contratosPath, require('../routes/contratos'));
        this.app.use(this.usuariosPath, require('../routes/usuarios'));
        this.app.use(this.periodosPath, require('../routes/periodos'));
        this.app.use(this.ordersPath, require('../routes/checkout'));
        this.app.use(this.recibosPath, require('../routes/recibos'));
        this.app.use(this.inspectoresPath, require('../routes/inspectores'));
        this.app.use(this.tipoReportePath, require('../routes/tipoReporte'));
        this.app.use(this.reportesPath, require('../routes/reportes'));
        this.app.use(this.reporteStatusPath, require('../routes/reporte_status'));
        this.app.use(this.reportesFotoPath, require('../routes/reportesFoto'));

    }

    listen() {
        this.app.listen(process.env.PORT, () => {
            console.log('Server running on port: ', this.port);
        });
    }

}

module.exports = Server;