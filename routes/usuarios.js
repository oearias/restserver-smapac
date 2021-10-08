const { Router} = require('express');
const { check } = require('express-validator');

const { usuariosGet, usuariosPost, usuariosPut, usuariosDelete, usuarioGet } = require('../controllers/usuarios');
const { emailExists } = require('../helpers/db-validators');
const { validarCampos } = require('../middlewares/validar-campos');

const router = Router();

//router.get('/', usuariosGet);

router.get('/:id', usuarioGet)

router.post('/', [
    check('email','El correo ingresado no tiene un formato válido').isEmail(),
    check('email').custom(emailExists),
    check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({min: 6}), 
    validarCampos
], usuariosPost);

router.put('/:id', usuariosPut);

router.delete('/:id', usuariosDelete);


module.exports = router;