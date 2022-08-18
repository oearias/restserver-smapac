const { Router} = require('express');
const { periodoGet } = require('../controllers/periodos');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = Router();

//router.get('/', contratosGet);


//Ruta sin validar el token
//router.get('/:id', validarJWT, contratoGet);
router.get('/', periodoGet);

module.exports = router;