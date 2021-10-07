const { response } = require('express');
const { getConnection } = require('../database/connection');

const usuariosGet = async (req, res= response ) => {

        const pool = await getConnection();
        
        //const result = await pool.request().query('SELECT 1')
        //console.log(result);
    

    res.json({
        msg: 'Hay que trabajar las consultas de los usuarios'
    });
}

const usuariosPost = (req, res= response ) => {

    const {nombre, edad} = req.body;

    res.json({
        msg: 'post API - Controlador',
        nombre,
        edad
    });
}

const usuariosPut = (req, res= response ) => {

    const {id} = req.params

    res.json({
        msg: 'put API - Controlador',
        id
    });
}
const usuariosDelete = (req, res= response ) => {
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