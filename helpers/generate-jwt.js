const jwt = require('jsonwebtoken')

const generarJWT = (id='') => {

    return new Promise( (resolve, reject)=> {
        
        const payload = { id };

        jwt.sign( payload, process.env.SECRETORPRIVATEKEY, {
            expiresIn: '1h'
        }, (err, token) => {
            
            if(err) {
                reject('No se pudo generar el token');
            }else{
                resolve(token);
            }
        })
    })
}

const genTokenPassword = (id='', email='') => {


    return new Promise ( (resolve, reject)=>{
        const payload = {id, email}

        jwt.sign(payload, process.env.SECRETORPRIVATEKEY, {
            expiresIn: '2d'
        }, (err, token) => {

            if(err) {
                console.log(err);
                reject('No se pudo generar el token');
            }else{
                resolve(token);
            }

        })
    })
}

const getTokenPassword = ( resetToken='' ) => {
    return new Promise ( (resolve, reject) => {

        jwt.verify(resetToken, process.env.SECRETORPRIVATEKEY, (err, verificado) => {
            if(err){
                reject('No se puedo verificar el token');
            }else{
                resolve(verificado)
            }
        } );

    } )
}

module.exports = {
    
    generarJWT,
    genTokenPassword,
    getTokenPassword
}