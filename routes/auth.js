const { Router } = require('express');
const { check } = require('express-validator');
const { login, forgotPassword, newPassword, googleSignin } = require('../controllers/auth');
const { emailExists } = require('../helpers/db-validators');
const { googleVerify } = require('../helpers/google-verify');

const { validarCampos } = require('../middlewares/validar-campos');

const router = Router();

router.post('/login', [
    check('email', 'El email es obligatorio').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validarCampos
], login);

router.put('/forgot-password',[
    check('email', 'El email es obligatorio').isEmail(),
    validarCampos
], forgotPassword)

//Establecer nueva contraseña
router.put('/new-password', newPassword);

//Google Signin
router.post('/google',[
    check('id_token', 'id_token es necesario').not().isEmpty(),
    validarCampos
], googleSignin)

//Este register existe actualmente en la ruta de usuarios
//router.post('/register', )

module.exports = router;