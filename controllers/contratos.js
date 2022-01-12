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

        const fecha = '2021-12-16';
        const fecha2 = '2022-01-17';
        const anio = 2021;
        const mes = 12;
        const mes_facturado = 'Dic2021';

        
        //const pool = await getConnection();
        const result = await pool.request()
            .input("id", id)
            .input("anio", anio)
            .input("mes", mes)
            .input("mes_facturado", mes_facturado)
            .input("fecha", fecha)
            .input("fecha2", fecha2)
            .query('SELECT b.contrato, b.nombre, b.direccion, b.colonia, b.cp, '+
            'b.giro, a.adeudo as adeuda, b.tarifa, b.region, b.estatus, b.medidor, b.reparto, b.sector, '+
            'dbo.sum_pagado(@id, @fecha, @fecha2) as pagado, '+
            '(a.adeudo - dbo.sum_pagado(@id, @fecha, @fecha2 )) as aux '+
            'FROM facthist a, '+
            'padron b '+
            'where b.contrato = @id '+
            'AND b.contrato = a.contrato '+
            'AND a.año = @anio '+
            'AND a.mes = @mes '+ 
            'AND a.mes_facturado = @mes_facturado');

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

        console.log(req.body);

        const pool = await getConnection();

        await pool.request()
            .input('contrato_id', sql.Int, contrato_id)
            .input('usuario_id', sql.Int, id)
            .query('INSERT INTO usuario_padron values (@usuario_id, @contrato_id)');

        res.json({
            msg: "Contrato añadido correctamente"
        })  
    } catch (error) {
        res.json(error.message)
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