const { response } = require('express');
const bcryptjs = require('bcryptjs');
const sql = require('mssql');
const { getConnection } = require('../database/connection');

const nodemailer = require("nodemailer");
const { generarJWT, genTokenPassword, getTokenPassword } = require('../helpers/generate-jwt');
const { googleVerify } = require('../helpers/google-verify');
const { json } = require('body-parser');

const login = async (req, res = response) => {

    
    try {
        const { email, password } = req.body;

        //Validamos que exista el email
        const pool = await getConnection();
        const resul = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * from usuario where email = @email')

        const exist = resul.recordset.length;

        if (exist < 1) {
            return res.json({ msg: 'El correo no existe en la base de datos' })
        }

        const id = resul.recordset[0]['id'];
        const pass = resul.recordset[0]['password'];
        const nombre = resul.recordset[0]['nombre'];

        //Verificar la contraseña
        const validPassword = bcryptjs.compareSync(password, pass)

        if (!validPassword) {
            return res.status(400).json({
                msg: 'Usuario o Contraseña son incorrectos'
            })
        }

        //Generar el JWT
        const token = await generarJWT(id);

        res.json({
            email,
            nombre,
            token
        })

    } catch (error) {

        console.log(error);

        res.status(500).json({
            error: error.message,
            msg: 'Algo salió mal, hable con el Administrador'
        })
    } /*finally {
        pool.close();
    }*/

}

const forgotPassword = async (req, res = response) => {

    const { email } = req.body;

    const pool = await getConnection();

    if (!email) {
        res.status(400).json({
            msg: 'Email es requerido'
        });
    }

    const message = 'Revise su email para cambiar la contraseña';
    let verificationLink;
    let emailStatus = 'OK';

    try {

        const result = await pool.request()
            .input('email', email)
            .query('SELECT id, email FROM usuario WHERE email=@email');


        const id = result.recordset[0]['id'];

        if (result.recordset.length > 0) {

            const token = await genTokenPassword(id, email);

            //verificationLink = process.env.URL_API+`auth/new-password/${token}`;

            verificationLink = process.env.URL_CLIENT + `#/reset?t=${token}`;

            //inserto en la tabla usuario colum resetToken el token
            await pool
                .request()
                .input('reset_token', sql.VarChar, token)
                .input('id', sql.Int, id)
                .query('UPDATE usuario SET reset_token = @reset_token WHERE id = @id')

            res.json({
                message,
                info: emailStatus
            })

        } else {
            return res.json(message);
        }

    } catch (error) {
        return res.json(message)
    } finally {
        pool.close();
    }


    //SendEmail
    try {

        let destinatario = email;

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
            from: ' "Reset your password" <noreply@smapac.gob.mx>', // sender address
            to: destinatario, // list of receivers
            subject: "Restaura la contraseña de tu Cuenta SMAPAC", // Subject line
            html: "<span>Para cambiar la contraseña de tu cuenta en SMAPAC, haz clic en el siguiente link o pega en tu navegador: </span><br><br> " + verificationLink + " <br><br><span>El enlace expirará en 72 horas, asegurate de utilizarlo de inmediato.<span>", // html body
        }, (error, info) => {
            if (error) {
                emailMessage = "Hubo un error " + error.message;
            } else {
                emailMessage = "Mensaje enviado: " + info.response;
            }
        });


    } catch (error) {
        return res.status(400).json({ message: 'Algo ha ido mal' })
    }

}

