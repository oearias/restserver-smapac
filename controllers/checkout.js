const { response } = require('express');
const { getConnection } = require('../database/connection');
const sql = require('mssql');
const { v4: uuidv4 } = require('uuid');
const { generatePaymentIntent, generatePaymentMethod, getPaymentDetail } = require('../services/stripe');
const nodemailer = require("nodemailer");
const crypto = require('crypto');

const postItem = async (req, res = response) => {

    try {

        console.log(req.body);

        const { amount, contrato, nombre, email } = req.body;

        const localizator = uuidv4();

        const pool = await getConnection();

        await pool.request()
            .input("amount", sql.Float, amount)
            .input("name", sql.VarChar, nombre)
            .input("email", sql.VarChar, email)
            .input("contrato", sql.Int, contrato)
            .input("localizator", sql.VarChar, localizator)
            .input("status", sql.VarChar, 'Wait')
            .query('INSERT into orden (name, amount, contrato, localizator, status, email) values (@name, @amount, @contrato, @localizator, @status, @email)');


        const result = await pool.request()
            .input("localizator", localizator).query("Select * from orden where localizator = @localizator");



        res.json({
            contrato,
            amount,
            localizator
        })
    } catch (e) {
        console.log(e);
        res.status(500);
        res.send({ error: 'Algo ocurrio' })
    }
}

const updateItem = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { token } = req.body

        //TODO: Buscamos orden en nuestra base de datos
        const pool = await getConnection();

        const result = await pool.request()
            .input("id", id)
            .query("Select * from orden where localizator = @id");


        const monto = result.recordset[0]['amount'];
        const name = result.recordset[0]['name'];
        const contrato = result.recordset[0]['contrato'];
        const email = result.recordset[0]['email'];
        const uid = result.recordset[0]['id'];


        //TODO: Generamos metodo de pago en Stripe
        const responseMethod = await generatePaymentMethod(token) //TODO: 🔴 Token magico!

        //TODO: Generamos intencion de pago
        const resPaymentIntent = await generatePaymentIntent(
            {
                amount: monto,
                user: name,
                contrato: contrato,
                email: email,
                payment_method: responseMethod.id
            }
        )

        //TODO: Actualizamos  orden con id de intencion de pago

        const actualiza = await pool.request()
            .input("id", uid)
            .input("stripeid", resPaymentIntent.id)
            .query("UPDATE orden SET stripe_id = @stripeid where id = @id ");


        res.send({ data: resPaymentIntent })

    } catch (e) {
        console.log(e.message)
        res.status(500);
        res.send({ error: 'Algo ocurrió' })
    }
}

