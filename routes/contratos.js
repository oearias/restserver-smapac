const { Router} = require('express');
const { contratoGet, contratosGet } = require('../controllers/contratos');

const router = Router();

router.get('/', contratosGet);

router.get('/:id', contratoGet);

/*

router.put('/:id', usuariosPut);

*/

module.exports = router;