const { response } = require('express');
const { getConnection } = require('../database/connection');
const sql = require('mssql');
const { v4: uuidv4 } = require('uuid');
const { generatePaymentIntent, generatePaymentMethod, getPaymentDetail } = require('../services/stripe')

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
        const uid = result.recordset[0]['id'];


        //TODO: Generamos metodo de pago en Stripe
        const responseMethod = await generatePaymentMethod(token) //TODO: 🔴 Token magico!

        //TODO: Generamos intencion de pago
        const resPaymentIntent = await generatePaymentIntent(
            {
                amount: monto,
                user: name,
                contrato: contrato,
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

            const consulta = await pool.request().input("localizator",localizator).query("Select * from orden where localizator = @localizator");


            //Estado es el nuevo status
            const estado = consulta.recordset[0]['status'];
            const contrato = consulta.recordset[0]['contrato'];

            console.log(consulta);
            //console.log(consulta);

            console.log(detailStripe);
            //console.log(detailStripe.last_payment_error.message);

            if(estado == "success"){
                console.log("Usuario en 0")

                await pool.request().input("contrato", contrato).query("UPDATE padron SET adeuda = 0 where contrato= @contrato");

                //Aquí mandamos el correo al usuario


            }

            console.log(detailStripe.status);

        res.json({ data: detailStripe })

    } catch (e) {
        console.log(e.message)
        res.status(500);
        res.send({ error: 'Algo ocurrió ' })
    }
}


module.exports = {
    postItem,
    updateItem,
    checkItem
}