const checkItem = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('id from server: ', id);

        const pool = await getConnection();

        const result = await pool.request()
            .input("id", id)
            .query("Select * from orden where localizator = @id");


        const stripeId = result.recordset[0]['stripe_id'];
        const localizator = result.recordset[0]['localizator'];

        //TODO: Solicitamos a stripe que nos devuelva la informacion de la orden

        const detailStripe = await getPaymentDetail(stripeId)

        const status = detailStripe.status.includes('succe') ? 'success' : 'fail'

        //TODO: Actualizamos nuestra orden con el estatus
        //await orders.findOneAndUpdate({ localizator: id }, { status })

        const actualiza = await pool.request()
            .input("localizator", localizator)
            .input("status", status)
            .query("UPDATE orden SET status = @status where localizator = @localizator ");


        //Aqui tenemos que actualizar el adeudo del usuario

        const consulta = await pool.request().input("localizator", localizator).query("Select * from orden where localizator = @localizator");


        //Estado es el nuevo status
        const estado = consulta.recordset[0]['status'];
        const contrato = consulta.recordset[0]['contrato'];
        const email = consulta.recordset[0]['email'];
        const monto = consulta.recordset[0]['amount'];
        const nombre = consulta.recordset[0]['name'];

        console.log(consulta);
        //console.log(consulta);

        console.log(detailStripe);
        //console.log(detailStripe.last_payment_error.message);

        if (estado == "success") {
            console.log("Usuario en 0")

            await pool.request().input("contrato", contrato).query("UPDATE padron SET adeuda = 0 where contrato= @contrato");

            ////////Aquí mandamos el correo al usuario


            //TODO: SendEmail
            try {

                let destinatario = email;

                let fecha = new Date();

                let anio = fecha.getFullYear();
                let mes = fecha.getMonth();
                let dia = fecha.getDate();

                let fechaAux = dia + "/" + mes + "/" + anio

                let metodo = "VISA";

                let transporter = nodemailer.createTransport({
                    host: process.env.HOST_FEROZO,
                    port: 465,
                    secure: true, // true for 465, false for other ports
                    auth: {
                        user: process.env.USER_FEROZO, // generated ethereal user
                        pass: process.env.PASSWORD_FEROZO, // generated ethereal password
                    },
                });

                transporter.verify().then(() => {
                    console.log("Ready for send emails");
                });

                // send mail with defined transport object
                await transporter.sendMail({
                    from: ' "Recibo SMAPAC" <noreply@smapac.gob.mx>', // sender address
                    to: destinatario, // list of receivers
                    subject: "Aquí tienes el recibo de tu pago a SMAPAC", // Subject line
                    html: '<div>' +
                        '<div style="text-align: center; font-size: 18px; font-weight: 700;">' +
                        '<div style="padding: 0;">SISTEMA MUNICIPAL DE AGUA POTABLE</div>' +
                        '<div style="margin: 0">Y ALCANTARILLADO DE CARMEN</div>' +
                        '</div>' +
                        '<div style="text-align: center;">' +
                        '<h3>Recibo SMAPAC</h3>' +
                        '</div><table>' +
                        '<thead style="font-size: 14px;">' +
                        '<th style="padding-left: 10px;">MONTO PAGADO</th>' +
                        '<th style="padding-left: 10px;">FECHA DE PAGO</th>' +
                        '</thead>' +
                        '<tbody style="font-size: 18px">' +
                        '<tr><td style="padding-left: 10px;">$' + monto + '</td>' +
                        '<td style="padding-left: 10px;">' + fechaAux + '</td>' +
                        '</tr>' +
                        '</tbody>' +
                        '</table><div style="padding-left: 10px; margin-top: 20px; font-weight: 700;">' +
                        'RESUMEN:</div>' +
                        '<div style="background-color: rgb(238, 238, 238); height: 130px;">' +
                        '<div style="padding-left: 10px; margin-top: 20px; padding-top: 20px;">Contrato: <b>' + contrato + '</b> - Pago servicio de Agua Potable - Usuario: ' + nombre + ' </div>' +
                        '<br><hr><div style="padding-left: 10px; padding-top: 10px; font-weight: 700;"> Monto cargado: MXN $' + monto +
                        '</div>' +
                        '</div>' +
                        '<div style="padding-left: 10px; margin-top: 20px;"> Si tienes alguna duda, contáctanos al correo:<br>' +
                        'facturaelectronica@smapac.gob.mx o llama al teléfono 938 388 29 23.' +
                        '<div style="font-size: 10px; margin-top: 30px;">' +
                        'Estás recibiendo este correo por que has realizado un pago en SMAPAC.' +
                        '</div>' +
                        '</div>' +
                        '</div>', // html body
                }, (error, info) => {
                    if (error) {
                        emailMessage = "Hubo un error " + error.message;
                    } else {
                        emailMessage = "Mensaje enviado: " + info.response;
                    }
                });


            } catch (error) {
                console.log(error);
                return res.status(400).json({ message: 'Algo ha ido mal' })
            }



            ///////////


        }

        console.log(detailStripe.status);

        res.json({ data: detailStripe })

    } catch (e) {
        console.log(e.message)
        res.status(500);
        res.send({ error: 'Algo ocurrió ' })
    }
}

const respMulti = async (req, res = response) => {

    /*console.log(req);
    console.log(req.params);
    console.log(req.body);*/

    const { codigo, mensaje, autorizacion, referencia, importe, mediopago, financiado, plazos, s_transm, signature, tarjetahabiente, cveTipoPago, fechapago, tarjeta, banco } = req.body;


    const idExpress = "2328";
    //Iniciamos con las decisiones

    let result;
    let message = referencia + importe + idExpress;


    //Genero una signature del lado del servidor.
    let hash = crypto.createHmac('sha256', process.env.MULTIPAGOSKEY).update(message);
    const mySignature = hash.digest('hex');

    const cadena = referencia;
    const cadenaAux = cadena.split('_');
    const contrato = cadenaAux[1];


    if (codigo == 1) {
        result = "Su pago fue rechazado";
    } else if (codigo == 4) {
        result = "Se detectó un problema con su pago, verifique con su administrador."
    } else if (codigo == 5) {
        result = "Ya se encuentra un pago con la referencia: " + referencia;
    } else if (codigo == 0 || codigo == 3) {
        //Comparo la signature que me envían con la que yo genero
        if (signature != mySignature) {
            result = "Error en los datos del pago. No se ha podido concluir la transacción."
        } else {
            if (codigo == 3) {
                result = "El pago se realizó por CLABE, el cobro se realizará dentro de 1 o 2 días hábiles, "
                    + " si el cobro no se realiza en este tiempo favor de comunicarse."
            } else {
                result = "El pago se realizó correctamente, número de autorización: " + autorizacion;


                try {
                    //Ponemos en 0 la tabla
                    const pool = await getConnection();
                    const resultado = await pool.request()
                    await pool.request().input("contrato", contrato).query("UPDATE padron SET adeuda = 0 where contrato= @contrato");

                    console.log(resultado);

                } catch (error) {
                    console.log(error);
                }


                res.render('thankyou', {
                    codigo,
                    contrato,
                    referencia,
                    mensaje,
                    autorizacion
                });
            }
        }
    } else {
        result = "Tuvimos un problema con su pago."
    }




    console.log("Codigo: " + codigo);
    console.log("Mensaje: " + mensaje);
    console.log("Autorizacion: " + autorizacion);
    console.log("Contrato: ", contrato);

    //Inserto datos en la tabla

    if (codigo != 0) {
        res.render('none', {
            mensaje
        });
    }



}


module.exports = {
    postItem,
    updateItem,
    checkItem,
    respMulti
}