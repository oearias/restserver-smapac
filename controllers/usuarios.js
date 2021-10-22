const { response } = require('express');
const { getConnection } = require('../database/connection');
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

    const { email, password, nombre } = req.body;

    // Valido datos
    if ((email == null) || (password == null) || (nombre == null)) {
        return res.json({
            msg: 'Bad Request, Por favor complete todos los datos'
        })
    }

    const pool = await getConnection();

    try {

        //Encriptar password
        const salt = bcryptjs.genSaltSync();
        const pass = bcryptjs.hashSync(password, salt)

        //Consulta para insertar usuarios
        const result = pool.request()
            .input('email', sql.VarChar, email)
            .input('nombre', sql.VarChar, nombre)
            .input('password', sql.VarChar, pass)
            .query('INSERT INTO usuario (email, nombre, password) values (@email, @nombre, @password)')

        res.json({
            msg: `Usuario: ${email} registrado correctamente`,
        });

    } catch (error) {
        res.status(500).json(error.message)
    } 
}

const usuarioGet = async (req, res = response) => {

    const { id } = req.params;

    const pool = await getConnection();

    try {


        const result = await pool.request().input("id", id).query('SELECT nombre, email FROM usuario where id = @id')

        if (result.recordset.length == 0) {
            result.recordset[0] = "No existe registro con tal id"
        }

        res.json(
            result.recordset[0]
        );
    } catch (error) {
        res.json(error.message)
    } finally {
        pool.close();
    }

}

const usuarioGetByEmail = async (req, res = response) => {

    const { email } = req.params;
    const pool = await getConnection();

    try {

        const result = await pool.request().input("email", email).query('SELECT nombre, email FROM usuario where email = @email')

        if (result.recordset.length == 0) {
            result.recordset[0] = "No existe registro con tal email"
        }

        res.json(
            result.recordset[0]
        );
    } catch (error) {
        res.json(error.message)
    } finally {
        pool.close();
    }

}

const usuariosPut = async (req, res = response) => {

    const { id } = req.params

    const { nombre, email } = req.body;

    /*if (password) {
        const salt = bcryptjs.genSaltSync();
        const pass = bcryptjs.hashSync(password, salt)
    }*/

    const pool = await getConnection();

    try {
        const result = pool.request()
            .input('id', sql.VarChar, id)
            .input('email', sql.VarChar, usuario)
            .input('nombre', sql.VarChar, nombre)
            .query('UPDATE usuario SET email = @email, nombre = @nombre WHERE id=@id ')

        res.json({
            msg: `Usuario: ${email} editado correctamente`,
        });
    } catch (error) {
        res.json(error.message);
    } finally {
        pool.close();
    }
}

const usuariosDelete = async (req, res = response) => {

    try {
        const { id } = req.params;

        const pool = await getConnection();

        const result = await pool.request()
            .input("id", id)
            .query('DELETE FROM usuario where id = @id')

        res.status(204).json();

    } catch (error) {
        res.json(error.message)
    }
}

module.exports = {
    usuarioGet,
    usuariosPost,
    usuariosPut,
    usuariosDelete,
    usuarioGetByEmail
}