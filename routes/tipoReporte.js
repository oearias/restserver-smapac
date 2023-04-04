const { Router} = require('express');
const { tipoReporteGet, tipoReportesGet, tipoReportePost, tipoReportePut, tipoReporteDelete } = require('../controllers/tipoReporte');
const router = Router();

router.get('/', tipoReportesGet);
router.get('/:id', tipoReporteGet);
router.post('/', tipoReportePost);
router.put('/:id', tipoReportePut);
router.delete('/:id', tipoReporteDelete);

module.exports = router;