const { response } = require('express');
const { getConnection } = require('../database/connection');
const sql = require('mssql');
const { queries } = require('../database/queries');
const { truncateD } = require('../helpers/format');

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

    console.log("Si llega");

    const { id } = req.params;
    const pool = await getConnection(); 
    

    try {

        /*
        const fecha = '2022-01-18';
        const fecha2 = '2022-02-15';
        const anio = 2022;
        const mes = 1;
        const mes_facturado = 'Ene2022';
        */

        const consulta = await pool.request()
                        .query('SELECT * from periodo_facturac WHERE estatus = 1');


        const fecha = consulta.recordset[0]['fecha_inf'];
        const fecha2 = consulta.recordset[0]['fecha_sup'];
        const mes_facturado = consulta.recordset[0]['mes_facturado'];
        const anio = consulta.recordset[0]['año'];
        const mes = consulta.recordset[0]['mes'];

        console.log(id);
        console.log(fecha);
        console.log(fecha2);
        console.log(mes_facturado);
        console.log(anio);
        console.log(mes);

        const result = await pool.request()
            .input("id", id)
            .input("anio", anio)
            .input("mes", mes)
            .input("mes_facturado", mes_facturado)
            .input("fecha", fecha)
            .input("fecha2", fecha2)
            .query(queries.getContrato);

        if (result.recordset.length < 1) {
            return res.json({
                msg: 'No existe ningun contrato con ese número'
            });
        }

        //Esta adecuación se hizo por las personas que pagan en linea y consultan enseguida ya que 
        //la tabla que se setea a 0 es la de padron y no facthist
        //para no hacer más movimientos de actualizaciones solo se comparan las dos tablas y se devuelve un 0 si padron
        //está en 0
        if(result.recordset[0]['adeuda'] != result.recordset[0]['adeuda_padron'] && result.recordset[0]['adeuda_padron'] == 0){
            result.recordset[0]['adeuda'] = result.recordset[0]['adeuda_padron'];
        }

        if(result.recordset[0]['pagado']){
            result.recordset[0]['adeuda'] = result.recordset[0]['adeuda'] - result.recordset[0]['pagado'];

            if( result.recordset[0]['adeuda'] < 0 ){
                result.recordset[0]['adeuda'] = 0 ;
            }
        }

        //Formatea el adeuda y aux a dos decimales, esto corrige el importe invalido en multipagos
        (result.recordset[0]['adeuda']) 
            ? truncateD(result.recordset[0]['adeuda'])
            : null;

        (result.recordset[0]['aux'])     
            ? truncateD(result.recordset[0]['aux'])
            :null

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
                        .query('SELECT * from periodo_facturac where estatus = 1');

        const fecha_pagado_inf = consulta.recordset[0]['fecha_inf'];
        const fecha_pagado_sup = consulta.recordset[0]['fecha_sup'];
        const mes_facturado = consulta.recordset[0]['mes_facturado'];
        const anio = consulta.recordset[0]['año'];
        const mes = consulta.recordset[0]['mes'];
        
        const result = await pool.request()
        .input('email', email)
        .input('anio', anio)
        .input('mes', mes)
        .input('fecha_pagado_inf', fecha_pagado_inf)
        .input('fecha_pagado_sup', fecha_pagado_sup)
        .input('mes_facturado', mes_facturado)
        .query('SELECT c.contrato, c.nombre, c.direccion, c.colonia, c.giro, c.estatus, '+
            'c.medidor, c.cp, '+
            'd.adeudo as adeuda, '+
            'c.adeuda as adeuda_padron, '+
            'dbo.sum_pagado(c.contrato, @fecha_pagado_inf, @fecha_pagado_sup) as pagado, '+
            'd.mes_facturado, '+
            'd.fecha_vencimiento '+
            'FROM usuario_padron a, '+
            'facthist d, '+
            'usuario b , padron c '+
            'WHERE b.email = @email '+
            'AND a.usuario_id = b.id  '+
            'AND a.contrato = c.contrato '+
            'AND d.contrato = c.contrato '+
            'AND d.año = @anio AND d.mes = @mes AND d.mes_facturado = @mes_facturado order by c.contrato');

            if(result.recordset.length > 0){
                for(let i=0; i< result.recordset.length; i++){

                    /*if(result.recordset[i]['pagado'] != null){

                        result.recordset[i]['adeuda'] = result.recordset[i]['adeuda'] - result.recordset[i]['pagado']

                        if( result.recordset[i]['adeuda'] < 0 ){
                            result.recordset[i]['adeuda'] = 0 ;
                        }
                    }*/

                    //Adecuacion para los que pagan y revisan enseguida

                    if(result.recordset[i]['adeuda'] != result.recordset[i]['adeuda_padron'] && result.recordset[i]['adeuda_padron'] == 0){
                        console.log('Entra a la condicion del adeuda');
                        result.recordset[i]['adeuda'] = result.recordset[i]['adeuda_padron'];
                    }
            
                    if(result.recordset[i]['pagado']){
                        result.recordset[i]['adeuda'] = result.recordset[i]['adeuda'] - result.recordset[i]['pagado'];
            
                        if( result.recordset[i]['adeuda'] < 0 ){
                            result.recordset[i]['adeuda'] = 0 ;
                        }
                    }
            
                    //Formatea el adeuda y aux a dos decimales, esto corrige el importe invalido en multipagos
                    (result.recordset[i]['adeuda']) 
                        ? truncateD(result.recordset[i]['adeuda'])
                        : null;
            
                    (result.recordset[i]['aux'])     
                        ? truncateD(result.recordset[i]['aux'])
                        :null
                }
            }
        
        const contratos = result.recordset;

        res.json({
            contratos
        });

    } catch (error) {
        res.json(error.message);
    }finally{
        pool.close();
    }

}

const addContratoUser = async (req, res = response) => {

    try {

        const { id } = req.params;
        const { contrato } = req.body;

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

const deleteContratoUser = async (req, res = response) =>{
    
    const { id } = req.params;
    const {email} = req.body;
    const pool = await getConnection();

    try {

        const consulta = await pool.request()
                        .input("contrato", id)
                        .input("email", email)
                        .query('SELECT b.id FROM usuario_padron a '+
                                'INNER JOIN '+
                                'USUARIO B '+
                                'ON (a.usuario_id = b.id '+ 
                                'AND b.email = @email AND a.contrato = @contrato )');

        

        if(consulta.recordset.length > 0){
            
            const usuario_id = consulta.recordset[0]['id'];
            //Procedemos a borrar el contrato

            await pool.request()
                    .input('contrato', id)
                    .input('usuario_id', usuario_id)
                    .query('DELETE usuario_padron '+
                    'where contrato =  @contrato '+
                    'AND usuario_id = @usuario_id'
                    );

            res.json({
                msg: 'Contrato desvinculado correctamente'
            });
        }

        

    } catch (error) {
        res.json(error.message);
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
    addContratoUser,
    deleteContratoUser
}