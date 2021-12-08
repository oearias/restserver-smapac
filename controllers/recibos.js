const { response } = require('express');
const { getConnection } = require('../database/connection');
const { queries } = require('../database/queries')

const puppeteer = require('puppeteer')

const fs = require('fs');
const { handlebars } = require('hbs');
const { Stream } = require('stream');
const { formatResultRecordset } = require('../helpers/formatRR');


const reciboGet = async (req, res = response) => {

    const { id } = req.params;

    const pool = await getConnection();

    try {

        //obtenemos fecha de hoy
        const fecha_actual = new Date();

        //dia actual
        dia_actual = fecha_actual.getDate();

        const fecha_pagado_inf = '2021-11-16';
        const fecha_pagado_sup = '2021-12-15';
        const mes_actual = 11;


        //Esto me está dando error
        //Hacemos este procedimiento porque gon el getmonth daba mes erroneo
        /*mes_actual = fecha_actual.toLocaleString();
        mes_actual = mes_actual.split('/');
        mes_actual = Number(mes_actual[1]);*/
        anio_actual = fecha_actual.getFullYear();

        //mes_auxiliar = mes_actual;


        //Preguntamos si ya salió el recibo actual comparando la fecha
        /*if(dia_actual < 15){
            mes_actual = mes_actual - 1;
        }*/

        
        //Preparo la fecha a comparar para saber cuanto se ha pagado a la fecha

        ///Esto me está dando error de manera dinamica
        /*
        let fecha_pagado_inf = anio_actual+'-'+mes_actual+'-'+15;
        let fecha_pagado_sup = anio_actual+'-'+(mes_actual+1)+'-'+15;
        */

        

        console.log("fecha de lo pagado: "+fecha_pagado_inf);
        console.log("fecha de lo pagado: "+fecha_pagado_sup);
        console.log('Mes actual: ',mes_actual);

        //Iniciamos leyendo plantilla
        const template = fs.readFileSync('./views/template_recibo.hbs', 'utf-8');
        const DOC = handlebars.compile(template);

        const result = await pool.request()
        .input("mes_actual", mes_actual)
        .input("id", id)
        .input("fecha_pagado_inf", fecha_pagado_inf)
        .input("fecha_pagado_sup", fecha_pagado_sup)
            .query(queries.getRecibo)

        if (result.recordset.length < 1) {

            //Pregunto si existe el contrato, si existe inserto el log
            const res = await pool.request()
            .input("contrato", id)
                .query('SELECT * from padron where contrato = @contrato');

            if(res.recordset.length > 0){

                //insertar en la tabla el contrato y el registro no encontrado
                let fecha = new Date();
                let anio = fecha.getFullYear();
                let mes =  ( "0" + (fecha.getMonth() +1 )).slice(-2);
                let dia = fecha.getDate();

                fecha = anio+'-'+mes+'-'+dia;

                await pool.request()
                .input("contrato", id)
                .input("fecha", fecha)
                .query('INSERT log_recibo_notfound (contrato, fecha) values (@contrato, @fecha)')
            }
            

            return res.json({
                msg: 'No se pudo generar el recibo.'
            });
        }


        result.recordset[0] = formatResultRecordset(result)

        /*
        //Formateamos a dos decimales y comas por miles los valores
        result.recordset[0]['consumo_actual'] ? result.recordset[0]['consumo_actual'] = '$'+formatNumber(result.recordset[0]['consumo_actual']) : '';
        result.recordset[0]['consumo_vencido'] ? result.recordset[0]['consumo_vencido'] = '$'+formatNumber(result.recordset[0]['consumo_vencido']) : '';
        result.recordset[0]['recargo_actual'] ? result.recordset[0]['recargo_actual'] = '$'+formatNumber(result.recordset[0]['recargo_actual']) : '';
        result.recordset[0]['recargo_vencido'] ? result.recordset[0]['recargo_vencido'] = '$'+formatNumber(result.recordset[0]['recargo_vencido']) : '';
        result.recordset[0]['drenaje']  ? result.recordset[0]['drenaje'] = '$'+formatNumber(result.recordset[0]['drenaje']) : '';
        result.recordset[0]['drenaje_vencido'] ? result.recordset[0]['drenaje_vencido'] = '$'+formatNumber(result.recordset[0]['drenaje_vencido']) : '';
        result.recordset[0]['iva'] ? result.recordset[0]['iva'] = '$'+formatNumber(result.recordset[0]['iva']) : '';
        result.recordset[0]['iva_vencido'] ? result.recordset[0]['iva_vencido'] = '$'+formatNumber(result.recordset[0]['iva_vencido']) : '';
        result.recordset[0]['pipas'] ? result.recordset[0]['pipas'] = '$'+formatNumber(result.recordset[0]['pipas']) : '';
        result.recordset[0]['pipas_vencido'] ? result.recordset[0]['pipas_vencido'] = '$'+formatNumber(result.recordset[0]['pipas_vencido']) : '';
        

        //Desaparecemos los valores que sean = a 0
        (result.recordset[0]['consumo_vencido'] == 0) ? result.recordset[0]['consumo_vencido'] = '' : result.recordset[0]['consumo_vencido'];
        (result.recordset[0]['recargo_actual'] == 0) ? result.recordset[0]['recargo_actual'] = '' : result.recordset[0]['recargo_actual'];
        (result.recordset[0]['recargo_vencido'] == 0) ? result.recordset[0]['recargo_vencido'] = '' : result.recordset[0]['recargo_vencido'];
        //-----------------------------------------//
        (result.recordset[0]['drenaje'] == 0) ? result.recordset[0]['drenaje'] = '' : result.recordset[0]['drenaje'];
        (result.recordset[0]['drenaje_vencido'] == 0) ? result.recordset[0]['drenaje_vencido'] = '' : result.recordset[0]['drenaje_vencido'];
        (result.recordset[0]['iva'] == 0) ? result.recordset[0]['iva'] = '' : result.recordset[0]['iva'];
        (result.recordset[0]['iva_vencido'] == 0) ? result.recordset[0]['iva_vencido'] = '' : result.recordset[0]['iva_vencido'];
        (result.recordset[0]['pipas'] == 0) ? result.recordset[0]['pipas'] = '' : result.recordset[0]['pipas'];
        (result.recordset[0]['pipas_vencido'] == 0) ? result.recordset[0]['pipas_vencido'] = '' : result.recordset[0]['pipas_vencido'];


        result.recordset[0]['adeuda'] ? result.recordset[0]['adeuda'] = formatNumber(result.recordset[0]['adeuda']) : '';
        result.recordset[0]['pagado'] ? result.recordset[0]['pagado'] = '$'+formatNumber(result.recordset[0]['pagado']) : 0;

        //Diferencia de lo pagado y el adeudo
        if(result.recordset[0]['adeuda'] && result.recordset[0]['pagado']){
            result.recordset[0]['adeuda'] = result.recordset[0]['adeuda'] - result.recordset[0]['pagado']
        }

        //Desaparecemos lo pagado despues de todas las operaciones aritmeticas, antes no!!!
        (result.recordset[0]['pagado'] == 0) ? result.recordset[0]['pagado'] = '' : result.recordset[0]['pagado'];
        
        result.recordset[0]['adeudo1'] ? result.recordset[0]['adeudo1'] = formatNumber(result.recordset[0]['adeudo1']) : '';
        result.recordset[0]['adeudo2'] ? result.recordset[0]['adeudo2'] = formatNumber(result.recordset[0]['adeudo2']) : '';
        result.recordset[0]['adeudo3'] ? result.recordset[0]['adeudo3'] = formatNumber(result.recordset[0]['adeudo3']) : '';
        result.recordset[0]['adeudo4'] ? result.recordset[0]['adeudo4'] = formatNumber(result.recordset[0]['adeudo4']) : '';
        result.recordset[0]['adeudo5'] ? result.recordset[0]['adeudo5'] = formatNumber(result.recordset[0]['adeudo5']) : '';
        result.recordset[0]['adeudo6'] ? result.recordset[0]['adeudo6'] = formatNumber(result.recordset[0]['adeudo6']) : '';
        result.recordset[0]['adeudo7'] ? result.recordset[0]['adeudo7'] = formatNumber(result.recordset[0]['adeudo7']) : '';

        //result.recordset[0]['adeuda'] ? result.recordset[0]['adeuda'] = formatNumber(result.recordset[0]['adeuda']) : '-';
        //result.recordset[0]['consumo_actual'] ? result.recordset[0]['consumo_actual'] = formatNumber(result.recordset[0]['consumo_actual']) : '-';
        //result.recordset[0]['consumo_vencido'] ? result.recordset[0]['consumo_vencido'] = formatNumber(result.recordset[0]['consumo_vencido']) : '-';


        //formateamos adeuda por que no pone doble cero cuando es = a 0
        if(result.recordset[0]['adeuda'] == 0){
            result.recordset[0]['adeuda']  = "0.00"
        }


        //Diferencias (-) de Consumo
        result.recordset[0]['consumo'] = result.recordset[0]['lectura_actual'] - result.recordset[0]['lectura_anterior'];

        result.recordset[0]['consumo1'] = result.recordset[0]['lectura1'] - result.recordset[0]['lectura_ant1'];
        result.recordset[0]['consumo2'] = result.recordset[0]['lectura2'] - result.recordset[0]['lectura_ant2'];
        result.recordset[0]['consumo3'] = result.recordset[0]['lectura3'] - result.recordset[0]['lectura_ant3'];
        result.recordset[0]['consumo4'] = result.recordset[0]['lectura4'] - result.recordset[0]['lectura_ant4'];
        result.recordset[0]['consumo5'] = result.recordset[0]['lectura5'] - result.recordset[0]['lectura_ant5'];
        result.recordset[0]['consumo6'] = result.recordset[0]['lectura6'] - result.recordset[0]['lectura_ant6'];
        */

        const html = DOC(result.recordset[0]);


        //Esto funciona de manera local
        /*const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null
        });*/

        const browser = await puppeteer.launch({
            'args' : [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
            
        });

        console.log(result.recordset[0]);

        const page = await browser.newPage();

        // Configurar el tiempo de espera de la navegación
        await page.setDefaultNavigationTimeout(0);

        await page.setContent(html);

        const pdf = await page.pdf({
            format: 'letter',
            printBackground: true
        });

        await browser.close();

        const buffer = Buffer.from(pdf);
        const bufferStream = new Stream.PassThrough();

        let namePDF = "recibo_" + result.recordset[0]['contrato'];
        res.setHeader('Content-disposition', "inline; filename*=UTF-8''" + namePDF+".pdf");
        res.setHeader('Content-type', 'application/pdf');

        bufferStream.end(buffer);

        return res.send(buffer);


    } catch (error) {
        res.json(error.message);
    } finally { 
        pool.close();
    }

}

module.exports = {
    reciboGet
}