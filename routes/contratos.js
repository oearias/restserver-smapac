const { Router} = require('express');
const { contratoGet, contratosGet, contratoGetByUserId, addContratoUser } = require('../controllers/contratos');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = Router();

router.get('/', contratosGet);

//Ruta sin validar el token
//router.get('/:id', validarJWT, contratoGet);
router.get('/:id', contratoGet);

router.get('/consulta/:id', contratoGetByUserId);

router.post('/add/:id', addContratoUser);

/*

router.put('/:id', usuariosPut);

*/

module.exports = router;