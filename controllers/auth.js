const { response } = require('express');
const bcryptjs = require('bcryptjs');
const sql = require('mssql');
const { getConnection } = require('../database/connection');

const nodemailer = require("nodemailer");
const { generarJWT, genTokenPassword, getTokenPassword } = require('../helpers/generate-jwt');

const login = async (req, res = response) => {

    try {
        const { email, password } = req.body;

        console.log(email);

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
            token
        })

    } catch (error) {
        res.status(500).json({
            error: error.message,
            msg: 'Algo salió mal, hable con el Administrador'
        })
    }

}

const forgotPassword = async (req, res = response) => {

    const {email} = req.body;

    if(!email){
        res.status(400).json({
            msg: 'Email es requerido'
        });
    }

    const message = 'Revise su email para cambiar la contraseña';

    let verificationLink;

    let emailStatus = 'OK';

    try {
        const pool = await getConnection();

        const result = await  pool.request()
                            .input('email', email)
                            .query('SELECT id, email FROM usuario WHERE email=@email');


        const id = result.recordset[0]['id'];

        if( result.recordset.length > 0){

            const token = await genTokenPassword(id, email);

            verificationLink = process.env.URL_API+`new-password/${token}`;

            //inserto en la tabla usuario colum resetToken el token
            const inserta = await pool
                                .request()
                                .input('reset_token', sql.VarChar, token)
                                .input('id', sql.Int, id)
                                .query('UPDATE usuario SET reset_token = @reset_token WHERE id = @id')

            res.json({
                message,
                info: emailStatus,
                //test: verificationLink
            })

        }else{
            return res.json(message)
        }

    } catch (error) {
        return res.json(message)
    }


    //TODO: SendEmail
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

          transporter.verify().then( () => {
              console.log("Ready for send emails");
          });
        
          // send mail with defined transport object
          await transporter.sendMail({
            from: ' "Reset your password" <noreply@smapac.gob.mx>', // sender address
            to: destinatario, // list of receivers
            subject: "Restaura la contraseña de tu Cuenta SMAPAC", // Subject line
            html: "<span>Para cambiar la contraseña de tu cuenta en SMAPAC, haz clic en el siguiente link o pega en tu navegador: </span><br><br> "+verificationLink + " <br><br><span>El enlace expirará en 72 horas, asegurate de utilizarlo de inmediato.<span>", // html body
          }, (error, info) => {
              if (error){
                  emailMessage = "Hubo un error "+error.message;
              }else{
                  emailMessage = "Mensaje enviado: "+info.response;
              }
          } );


          /*let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: testAccount.user, // generated ethereal user
              pass: testAccount.pass, // generated ethereal password
            },
          });
        
          // send mail with defined transport object
          let info = await transporter.sendMail({
            from: '"Fred Foo 👻" <foo@example.com>', // sender address
            to: "bar@example.com, baz@example.com", // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", // html body
          });
        
          console.log("Message sent: %s", info.messageId);
          // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        
          // Preview only available when sending through an Ethereal account
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));*/
         


    } catch (error) {
        return res.status(400).json({message: 'Algo ha ido mal'})
    }

}

const newPassword = async (req, res = response) => {

    const {newPassword} = req.body;
    const resetToken = req.headers.reset.toString();    //as string, en dado caso que no funcione el toString instalamos y configuramos babel

    if((!resetToken)&&(!newPassword)){
        return res.status(400).json({msg: "Todos los campos son requeridos"})
    }

    let jwtPayload;

    try {
        jwtPayload = await getTokenPassword(resetToken);

        const pool = await getConnection();

        const result = await pool.request().input("reset_token", resetToken).query("Select id, email from usuario where reset_Token = @reset_token ");

        //

        const id = result.recordset[0]['id'];
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
        return res.status(401).json({message: error.message})
    }


    res.json({message: 'La contraseña ha sido cambiada'})
}

module.exports = {
    login,
    forgotPassword,
    newPassword
}