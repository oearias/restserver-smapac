const { response } = require('express');
const { getConnection } = require('../database/connection');

const reportesFotoGet = async (req, res = response) => {
    try {
        const pool = await getConnection();

        const result = await pool.request().query('SELECT * FROM reportes_foto ');

        res.json(result.recordset);
        
    }
    catch (error) {
        res.json(error.message)
    }
}

const reporteFotoGet = async (req, res = response) => {
    try {

        const { id } = req.params;
        const pool = await getConnection();

        const result = await pool.request().input('identificador', id)
            .query('SELECT * FROM reportes_foto where id = @identificador ');

        if (result.recordset.length == 0) {
            return res.status(500).json({
                msg: "No hay registros en la tabla"
            });
        }

        res.status(200).json(result.recordset);
    }
    catch (error) {
        res.json(error.message)
    }
}

const reporteFotoGetByReporteId = async (req, res = response) => {
    try {

        const { id } = req.params;
        const pool = await getConnection();

        const result = await pool.request().input('identificador', id)
            .query('SELECT * FROM reportes_foto where reporte_id = @identificador ');


        if (result.recordset.length == 0) {
            return res.status(200).json({
                msg: "No hay registros en la tabla"
            });
        }

        res.status(200).json(result.recordset);
    }
    catch (error) {
        
        res.json(error.message)

    }
}

const reportesFotoDelete = async (req, res = response) => {

    try {
        const { id } = req.params;

        const pool = await getConnection();

        const result = await pool.request()

            .input("id", id)
            .query('DELETE FROM reportes_foto where id = @id')
        console.log(result);

        res.status(200).json({
            msg: "registro eliminado correctamente"
        });

    } catch (error) {
        res.json(error.message)

    }
}

module.exports = {
    reportesFotoGet,
    reporteFotoGet,
    reporteFotoGetByReporteId,
    reportesFotoDelete

}