const { response } = require('express');
const { getConnection} = require('../database/connection');
const sql = require('mssql');

const bcryptjs = require('bcryptjs');

const usuariosGet = async (req, res = response) => {

    const pool = await getConnection();

    //const result = await pool.request().query('SELECT 1')
    //console.log(result);


    res.json({
        msg: 'Hay que trabajar las consultas de los usuarios'
    });
}

const usuariosPost = async (req, res = response) => {

    const { usuario, password, nombre } = req.body;

    // Valido datos
    if ((usuario == null) || (password == null) || (nombre == null)) {
        return res.json({
            msg: 'Bad Request, Por favor complete todos los datos'
        })
    }

   try {
        //Encriptar password
    const salt = bcryptjs.genSaltSync();
    const pass = bcryptjs.hashSync(password, salt)

    //Consulta para insertar usuarios
    const pool = await getConnection();

    const resul = pool.request()
                        .input('usuario', sql.VarChar, usuario)
                        .input('nombre', sql.VarChar, nombre)
                        .input('password', sql.VarChar, pass)
                        .query('INSERT INTO usuario (usuario, nombre, password) values (@usuario, @nombre, @password)')



    res.json({
        msg: 'Usuario',
        usuario,
        nombre,
    });
   } catch (error) {
       res.status(500).json(error.message)
   }
}

const usuariosPut = (req, res = response) => {

    const { id } = req.params

    res.json({
        msg: 'put API - Controlador',
        id
    });
}
const usuariosDelete = (req, res = response) => {
    res.json({
        msg: 'delete API - Controlador'
    });
}

module.exports = {
    usuariosGet,
    usuariosPost,
    usuariosPut,
    usuariosDelete
}