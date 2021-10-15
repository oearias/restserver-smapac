const { Router} = require('express');
const { postItem, updateItem, checkItem } = require('../controllers/checkout');

const router = Router();


router.post('/', postItem);

//Generar intención del pago
router.patch('/:id', updateItem)

//Confirmar estatus del pago
router.patch('/confirm/:id', checkItem)

module.exports = router;