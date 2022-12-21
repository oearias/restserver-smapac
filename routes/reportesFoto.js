const { Router} = require('express');
const { reportesFotoGet, reporteFotoGet, reportesFotoDelete, reporteFotoGetByReporteId, } = require('../controllers/reportesFoto');
const router = Router();

router.get('/', reportesFotoGet);
router.get('/:id', reporteFotoGet);
router.get('/fotos/:id', reporteFotoGetByReporteId);
router.delete('/:id', reportesFotoDelete);



module.exports = router;