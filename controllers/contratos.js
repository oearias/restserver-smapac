const { response } = require('express');
const { getConnection } = require('../database/connection');
const sql = require('mssql');
const { queries } = require('../database/queries');
const { truncateD } = require('../helpers/format');
const { calculaReconex } = require('../helpers/calcula_reconexion');

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

        //preguntamos primero la region del contrato y en base a eso realizamos la consulta del periodo de Facturación
        const consulta_region = await pool.request()
        .input("id", id)
        .query('SELECT region FROM padron WHERE contrato = @id');

        const region = consulta_region.recordset[0]['region'];

        //Obtenemos el Periodo
        let consulta;

        if(region == 2){
            consulta = await pool.request()
            .query('SELECT * from periodo_facturac WHERE estatus = 1 AND region = 2');
        }else{
            consulta = await pool.request()
            .query('SELECT * from periodo_facturac WHERE estatus = 1 AND region is NULL');
        }

        const fecha = consulta.recordset[0]['fecha_inf'];
        const fecha2 = consulta.recordset[0]['fecha_sup'];
        const mes_facturado = consulta.recordset[0]['mes_facturado'];
        const anio = consulta.recordset[0]['año'];
        const mes = consulta.recordset[0]['mes'];

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
                msg: 'No se encontró ningun contrato con ese número, '+
                'si el contrato existe y no aparece '+
                'favor de ponerse en contacto al correo: sistemas@smapac.gob.mx'
            });

        }

        //Caso Reconexiones Cuando no hay Históricos recientes
        if(result.recordset[0]['estatus'] == 'Suspendido' && result.recordset[0]['adeuda_padron'] > 0 ){

            let reconexion = calculaReconex(result.recordset[0]['tarifa']);
            
            result.recordset[0]['adeuda'] = result.recordset[0]['adeuda_padron'] + reconexion ;
            result.recordset[0]['reconexion'] = reconexion;
            result.recordset[0]['flag_reconexion'] = 1;
            result.recordset[0]['adeuda'] = truncateD(result.recordset[0]['adeuda'])

        }

        //Esta adecuación se hizo por las personas que pagan en linea y consultan enseguida ya que 
        //la tabla que se setea a 0 es la de padron y no facthist
        //para no hacer más movimientos de actualizaciones solo se comparan las dos tablas y se devuelve un 0 si padron
        //está en 0
        if(result.recordset[0]['adeuda'] != result.recordset[0]['adeuda_padron'] && result.recordset[0]['adeuda_padron'] == 0){
            result.recordset[0]['adeuda'] = result.recordset[0]['adeuda_padron'];
        }

        if(result.recordset[0]['pagado'] && result.recordset[0]['flag_reconexion'] == null ){
            result.recordset[0]['adeuda'] = result.recordset[0]['adeuda'] - result.recordset[0]['pagado'];

            result.recordset[0]['adeuda'] = truncateD(result.recordset[0]['adeuda'])

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


            //TODO: Optimizar esta parte de código metiéndolo en una función por separado
            //Fecha de vencimiento para el periodo, esto se hizo ya que por medio de las APIS del periodo había que enviar el numero de contrato y cambiar el frontend

            let fecha3 = new Date(consulta.recordset[0]['fecha_sup']);
            //Esta porcion de codigo no le resta un dia a la fecha
            fecha3.setMinutes(fecha3.getMinutes() + fecha3.getTimezoneOffset());

            // const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
            const month = ['01','02','03','04','05','06','07','08','09','10','11','12'];

            let mes3 = month[fecha3.getMonth()];
            let anio3 = fecha3.getFullYear();
            let dia3 = fecha3.getDate();

            fecha_vencimiento = dia3 +'/'+ mes3 + '/' + anio3

            result.recordset[0]['fecha_vencimiento'] =  fecha_vencimiento;
            result.recordset[0]['mes_facturado'] =  consulta.recordset[0]['mes_facturado_c'];

            //
            console.log(result.recordset[0]);

        res.json(
            result.recordset[0]
        );
    } catch (error) {
        res.json(error.message);
    }
    //finally{
        //pool.close();
    //}

}

const contratoGetByUserEmail = async (req, res = response) => {

    const { email } = req.params;

    const pool = await getConnection();

    try {

        const consulta = await pool.request()
                        .query('SELECT * FROM periodo_facturac WHERE estatus = 1');

        const fecha_pagado_inf = consulta.recordset[0]['fecha_inf'];
        const fecha_pagado_sup = consulta.recordset[0]['fecha_sup'];
        //const mes_facturado = consulta.recordset[0]['mes_facturado'];
        const mes_facturado = 'Jun2022';
        const anio = consulta.recordset[0]['año'];
        const mes = consulta.recordset[0]['mes'];
        //////

        
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
            'dbo.sum_pagado_movil(c.contrato) as pagado, '+
            'd.mes_facturado, '+
            'd.fecha_vencimiento '+
            'FROM usuario_padron a, '+
            'facthist d, '+
            'usuario b , padron c '+
            'WHERE b.email = @email '+
            'AND a.usuario_id = b.id  '+
            'AND a.contrato = c.contrato '+
            'AND d.contrato = c.contrato '+
            //'AND d.año = @anio '+
            'AND d.año = 2022 '+
            //'AND d.mes = @mes '+
            'AND d.mes_facturado = @mes_facturado '+
            'ORDER BY  c.contrato');

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

module.exports = {
    contratoGet,
    contratosGet,
    contratoGetByUserEmail,
    addContratoUser,
    deleteContratoUser
}