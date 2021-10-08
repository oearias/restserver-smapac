const { Router } = require('express');
const { check } = require('express-validator');
const { login } = require('../controllers/auth');
const { emailExists } = require('../helpers/db-validators');

const { validarCampos } = require('../middlewares/validar-campos');

const router = Router();

router.post('/login', [
    check('email', 'El email es obligatorio').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validarCampos
], login);

//router.post('/register', )

module.exports = router;