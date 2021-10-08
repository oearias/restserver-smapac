const { response } = require('express');
const bcryptjs = require('bcryptjs');
const { getConnection } = require('../database/connection');
const sql = require('mssql');
const { generarJWT } = require('../helpers/generate-jwt');

const login = async (req, res = response) => {

    try {
        const { email, password } = req.body;

        //Validamos que exista el email

        const pool = await getConnection();
        const resul = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * from usuario where email = @email')

        const exist = resul.recordset.length;

        if (exist < 1) {
            return res.json({ msg: 'El correo no existe en la base de datos' })
        }

        const id = resul.recordset[0]['id'];
        const pass = resul.recordset[0]['password'];

        //Verificar la contraseña
        const validPassword = bcryptjs.compareSync(password, pass)

        if (!validPassword) {
            return res.status(400).json({
                msg: 'Usuario o Contraseña son incorrectos'
            })
        }

        //Generar el JWT
        const token = await generarJWT(id);

        res.json({
            email,
            nombre,
            token
        })

    } catch (error) {
        res.status(500).json({
            msg: 'Algo salió mal, hable con el Administrador'
        })
    }

}

module.exports = {
    login
}