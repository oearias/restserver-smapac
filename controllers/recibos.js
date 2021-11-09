const { response } = require('express');
const { getConnection } = require('../database/connection');

const puppeteer = require('puppeteer')

const fs = require('fs');
const { handlebars } = require('hbs');
const { Stream } = require('stream');
const { putCommas, twoDigits, formatNumber } = require('../helpers/format');


const reciboGet = async (req, res = response) => {

    const { id } = req.params;

    const pool = await getConnection();

    try {

        //obtenemos fecha de hoy
        const fecha_actual = new Date();

        //dia actual
        dia_actual = fecha_actual.getDate();
        //HAcemos este procedimiento porque gon el getmonth daba mes erroneo
        mes_actual = fecha_actual.toLocaleString();
        mes_actual = mes_actual.split('/');
        mes_actual = Number(mes_actual[1]);
        anio_actual = fecha_actual.getFullYear();

        mes_auxiliar = mes_actual;


        //Preguntamos si ya salió el recibo actual comparando la fecha
        if(dia_actual < 15){
            mes_actual = mes_actual - 1;
        }

        console.log('Mes actual: ',mes_actual);
        //Preparo la fecha a comparar para saber cuanto se ha pagado a la fecha
        let fecha_pagado_inf = anio_actual+'-'+mes_actual+'-'+15;
        let fecha_pagado_sup = anio_actual+'-'+(mes_actual+1)+'-'+15;

        console.log("fecha de lo pagado: "+fecha_pagado_inf);
        console.log("fecha de lo pagado: "+fecha_pagado_sup);

        //Iniciamos leyendo plantilla
        const template = fs.readFileSync('./views/template_recibo.hbs', 'utf-8');
        const DOC = handlebars.compile(template);

        const result = await pool.request()
        .input("mes_actual", mes_actual)
        .input("id", id)
        .input("fecha_pagado_inf", fecha_pagado_inf)
        .input("fecha_pagado_sup", fecha_pagado_sup)
            .query('SELECT a.contrato, a.mes_facturado, a.recargo_actual, cast(a.consumo_actual as decimal(10,2)) as consumo_actual, ' +
                'a.consumo_vencido, a.recargo_vencido, a.fecha_vencimiento, a.lectura_anterior, a.lectura_actual, ' +
                'b.nombre, b.direccion, b.colonia, b.cp, b.giro, b.adeuda, b.region, b.sector, b.estatus, b.tarifa, b.medidor, b.reparto, ' +
                'dbo.sum_pagado(@id, @fecha_pagado_inf, @fecha_pagado_sup) as pagado, '+
                'dbo.mes_anterior(@id, 1) as lectura1, '+
                'dbo.mes_anterior(@id, 2) as lectura2, '+
                'dbo.mes_anterior(@id, 3) as lectura3, '+
                'dbo.mes_anterior(@id, 4) as lectura4, '+
                'dbo.mes_anterior(@id, 5) as lectura5, '+
                'dbo.mes_anterior(@id, 6) as lectura6, '+
                'dbo.mes_anterior(@id, 7) as lectura7, '+
                'dbo.mes_anterior(@id, 8) as lectura8, '+
                'dbo.adeudo(@id, 1) as adeudo1, '+
                'dbo.adeudo(@id, 2) as adeudo2, '+
                'dbo.adeudo(@id, 3) as adeudo3, '+
                'dbo.adeudo(@id, 4) as adeudo4, '+
                'dbo.adeudo(@id, 5) as adeudo5, '+
                'dbo.adeudo(@id, 6) as adeudo6, '+
                'dbo.adeudo(@id, 7) as adeudo7, '+
                'dbo.fecha_emision(@id, 1) as fecha_emision1, '+
                'dbo.fecha_emision(@id, 2) as fecha_emision2, '+
                'dbo.fecha_emision(@id, 3) as fecha_emision3, '+
                'dbo.fecha_emision(@id, 4) as fecha_emision4, '+
                'dbo.fecha_emision(@id, 5) as fecha_emision5, '+
                'dbo.fecha_emision(@id, 6) as fecha_emision6, '+
                'dbo.fecha_emision(@id, 7) as fecha_emision7, '+
                'dbo.mes_facturado(@id, 1) as mes_facturado1, '+
                'dbo.mes_facturado(@id, 2) as mes_facturado2, '+
                'dbo.mes_facturado(@id, 3) as mes_facturado3, '+
                'dbo.mes_facturado(@id, 4) as mes_facturado4, '+
                'dbo.mes_facturado(@id, 5) as mes_facturado5, '+
                'dbo.mes_facturado(@id, 6) as mes_facturado6, '+
                'dbo.mes_facturado(@id, 7) as mes_facturado7 '+
                'FROM facthist a, padron b ' +
                'where a.contrato = @id ' +
                'AND a.contrato = b.contrato ' +
                'AND a.año = 2021 and a.mes = @mes_actual GROUP BY a.contrato, a.fecha_vencimiento, a.lectura_anterior, '+
                'a.lectura_actual, a.mes_facturado, a.recargo_actual, a.consumo_actual, a.consumo_vencido, a.recargo_vencido, '+
                'b.nombre, b.direccion, b.colonia, b.cp, b.giro, b.adeuda, '+
                'b.region, b.sector, b.reparto, b.estatus, b.tarifa, b.medidor')

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

        let a = result.recordset[0]['fecha_vencimiento'];

        //Formateamos fecha de vencimiento
        let mes_venci = ( "0" + (result.recordset[0]['fecha_vencimiento'].getMonth() +1 )).slice(-2);
        let dia_venci = result.recordset[0]['fecha_vencimiento'].getUTCDate();
        let anio_venci = result.recordset[0]['fecha_vencimiento'].getFullYear();

        result.recordset[0]['fecha_vencimiento'] = dia_venci+'/'+mes_venci+'/'+anio_venci;

        //Formateamos fechas de emision
        result.recordset[0]['fecha_emision1'] ? result.recordset[0]['fecha_emision1'] : '-'

        //Formateamos a dos decimales y comas por miles los valores
        result.recordset[0]['consumo_actual'] ? result.recordset[0]['consumo_actual'] = formatNumber(result.recordset[0]['consumo_actual']) : '';
        result.recordset[0]['consumo_vencido'] ? result.recordset[0]['consumo_vencido'] = formatNumber(result.recordset[0]['consumo_vencido']) : '';
        result.recordset[0]['recargo_actual'] ? result.recordset[0]['recargo_actual'] = formatNumber(result.recordset[0]['recargo_actual']) : '';
        result.recordset[0]['recargo_vencido'] ? result.recordset[0]['recargo_vencido'] = formatNumber(result.recordset[0]['recargo_vencido']) : '';
        
        result.recordset[0]['adeuda'] ? result.recordset[0]['adeuda'] = formatNumber(result.recordset[0]['adeuda']) : '';
        result.recordset[0]['pagado'] ? result.recordset[0]['pagado'] = formatNumber(result.recordset[0]['pagado']) : 0;

        //Diferencia de lo pagado y el adeudo
        if(result.recordset[0]['adeuda'] && result.recordset[0]['pagado']){
            console.log("si entra condi");
            result.recordset[0]['adeuda'] = result.recordset[0]['adeuda'] - result.recordset[0]['pagado']
        }
        
        result.recordset[0]['adeudo1'] ? result.recordset[0]['adeudo1'] = formatNumber(result.recordset[0]['adeudo1']) : '';
        result.recordset[0]['adeudo2'] ? result.recordset[0]['adeudo2'] = formatNumber(result.recordset[0]['adeudo2']) : '';
        result.recordset[0]['adeudo3'] ? result.recordset[0]['adeudo3'] = formatNumber(result.recordset[0]['adeudo3']) : '';
        result.recordset[0]['adeudo4'] ? result.recordset[0]['adeudo4'] = formatNumber(result.recordset[0]['adeudo4']) : '';
        result.recordset[0]['adeudo5'] ? result.recordset[0]['adeudo5'] = formatNumber(result.recordset[0]['adeudo5']) : '';
        result.recordset[0]['adeudo6'] ? result.recordset[0]['adeudo6'] = formatNumber(result.recordset[0]['adeudo6']) : '';
        result.recordset[0]['adeudo7'] ? result.recordset[0]['adeudo7'] = formatNumber(result.recordset[0]['adeudo7']) : '';

        //result.recordset[0]['adeuda'] ? result.recordset[0]['adeuda'] = formatNumber(result.recordset[0]['adeuda']) : '-';
        result.recordset[0]['consumo_actual'] ? result.recordset[0]['consumo_actual'] = formatNumber(result.recordset[0]['consumo_actual']) : '-';
        result.recordset[0]['consumo_vencido'] ? result.recordset[0]['consumo_vencido'] = formatNumber(result.recordset[0]['consumo_vencido']) : '-';


        //formateamos adeuda por que no pone doble cero cuando es = a 0
        if(result.recordset[0]['adeuda'] == 0){
            result.recordset[0]['adeuda']  = "0.00"
        }


        //Diferencias (-) de Consumo
        result.recordset[0]['consumo'] = result.recordset[0]['lectura_actual'] - result.recordset[0]['lectura_anterior'];

        result.recordset[0]['consumo1'] = result.recordset[0]['lectura2'] - result.recordset[0]['lectura3'];
        result.recordset[0]['consumo2'] = result.recordset[0]['lectura3'] - result.recordset[0]['lectura4'];
        result.recordset[0]['consumo3'] = result.recordset[0]['lectura4'] - result.recordset[0]['lectura5'];
        result.recordset[0]['consumo4'] = result.recordset[0]['lectura5'] - result.recordset[0]['lectura6'];
        result.recordset[0]['consumo5'] = result.recordset[0]['lectura6'] - result.recordset[0]['lectura7'];
        result.recordset[0]['consumo6'] = result.recordset[0]['lectura7'] - result.recordset[0]['lectura8'];

        const html = DOC(result.recordset[0]);

        const browser = await puppeteer.launch({
            //dumpio: true,
            headless: true,
            defaultViewport: null
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