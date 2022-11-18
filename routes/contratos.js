const { Router} = require('express');
const { contratoGet, contratosGet, contratoGetByUserId, addContratoUser, contratoGetByUserEmail, deleteContratoUser, contratoEmail } = require('../controllers/contratos');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = Router();

//router.get('/', contratosGet);

//Ruta sin validar el token
//router.get('/:id', validarJWT, contratoGet);
router.get('/:id', contratoGet);

router.get('/consulta/:email', contratoGetByUserEmail);

router.post('/add/:id', addContratoUser);

router.delete('/delete/:id', deleteContratoUser);

router.get('/test/:email', contratoEmail);


module.exports = router;