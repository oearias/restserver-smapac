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

        const fecha_pagado_inf = '2021-12-16';
        const fecha_pagado_sup = '2022-01-17';
        const mes_actual = 12;
        const mes_facturado = 'Dic2021';


        //Esto me está dando error
        //Hacemos este procedimiento porque gon el getmonth daba mes erroneo
        /*mes_actual = fecha_actual.toLocaleString();
        mes_actual = mes_actual.split('/');
        mes_actual = Number(mes_actual[1]);*/
        anio_actual = fecha_actual.getFullYear();

        console.log("fecha de lo pagado: "+fecha_pagado_inf);
        console.log("fecha de lo pagado: "+fecha_pagado_sup);
        console.log('Mes actual: ',mes_actual);

        //Iniciamos leyendo plantilla
        const template = fs.readFileSync('./views/template_recibo.hbs', 'utf-8');
        const DOC = handlebars.compile(template);

        const result = await pool.request()
        .input("mes_actual", mes_actual)
        .input("mes_facturado", mes_facturado)
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