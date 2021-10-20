const { Router} = require('express');
const { postItem, updateItem, checkItem, respMulti } = require('../controllers/checkout');

const router = Router();


router.post('/', postItem);

//Generar intención del pago
router.patch('/:id', updateItem)

//Confirmar estatus del pago
router.patch('/confirm/:id', checkItem);

//Ruta respuesta Multipagos
router.post('/respuesta.html', respMulti);

module.exports = router;