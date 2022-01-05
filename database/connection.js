const sql = require('mssql');

/*const dbSettings = {
    user: 'admin',
    password: '19890234',
    server: 'localhost',
    database: 'SMAPAC_TEST',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};*/


//db_production RDS Amazon
/*const dbSettings = {
    user: 'admin',
    password: '19890234',
    server: 'test.cfeeipqmpzlg.us-east-2.rds.amazonaws.com',
    database: 'db_test',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};*/


//AWS
const dbSettings = {
    user: 'sa',
    password: '1989023aB9.',
    server: '18.118.36.40',
    database: 'SMAPAC_DB',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};


//Computadora Local
/*const dbSettings = {
    user: 'usuarionode',
    password: '1989023aB9.',
    server: '192.168.1.98',
    database: 'SMAPAC_DB',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};*/

//SQL Google Cloud 
/*const dbSettings = {
    user: 'sqlserver',
    password: '1989023aB9.',
    server: '34.136.217.147',
    database: 'SMAPAC_DB',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};*/

//SQL Google Cloud BZUBIETA
/*const dbSettings = {
    user: 'sqlserver',
    password: 'Aguamala2022$',
    server: '34.121.224.0',
    database: 'SMAPAC_DB',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};*/

async function  getConnection() {

    try {

        const pool = await sql.connect(dbSettings);

        return pool;
        
    } catch (error) {
        console.log(error);
    }

}

module.exports = {
    getConnection, sql
}

