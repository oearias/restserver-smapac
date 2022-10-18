const { response } = require('express');
const { getConnection } = require('../database/connection');
const sql = require('mssql');

const tipoReportesGet = async (req, res = response) => {
try {
    const pool = await getConnection();

    const result = await pool.request().query('SELECT * FROM reporte_tipo order by nombre');

    res.json(result.recordset);
    
}
catch (error) {
    res.json(error.message)
    }
}

const tipoReporteGet = async (req, res = response) => {
    try {
    const { id } = req.params;
    const pool = await getConnection();

    const result = await pool.request().input('identificador', id)
        .query('SELECT * FROM reporte_tipo where id = @identificador ');

    console.log(result.recordset.length)

    if (result.recordset.length == 0) {
        return res.status(500).json({
            msg: "No hay registros en la tabla"
        });
    }

    res.status(200).json(result.recordset);
    }
    catch {
        res.json(error.message)
    }
}

const tipoReportePost = async (req, res = response) => {

    const { nombre } = req.body;
    let nombreMayus = "";
    if (nombre) {
        nombreMayus = nombre.toUpperCase();
    }

    try {
        const pool = await getConnection();
        const result = await pool.request().input("nombre", nombreMayus).query('INSERT INTO reporte_tipo ( nombre ) values (@nombre)');

        console.log(result);

        if (result.rowsAffected[0] == 0) {
            return res.status(500).json({
                msg: "Los datos no se cargaron"
            });
        }


        res.status(200).json({
            msg: "El Tipo de Reporte: " + nombre + " fue cargado exitosamente"
        });
    } catch (error) {
        return res.status(500).json({
            msg: error.message
        })
    }

}

const tipoReportePut = async (req, res = response) => {
   
    const { id } = req.params
    const { nombre } = req.body;
    let nombreMayus = "";
    if (nombre) {
        nombreMayus = nombre.toUpperCase();
    }
    
    try {
        const pool = await getConnection();
        const result = await pool.request().input('id', id).input('nombre', nombreMayus).query('UPDATE reporte_tipo ' + 'SET nombre = @nombre ' + 'WHERE id=@id')
                       
        res.json({
            msg: `Tipo Reporte: ${nombreMayus} editado correctamente`,
        });

    } catch (error) {

        res.json({
            error: 'No se pudo actualizar el tipo de reporte'
        });
    
    }
}

const tipoReporteDelete = async (req, res = response) => {

    try {
        const { id } = req.params;

        const pool = await getConnection();

        const result = await pool.request()

            .input("id", id)
            .query('DELETE FROM reporte_tipo where id = @id')
            console.log(result);

        res.status(200).json({
            msg:"Tipo de Reporte eliminado correctamente"
        });

    } catch (error) {
        res.json(error.message)
    }
}

module.exports = {
    tipoReportesGet,
    tipoReporteGet,
    tipoReportePost,
    tipoReportePut,
    tipoReporteDelete
}