const { Router} = require('express');
const { reciboGet } = require('../controllers/recibos');


const router = Router();


router.post('/:id', reciboGet);



module.exports = router;