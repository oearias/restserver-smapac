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
            'b.giro, a.adeudo as adeuda, a.mes_facturado, b.tarifa, b.region, b.estatus, b.medidor, b.reparto, b.sector, '+
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

const contratoGetByUserEmail = async (req, res = response) => {

    const { email } = req.params;

    const pool = await getConnection();

    try {

        const consulta = await pool.request()
                        .query('SELECT * from periodo_facturac ');

        const fecha_inf = consulta.recordset[0]['fecha_inf'];
        const fecha_sup = consulta.recordset[0]['fecha_sup'];
        const mes_facturado = consulta.recordset[0]['mes_facturado'];
        const anio = consulta.recordset[0]['año'];
        const mes = consulta.recordset[0]['mes'];
        
        const result = await pool.request()
        .input('email', email)
        .input('anio', anio)
        .input('mes', mes)
        .input('mes_facturado', mes_facturado)
        .query('SELECT c.contrato, c.nombre, c.direccion, c.colonia, c.giro, c.estatus, '+
            'c.medidor, c.cp, '+
            'd.adeudo as adeuda, '+
            'd.mes_facturado, '+
            'd.fecha_vencimiento '+
            'FROM usuario_padron a, '+
            'facthist d, '+
            'usuario b , padron c '+
            'WHERE b.email = @email '+
            'AND a.usuario_id = b.id  '+
            'AND a.contrato = c.contrato '+
            'AND d.contrato = c.contrato '+
            'AND d.año = @anio AND d.mes = @mes AND d.mes_facturado = @mes_facturado');
        
        const contratos = result.recordset;

        res.json({
            contratos
        });

    } catch (error) {
        res.json(error.message);
    }

    

}

const addContratoUser = async (req, res = response) => {

    try {

        const { id } = req.params;
        const { contrato } = req.body;

        console.log(id, contrato);

        const pool = await getConnection();

        //Obtenemos el id

        //Preguntamos primero si no existe el contrato añadido

        const result = await pool.request()
                                .input('contrato', contrato)
                                .input('id', id)
                                .query('SELECT * FROM usuario_padron '+
                                'WHERE contrato = @contrato '+
                                'AND usuario_id = @id');

        if( result.recordset.length > 0 ){
            return res.json({
                msg: 'El contrato ya se encuentra vinculado a su correo'
            })
        }else{
        
            await pool.request()
                .input('contrato', sql.Int, contrato)
                .input('usuario_id', sql.Int, id)
                .query('INSERT INTO usuario_padron values (@contrato, @usuario_id)');

        }

        res.status(200).json({
            info: 'Ok',
            msg: "Contrato añadido correctamente"
        });

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
    contratoGetByUserEmail,
    addContratoUser
}