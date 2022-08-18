const { Router} = require('express');
const { reciboGet, downloadRecibo, /*reciboTest*/ } = require('../controllers/recibos');

const router = Router();

router.post('/:id', reciboGet);

//Endpoint al Playwright
router.post('/browser/:id', downloadRecibo);


/*router.post('/recibo/:id', reciboTest)*/

module.exports = router;