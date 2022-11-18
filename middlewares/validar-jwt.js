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

    
    try {
        const id = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        const pool = await getConnection();
        

        const result = await pool.request()
            .input('id', id)
            .query("SELECT * from Usuario where id = @id");


        if(result.recordset[0].length<1){
            return res.status(401).json({
                msg: 'Token no válido'
            });
        }

        next();

    } catch (error) {

        console.log(error);

        res.status(401).json({
            msg: 'Token no valido, Sesión expirada. Por favor inicie sesión nuevamente'
        })
    }

    
}

module.exports = {
    validarJWT
}