const { Router} = require('express');
const { inspectoresGet, inspectorGet, inspectorPost } = require('../controllers/inspectores');
const router = Router();

router.get('/', inspectoresGet);

router.get('/:id', inspectorGet);

router.post('/',inspectorPost);



module.exports = router;