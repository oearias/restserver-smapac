const { response } = require('express');
const { getConnection } = require('../database/connection');
const sql = require('mssql');

const reporteStatusGet = async (req, res = response) => {
 try{
    const pool = await getConnection();

    const result = await pool.request().query('SELECT * FROM reporte_estatus ');

    res.json(result.recordset);
    
 }
catch (error) {
    return res.status(500).json({
     msg: error.message
    })
  }
}

const reportStatusGet = async (req, res = response) => {
try {
    const { id } = req.params;
    const pool = await getConnection();

    const result = await pool.request().input('identificador', id)
        .query('SELECT * FROM reporte_estatus where id = @identificador ');

    console.log(result.recordset.length)

    if (result.recordset.length == 0) {
        return res.status(500).json({
            msg: "No hay registros en la tabla"
        });
    }

    res.status(200).json(result.recordset);
   }
catch (error){
    return res.status(500).json({
        msg: error.message
       })
     }   
}



const reportStatusPost = async (req, res = response) => {

    const { nombre } = req.body;
    let nombreMayus = "";

    if (nombre) {

        nombreMayus = nombre.toUpperCase();
    }


    try {
        const pool = await getConnection();
        const result = await pool.request().input("nombre", nombreMayus).query('INSERT INTO reporte_estatus ( nombre ) values (@nombre)');

        console.log(result);

        if (result.rowsAffected[0] == 0) {
            return res.status(500).json({
                msg: "Los datos no se cargaron"
            });
        }


        res.status(200).json({
            msg: "Se ha creado el registro del nuevo campo"
        });
    } catch (error) {
        return res.status(500).json({
            msg: error.message
        })
    }

}

const reportStatusPut = async (req, res = response) => {
   
    const { id } = req.params
    const { nombre } = req.body;
    

    try {
        const pool = await getConnection();
        await pool.request()
            .input('id', id)       
            .input('nombre', sql.VarChar, nombre)
            .query('UPDATE reporte_estatus ' +
                'SET nombre = @nombre ' +
                'WHERE id=@id')
        res.json({
            msg: `El registro se ha editado correctamente`,
        });

    } catch (error) {

        res.json({
            error: 'No se pudo actualizar la información'
        });
    
    }
}

const reportStatusDelete = async (req, res = response) => {

    try {
        const { id } = req.params;

        const pool = await getConnection();

        const result = await pool.request()

            .input("id", id)
            .query('DELETE FROM reporte_estatus where id = @id')
            console.log(result);

        res.status(200).json({
            msg:"registro eliminado correctamente"
        });

    } catch (error) {
        res.json(error.message)
    }
}
module.exports = {
reporteStatusGet,
reportStatusGet,
reportStatusPost,
reportStatusPut,
reportStatusDelete



}