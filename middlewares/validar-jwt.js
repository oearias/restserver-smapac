const { response } = require('express');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../database/connection');


const validarJWT = async (req, res = response, next) => {

    const token = req.header('x-token');

    if (!token) {
        return res.status(401).json({
            msg: 'No existe token en la petición'
        })
    }

    const id = jwt.verify(token, process.env.SECRETORPRIVATEKEY);


    try {

        const pool = await getConnection();

        const result = await pool.request()
            .input('id', id)
            .query("SELECT * from Usuario where id = @id");


        if(result.recordset[0].length<1){
            return res.status(401).json({
                msg: 'Token no válido'
            });
        }

    } catch (error) {
        console.log(error);
    }

    next();
}

module.exports = {
    validarJWT
}