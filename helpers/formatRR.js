const { formatNumber } = require("./format");

const formatResultRecordset = (result = []) => {

    try {

        if(result.recordset[0]['fecha_vencimiento']){
            

            //Formateamos fecha de vencimiento
            let mes_venci = ("0" + (result.recordset[0]['fecha_vencimiento'].getMonth() + 1)).slice(-2);
            let dia_venci = result.recordset[0]['fecha_vencimiento'].getUTCDate();
            let anio_venci = result.recordset[0]['fecha_vencimiento'].getFullYear();

            result.recordset[0]['fecha_vencimiento'] = dia_venci + '/' + mes_venci + '/' + anio_venci;
        }

        //Formateamos fechas de emision
        result.recordset[0]['fecha_emision1'] ? result.recordset[0]['fecha_emision1'] : '-'

        //Leyendas de Conceptos
        if (result.recordset[0]['drenaje'] > 0) {
            result.recordset[0]['label_drenaje'] = 'Drenaje';
        }

        if (result.recordset[0]['pipas'] > 0) {
            result.recordset[0]['label_pipas'] = 'Pipa de agua';
        }

        if (result.recordset[0]['iva'] > 0) {
            result.recordset[0]['label_iva'] = 'IVA';
        }

        if (result.recordset[0]['pagado'] > 0) {
            result.recordset[0]['label_pagado'] = 'Ha pagado:';
        }

        if (result.recordset[0]['recargo_actual'] > 0) {
            result.recordset[0]['label_recargo'] = 'Recargos:';
        }

        if (result.recordset[0]['favor'] < 0) {
            result.recordset[0]['label_favor'] = 'a favor';
        }

        
        //Formateamos a dos decimales y comas por miles los valores
        result.recordset[0]['consumo_actual'] ? result.recordset[0]['consumo_actual'] = '$' + formatNumber(result.recordset[0]['consumo_actual']) : '';
        result.recordset[0]['consumo_vencido'] ? result.recordset[0]['consumo_vencido'] = '$' + formatNumber(result.recordset[0]['consumo_vencido']) : '';
        result.recordset[0]['recargo_actual'] ? result.recordset[0]['recargo_actual'] = '$' + formatNumber(result.recordset[0]['recargo_actual']) : '';
        result.recordset[0]['recargo_vencido'] ? result.recordset[0]['recargo_vencido'] = '$' + formatNumber(result.recordset[0]['recargo_vencido']) : '';
        result.recordset[0]['drenaje'] ? result.recordset[0]['drenaje'] = '$' + formatNumber(result.recordset[0]['drenaje']) : '';
        result.recordset[0]['drenaje_vencido'] ? result.recordset[0]['drenaje_vencido'] = '$' + formatNumber(result.recordset[0]['drenaje_vencido']) : '';
        result.recordset[0]['iva'] ? result.recordset[0]['iva'] = '$' + formatNumber(result.recordset[0]['iva']) : '';
        result.recordset[0]['iva_vencido'] ? result.recordset[0]['iva_vencido'] = '$' + formatNumber(result.recordset[0]['iva_vencido']) : '';
        result.recordset[0]['pipas'] ? result.recordset[0]['pipas'] = '$' + formatNumber(result.recordset[0]['pipas']) : '';
        result.recordset[0]['pipas_vencido'] ? result.recordset[0]['pipas_vencido'] = '$' + formatNumber(result.recordset[0]['pipas_vencido']) : '';
        result.recordset[0]['favor'] ? result.recordset[0]['favor'] = '$' + formatNumber(result.recordset[0]['favor']) : '';

        //Desaparecemos los valores que sean = a 0
        (result.recordset[0]['consumo_vencido'] == 0) ? result.recordset[0]['consumo_vencido'] = '' : result.recordset[0]['consumo_vencido'];
        (result.recordset[0]['recargo_actual'] == 0) ? result.recordset[0]['recargo_actual'] = '' : result.recordset[0]['recargo_actual'];
        (result.recordset[0]['recargo_vencido'] == 0) ? result.recordset[0]['recargo_vencido'] = '' : result.recordset[0]['recargo_vencido'];
        //-----------------------------------------//
        (result.recordset[0]['drenaje'] == 0) ? result.recordset[0]['drenaje'] = '' : result.recordset[0]['drenaje'];
        (result.recordset[0]['drenaje_vencido'] == 0) ? result.recordset[0]['drenaje_vencido'] = '' : result.recordset[0]['drenaje_vencido'];
        (result.recordset[0]['iva'] == 0) ? result.recordset[0]['iva'] = '' : result.recordset[0]['iva'];
        (result.recordset[0]['iva_vencido'] == 0) ? result.recordset[0]['iva_vencido'] = '' : result.recordset[0]['iva_vencido'];
        (result.recordset[0]['pipas'] == 0) ? result.recordset[0]['pipas'] = '' : result.recordset[0]['pipas'];
        (result.recordset[0]['pipas_vencido'] == 0) ? result.recordset[0]['pipas_vencido'] = '' : result.recordset[0]['pipas_vencido'];
        (result.recordset[0]['favor'] == 0) ? result.recordset[0]['favor'] = '' : result.recordset[0]['favor'];

        //Diferencia de lo pagado y el adeudo
        if (result.recordset[0]['adeuda'] && result.recordset[0]['pagado']) {
            console.log("entra a lo adeudado y pagado");
            console.log(result.recordset[0]['adeuda'] );
            console.log(result.recordset[0]['pagado'] );
            result.recordset[0]['adeuda'] = (result.recordset[0]['adeuda'] - result.recordset[0]['pagado']);
        }

        result.recordset[0]['adeuda'] ? result.recordset[0]['adeuda'] = formatNumber(result.recordset[0]['adeuda']) : '';
        //Desaparecemos lo pagado despues de todas las operaciones aritmeticas, antes no!!!
        (result.recordset[0]['pagado'] == 0)  ? result.recordset[0]['pagado'] = '' : result.recordset[0]['pagado'];


        result.recordset[0]['adeudo1'] ? result.recordset[0]['adeudo1'] = formatNumber(result.recordset[0]['adeudo1']) : '';
        result.recordset[0]['adeudo2'] ? result.recordset[0]['adeudo2'] = formatNumber(result.recordset[0]['adeudo2']) : '';
        result.recordset[0]['adeudo3'] ? result.recordset[0]['adeudo3'] = formatNumber(result.recordset[0]['adeudo3']) : '';
        result.recordset[0]['adeudo4'] ? result.recordset[0]['adeudo4'] = formatNumber(result.recordset[0]['adeudo4']) : '';
        result.recordset[0]['adeudo5'] ? result.recordset[0]['adeudo5'] = formatNumber(result.recordset[0]['adeudo5']) : '';
        result.recordset[0]['adeudo6'] ? result.recordset[0]['adeudo6'] = formatNumber(result.recordset[0]['adeudo6']) : '';
        result.recordset[0]['adeudo7'] ? result.recordset[0]['adeudo7'] = formatNumber(result.recordset[0]['adeudo7']) : '';

        //formateamos adeuda por que no pone doble cero cuando es = a 0 y en caso contrario solamente agregamos el signo de peso
        if (result.recordset[0]['adeuda'] == 0) {
            result.recordset[0]['adeuda'] = "0.00"
        }

        //Agrega signo de peso al pagado si no viene como null
        if(result.recordset[0]['pagado'] != null) {
            result.recordset[0]['pagado'] = formatNumber(result.recordset[0]['pagado']);
            result.recordset[0]['pagado'] = "$"+result.recordset[0]['pagado'];
        }
        
        result.recordset[0]['adeuda'] = "$"+result.recordset[0]['adeuda'];

        //Diferencias (-) de Consumo
        result.recordset[0]['consumo'] = result.recordset[0]['lectura_actual'] - result.recordset[0]['lectura_anterior'];

        result.recordset[0]['consumo1'] = result.recordset[0]['lectura1'] - result.recordset[0]['lectura_ant1'];
        result.recordset[0]['consumo2'] = result.recordset[0]['lectura2'] - result.recordset[0]['lectura_ant2'];
        result.recordset[0]['consumo3'] = result.recordset[0]['lectura3'] - result.recordset[0]['lectura_ant3'];
        result.recordset[0]['consumo4'] = result.recordset[0]['lectura4'] - result.recordset[0]['lectura_ant4'];
        result.recordset[0]['consumo5'] = result.recordset[0]['lectura5'] - result.recordset[0]['lectura_ant5'];
        result.recordset[0]['consumo6'] = result.recordset[0]['lectura6'] - result.recordset[0]['lectura_ant6'];

        //Desaparecemos ConsM3 cuando no existen fechas de emision
        
        if(result.recordset[0]['consumo6'] == 0 && result.recordset[0]['mes_facturado6'] == null ){
            result.recordset[0]['consumo6']=null;
        }

        if(result.recordset[0]['consumo5'] == 0 && result.recordset[0]['mes_facturado5'] == null ){
            result.recordset[0]['consumo5']=null;
        }

        if(result.recordset[0]['consumo4'] == 0 && result.recordset[0]['mes_facturado4'] == null ){
            result.recordset[0]['consumo4']=null;
        }

        if(result.recordset[0]['consumo3'] == 0 && result.recordset[0]['mes_facturado3'] == null ){
            result.recordset[0]['consumo3']=null;
        }

        if(result.recordset[0]['consumo2'] == 0 && result.recordset[0]['mes_facturado2'] == null ){
            result.recordset[0]['consumo2']=null;
        }

        if(result.recordset[0]['consumo1'] == 0 && result.recordset[0]['mes_facturado1'] == null ){
            result.recordset[0]['consumo1']=null;
        }

        return result.recordset[0];
        
    } catch (error) {
        console.log(error.message);
    }

}

module.exports = {
    formatResultRecordset
}