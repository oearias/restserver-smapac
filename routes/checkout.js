const { Router} = require('express');
const { postItem, updateItem, checkItem, respMulti } = require('../controllers/checkout');
const crypto = require('crypto');

const router = Router();


router.post('/', postItem);

//Generar intención del pago
router.patch('/:id', updateItem)

//Confirmar estatus del pago
router.patch('/confirm/:id', checkItem);

//Ruta respuesta Multipagos
router.post('/respuesta.html', respMulti);

router.get('/recibo', (req, res)=>{

    res.render('thankyou');

})

router.get('/test', (req, res)=>{

    const importe = "111";

    const idExpress = "2328";
    //Iniciamos con las decisiones
    const referencia = "123";

    let result;
    let message = referencia+importe+idExpress;

    //Genero una signature del lado del servidor.
    let hash = crypto.createHmac('sha256', process.env.MULTIPAGOSKEY).update(message);
    const mySignature = hash.digest('hex');

    const cadena = referencia;
    const cadenaAux = cadena.split('_');
    const contrato = cadenaAux[1]; 

    res.render('form', {importe, mySignature, idExpress});

})

module.exports = router;