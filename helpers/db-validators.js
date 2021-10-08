const { getConnection } = require('../database/connection');
const sql = require('mssql');

const emailExists = async (email = '') => {

    const pool = await getConnection();

    //Validar que no exista el correo en la Base de Datos
    const valida = await pool.request()
        .input('email', sql.VarChar, email)
        .query('SELECT * from usuario where email = @email')

    if (valida.rowsAffected > 0) {
        throw new Error(`El correo: ${email} ya se encuentra registrado`)
    }
}

/*const emailExistsLogin = async (email = '') => {

    

    //Validar que no exista el correo en la Base de Datos
    const pool = await getConnection();
    const resul = await pool.request()
        .input('email', sql.VarChar, email)
        .query('SELECT * from usuario where email = @email')

    const exist = resul.recordset.length;

    console.log(exist);

    if(exist < 1 ){
        throw new Error('El correo no existe en la base de datos')
    }

}*/

module.exports = {
    emailExists
}