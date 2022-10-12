const { Router} = require('express');
const { check } = require('express-validator');
const { inspectoresGetByReporteId } = require('../controllers/inspectores');
const { reportesGet, reporteGet, reportesPost, reportesPut, reportesDelete, reportesPatch, uploadFoto, reporteGetByFolio, reporteGetByContrato, reporteGetByCriterio } = require('../controllers/reportes');
const { validarCampos } = require('../middlewares/validar-campos');
const router = Router();

router.get('/',  reportesGet);

router.get('/:id', reporteGet);

router.get('/criterio/:criterio/id/:id', reporteGetByCriterio);

router.get('/contrato/:id', reporteGetByContrato);

router.post('/', [
    check('contrato', 'Es necesario capturar el contrato' ).not().isEmpty(),
    check('folio', 'Es necesario capturar el Folio' ).not().isEmpty(),
    check('fecha_reporte', 'Es necesario capturar la fecha del reporte' ).not().isEmpty(),
    check('fecha_realizacion', 'Es necesario capturar la fecha de realizacion' ).not().isEmpty(),
    check('descripcion', 'Es necesario capturar la descripción' ).not().isEmpty(),
    check('tipo_orden', 'Es necesario capturar el tipo de orden' ).not().isEmpty(),
    check('reporte_estatus', 'Es necesario capturar estatus del reporte' ).not().isEmpty(),
    validarCampos 
], reportesPost);

router.patch('/:id', reportesPatch);
router.delete('/:id', reportesDelete);
router.post('/uploadFoto/:folio', uploadFoto);

router.get('/inspectores/:id', inspectoresGetByReporteId)

module.exports = router;