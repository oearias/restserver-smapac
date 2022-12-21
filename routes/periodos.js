const { Router} = require('express');
const { periodoGet } = require('../controllers/periodos');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = Router();

router.get('/', periodoGet);


module.exports = router;