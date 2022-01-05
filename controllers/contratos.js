const { response } = require('express');
const { getConnection } = require('../database/connection');
const sql = require('mssql');

const contratosGet = async (req, res = response) => {

    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT top 1000 * FROM padron')



        const contratos = result.recordset;

        res.json(
            {
                total: 6,
                contratos
            }
        );

    } catch (error) {
        res.status(500).send(error.message);
    }finally{
        sql.pool.close();
    }
}

const contratoGet = async (req, res = response) => {

    const { id } = req.params;
    const pool = await getConnection();
    

    try {

        //Esta fecha debe ser 16 del mes pasado o el actual dependiendo la fecha
        //const fechaHoy = "16/10/2021"

        //obten dia
        const fechaHoy = new Date();
        
        let dia = fechaHoy.getDate();
        let mes = fechaHoy.getMonth();
        let anio = fechaHoy.getFullYear();

        const fechaCompara = new Date(anio, mes, 15);
        let fecha, fecha2;

        const options = {
            year: 'numeric',
            month : '2-digit',
            day: '2-digit'
        }

        //Las fechas del periodo cambiarán dependiendo el mes, al menos hasta que lo configuremos en una tabla

        if(fechaHoy < fechaCompara){
            fecha = new Date(anio, mes-1, 16);
            fecha = fecha.toLocaleString('kw-GB', options);

            fecha2 = new Date(anio, mes, 15);
            fecha2 = fecha2.toLocaleString('kw-GB', options);
        }else{
            fecha = new Date(anio, mes, 16);
            fecha = fecha.toLocaleString('kw-GB', options);

            fecha2 = new Date(anio, mes+1, 15);
            fecha2 = fecha2.toLocaleString('kw-GB', options);
        }
        
        //const pool = await getConnection();
        const result = await pool.request()
            .input("id", id)
            .query(`SELECT contrato, nombre, direccion, colonia, cp, `+
            `giro, adeuda, tarifa, region, estatus, medidor, reparto, sector, `+
            `dbo.sum_pagado(@id, '${fecha}', '${fecha2}') as pagado, `+
            `(adeuda - dbo.sum_pagado(@id, '${fecha}', '${fecha2}' )) as aux `+
            `FROM padron where contrato = @id`)

        if (result.recordset.length < 1) {
            return res.json({
                msg: 'No existe ningun contrato con ese número'
            });
        }

        if(result.recordset[0]['pagado']){
            result.recordset[0]['adeuda'] = result.recordset[0]['adeuda'] - result.recordset[0]['pagado']

            if( result.recordset[0]['adeuda'] < 0 ){
                result.recordset[0]['adeuda'] = 0 ;
            }
        }

        console.log(result.recordset[0]);

        res.json(
            result.recordset[0]
        );
    } catch (error) {
        res.json(error.message);
    }
    finally{
        pool.close();
    }

    
}

const contratoGetByUserId = async (req, res = response) => {

    const { id } = req.params;

    const pool = await getConnection();

    const result = await pool.request().input('id', id)
        .query('select usuario.id, padron.contrato, padron.nombre, padron.direccion, padron.colonia,' +
            'padron.giro, padron.tarifa, padron.adeuda, padron.region, padron.estatus, ' +
            'usuario.nombre as nombre_usuario, usuario.email ' +
            'from padron , padron_usuario , usuario  ' +
            'where usuario.id=@id and padron.id = contrato_id AND padron_usuario.usuario_id = usuario.id ');

    //Validar cuando no encuentre usuario

    res.json(
        result.recordset
    );

}

const addContratoUser = async (req, res = response) => {

    try {
        const { id } = req.params;

        const { contrato_id } = req.body

        const pool = await getConnection();

        const result = await pool.request()
            .input('contrato_id', sql.Int, contrato_id)
            .input('usuario_id', sql.Int, id)
            .query('INSERT INTO padron_usuario (contrato_id, usuario_id) values (@contrato_id, @usuario_id)');

        res.json({
            msg: "Contrato añadido correctamente"
        })  
    } catch (error) {
        res.json(error.message)
    }finally{
        sql.pool.close();
    }

}

const updateAdeudo = async (req, res = response) => {

    const { id } = req.params;

    const { pagado } = req.body;
}

module.exports = {
    contratoGet,
    contratosGet,
    contratoGetByUserId,
    addContratoUser
}