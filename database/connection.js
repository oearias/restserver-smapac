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

