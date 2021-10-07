const sql = require('mssql');

const dbSettings = {
    user: 'admin',
    password: '19890234',
    server: 'localhost',
    database: 'SMAPAC_TEST',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

async function  getConnection() {

    try {
        const pool = await sql.connect(dbSettings);

        return pool;
        
    } catch (error) {
        console.log(error);
    }

}

module.exports = {
    getConnection
}

