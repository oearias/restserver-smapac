const { response } = require('express');

const usuariosGet = (req, res= response ) => {
    res.json({
        msg: 'get API - Controlador'
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