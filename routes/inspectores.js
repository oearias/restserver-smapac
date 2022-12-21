const { Router} = require('express');
const { inspectoresGet, inspectorGet, inspectorPost, inspectorPut, InspectorDelete } = require('../controllers/inspectores');
const router = Router();

router.get('/', inspectoresGet);

router.get('/:id', inspectorGet);

router.post('/',inspectorPost);

router.put('/:id',inspectorPut);

router.delete('/:id',InspectorDelete);



module.exports = router;