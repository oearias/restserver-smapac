const { response } = require('express');
const { getConnection } = require('../database/connection');

const contratosGet = async (req, res = response) => {

    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT top 1000 * FROM padron')

        res.json(
            result.recordset
        );

    } catch (error) {
        res.status(500).send(error.message);
    }
}

const contratoGet = async (req, res = response) => {

    const { id } = req.params;

    const pool = await getConnection();

    const result = await pool.request().input("id",id).query('SELECT * FROM padron where contrato = @id')

    console.log(result);

    res.json(
        result.recordset[0]
    );
}

module.exports = {
    contratoGet,
    contratosGet
}