const newPassword = async (req, res = response) => {

    const pool = await getConnection();

    const { newPassword } = req.body;
    const resetToken = req.headers.reset.toString();    //as string, en dado caso que no funcione el toString instalamos y configuramos babel

    if ((!resetToken) && (!newPassword)) {
        return res.status(400).json({ msg: "Todos los campos son requeridos" })
    }

    let jwtPayload;

    try {
        jwtPayload = await getTokenPassword(resetToken);

        const result = await pool.request().input("reset_token", resetToken).query("Select id, email from usuario where reset_Token = @reset_token ");

        //const id = result.recordset[0]['id'];
        const email = result.recordset[0]['email'];


        //Encriptamos la contraseña y actualizamos el usuario

        //Encriptar password
        const salt = bcryptjs.genSaltSync();
        const pass = bcryptjs.hashSync(newPassword, salt);

        //user.password = nuevo password enviado desde el front  ---- SQL UPDATE

        const result2 = await pool.request()
            .input("email", email)
            .input("password", pass)
            .query('UPDATE usuario set password = @password where email = @email');

        console.log(result2);


    } catch (error) {
        return res.status(401).json({ message: error.message })
    } finally {
        pool.close();
    }


    res.json({ message: 'La contraseña ha sido cambiada' })
}

const googleSignin = async (req, res = response) => {

    const { id_token } = req.body;

    console.log(id_token);

    try {

        //const googleUser = await googleVerify(id_token);
        const { nombre, email } = await googleVerify(id_token);

        console.log(nombre);
        console.log(email);

        //Validamos que el usuario no exista

        const pool = await getConnection();
        const resul = await pool.request()
            .input('email', email)
            .query('SELECT * from usuario where email = @email')

        const exist = resul.recordset.length;

        console.log(exist)

        if (exist < 1) {

            console.log("El correo no existe en la DB");
            //Creo el usuario

            try {
                const pool = await getConnection();

                //password = :p
                const pass = ":p"

                //Inserta nuevo usuario
                await pool.request()
                    .input('email', sql.VarChar, email)
                    .input('nombre', sql.VarChar, nombre)
                    .input('password', sql.VarChar, pass)
                    .query('INSERT INTO usuario (email, nombre, password) values (@email, @nombre, @password)')


                const result = await pool.request()
                                    .input('email', email)
                                    .query("SELECT id, email, nombre FROM usuario WHERE email = @email");

                if(result.recordset[0]){

                    const id = result.recordset[0]['id'];

                    //Generar el JWT
                    const token = await generarJWT(id);

                    console.log(token);

                    res.json({
                        email,
                        msg: `Usuario: ${email} registrado correctamente`,
                        token,
                        flag: 1
                    });

                }else{
                    console.log("Consulta fallida");
                }


                

            }catch (error) {
                console.warn(error.message);
            }

        } else {
            //Si existe...
            console.log("El correo existe!!!");

            const result = await pool.request()
                                    .input('email', email)
                                    .query("SELECT id, email, nombre FROM usuario WHERE email = @email");

                if(result.recordset){

                    const id = result.recordset[0]['id'];

                    console.log(id);

                    //Generar el JWT
                    const token = await generarJWT(id);

                    const data = {
                        email,
                        nombre,
                        token,
                        flag: 1
                    }

                    console.log(data);

                    res.json(data);

                }else{
                    console.log("Consulta fallida");
                }

            
        }

    } catch (error) {
        res.status(400).json({
            ok: false,
            msg: 'El token no se pudo verificar',
            error: error.message
        })
    }



    /*try {

        const { nombre, email, img} = await googleVerify(id_token);

        let user = await User.findOne({ email });

        if( !user ){
            // Si el usuario no existe tengo que crearlo

            const data = {
                nombre,
                email,
                password: ':p',
                img,
                google: true
            };

            user = new User(data);
            await user.save();
        }

        // Si el usuario en BD está inactivo

        if( !user.status ){
            return res.status(401).json({
                msg: 'Hable con el Administrador - Usuario inactivo'
            })
        }

        // Generar el JWT
        const token = await generarJWT(user.id);

        res.json({
            user,
            token
        });

    } catch (error) {
        res.status(400).json({
            msg: 'Token de Google no es válido'
        })
    }*/


}

module.exports = {
    login,
    forgotPassword,
    newPassword,
    googleSignin
}