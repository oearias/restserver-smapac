const { response } = require('express');
const { getConnection } = require('../database/connection');

const periodoGet = async (req, res = response) => {

    const pool = await getConnection();

    try {

        const result = await pool.request().query('SELECT * FROM periodo_facturac WHERE estatus = 1');

        const mes_facturado = result.recordset[0]['mes_facturado_c'];
        let fecha_vencimiento = result.recordset[0]['fecha_sup'];

        let fecha = new Date(fecha_vencimiento);
        //Esta porcion de codigo no le resta un dia a la fecha
        fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());

        // const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        const month = ['01','02','03','04','05','06','07','08','09','10','11','12'];

        let mes = month[fecha.getMonth()];
        let anio = fecha.getFullYear();
        let dia = fecha.getDate();

        fecha_vencimiento = dia +'/'+ mes + '/' + anio
  
        res.json(
            {
                mes_facturado,
                fecha_vencimiento
            }
        );

    } catch (error) {
        res.status(500).send(error.message);
        
    }finally{
        pool.close();

    }
}

module.exports = {
    periodoGet
}