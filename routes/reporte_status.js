const { Router} = require('express');
const { reporteStatusGet, reportStatusGet, reportStatusPost, reportStatusPut, reportStatusDelete,  } = require('../controllers/reporte_status');
const router = Router();

router.get('/', reporteStatusGet);
router.get('/:id', reportStatusGet);
router.post('/', reportStatusPost);
router.put('/:id', reportStatusPut);
router.delete('/:id',reportStatusDelete);

module.exports = router;
