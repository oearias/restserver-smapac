const queries = {

    getRecibo: 'SELECT a.contrato, a.mes_facturado, a.recargo_actual, a.consumo_actual, '+
    'a.consumo_vencido, a.recargo_vencido, a.fecha_vencimiento, a.lectura_anterior, a.lectura_actual, '+
    'a.drenaje, a.drenaje_vencido, a.iva, a.iva_vencido, a.pipas, a.pipas_vencido, '+
    'b.nombre, b.direccion, b.colonia, b.cp, b.giro, a.adeudo as adeuda, '+
    'b.region, b.sector, b.estatus, b.tarifa, b.medidor, b.reparto, '+
    'dbo.sum_pagado(@id, @fecha_pagado_inf, @fecha_pagado_sup) as pagado, '+
    'dbo.lectura_mes_anterior(@id, 2022, 5, 1) as lectura_ant1, '+  //TODO: Aqui el mes_Actual lo cambiamos a 13 en la facturacion de Enero
    'dbo.lectura_mes_anterior(@id, 2022, 4, 1) as lectura_ant2, '+
    'dbo.lectura_mes_anterior(@id, 2022, 3, 1) as lectura_ant3, '+
    'dbo.lectura_mes_anterior(@id, 2022, 2, 1) as lectura_ant4, '+
    'dbo.lectura_mes_anterior(@id, @anio, @mes_actual, 1) as lectura_ant5, '+
    'dbo.lectura_mes_anterior(@id, @anio, @mes_actual, 2) as lectura_ant6, '+
    'dbo.mes_anterior(@id, 2022, 5, 1) as lectura1, '+
    'dbo.mes_anterior(@id, 2022, 4, 1) as lectura2, '+
    'dbo.mes_anterior(@id, 2022, 3, 1) as lectura3, '+
    'dbo.mes_anterior(@id, 2022, 2, 1) as lectura4, '+
    'dbo.mes_anterior(@id, @anio, @mes_actual, 1) as lectura5, '+
    'dbo.mes_anterior(@id, @anio, @mes_actual, 2) as lectura6, '+
    'dbo.mes_anterior(@id, @anio, @mes_actual, 3) as lectura7, '+
    'dbo.mes_anterior(@id, @anio, @mes_actual, 4) as lectura8, '+  
    'dbo.adeudo(@id, 2022, 5, 1) as adeudo1, '+    
    'dbo.adeudo(@id, 2022, 4, 1) as adeudo2, '+     //Mar2022     4 - 1 = 3
    'dbo.adeudo(@id, 2022, 3, 1) as adeudo3, '+    //Feb2022     3 - 1 = 2
    'dbo.adeudo(@id, 2022, 2, 1) as adeudo4, '+    //Ene2022    2 - 1 = 1
    'dbo.adeudo(@id, @anio, @mes_actual, 1) as adeudo5, '+
    'dbo.adeudo(@id, @anio, @mes_actual, 2) as adeudo6, '+
    'dbo.adeudo(@id, @anio, @mes_actual, 3) as adeudo7, '+
    'dbo.fecha_emision(@id, 2022, 5, 1) as fecha_emision1, '+   //febrero 2022
    'dbo.fecha_emision(@id, 2022, 4, 1) as fecha_emision2, '+   //marzo 2022
    'dbo.fecha_emision(@id, 2022, 3, 1) as fecha_emision3, '+
    'dbo.fecha_emision(@id, 2022, 2, 1) as fecha_emision4, '+
    'dbo.fecha_emision(@id, @anio, @mes_actual, 1) as fecha_emision5, '+
    'dbo.fecha_emision(@id, @anio, @mes_actual, 2) as fecha_emision6, '+
    'dbo.fecha_emision(@id, @anio, @mes_actual, 3) as fecha_emision7, '+
    'dbo.mes_facturado(@id, 2022, 5, 1) as mes_facturado1, '+
    'dbo.mes_facturado(@id, 2022, 4, 1) as mes_facturado2, '+
    'dbo.mes_facturado(@id, 2022, 3, 1) as mes_facturado3, '+
    'dbo.mes_facturado(@id, 2022, 2, 1) as mes_facturado4, '+
    'dbo.mes_facturado(@id, @anio, @mes_actual, 1) as mes_facturado5, '+
    'dbo.mes_facturado(@id, @anio, @mes_actual, 2) as mes_facturado6, '+
    'dbo.mes_facturado(@id, @anio, @mes_actual, 3) as mes_facturado7 '+
    'FROM facthist a, padron b '+
    'WHERE a.contrato = @id '+
    'AND a.contrato = b.contrato '+
    'AND a.año = 2022 '+    //TODO: Este debe cambiar a 2022 con la facturacion de Enero
    'AND a.mes_facturado = @mes_facturado '+
    'AND a.mes = @mes '+ //TODO: Este debe cambiar a 1 con la facturación de Enero
    'GROUP BY a.contrato, a.fecha_vencimiento, a.adeudo, a.lectura_anterior, '+
    'a.lectura_actual, a.mes_facturado, a.recargo_actual, a.consumo_actual, a.consumo_vencido, a.recargo_vencido, '+
    'a.drenaje, a.drenaje_vencido, a.iva, a.iva_vencido, a.pipas, a.pipas_vencido, '+
    'b.nombre, b.direccion, b.colonia, b.cp, b.giro, b.adeuda, '+
    'b.region, b.sector, b.reparto, b.estatus, b.tarifa, b.medidor',

    getContrato: 'SELECT b.contrato, b.nombre, b.direccion, b.colonia, b.cp, '+
    'b.giro, '+ 
    'a.adeudo as adeuda, '+
    'b.adeuda as adeuda_padron, '+
    'a.mes_facturado, b.tarifa, '+
    'b.region, b.estatus, b.medidor, b.reparto, b.sector, '+
    'dbo.sum_pagado(@id, @fecha, @fecha2) as pagado, '+
    '(a.adeudo - dbo.sum_pagado(@id, @fecha, @fecha2 )) as aux '+
    'FROM facthist a, '+
    'padron b '+
    'where b.contrato = @id '+
    'AND b.contrato = a.contrato '+
    'AND a.año = @anio '+
    'AND a.mes = @mes '+ 
    'AND a.mes_facturado = @mes_facturado'
}

module.exports = {
    queries
}





/*
getRecibo: 'SELECT a.contrato, a.mes_facturado, a.recargo_actual, a.consumo_actual, '+
    'a.consumo_vencido, a.recargo_vencido, a.fecha_vencimiento, a.lectura_anterior, a.lectura_actual, '+
    'a.drenaje, a.drenaje_vencido, a.iva, a.iva_vencido, a.pipas, a.pipas_vencido, '+
    'b.nombre, b.direccion, b.colonia, b.cp, b.giro, a.adeudo as adeuda, '+
    'b.region, b.sector, b.estatus, b.tarifa, b.medidor, b.reparto, '+
    'dbo.sum_pagado(@id, @fecha_pagado_inf, @fecha_pagado_sup) as pagado, '+
    'dbo.lectura_mes_anterior(@id, 2021, 13, 1) as lectura_ant1, '+  //TODO: Aqui el mes_Actual lo cambiamos a 13 en la facturacion de Enero
    'dbo.lectura_mes_anterior(@id, @anio, @mes_actual, 1) as lectura_ant2, '+
    'dbo.lectura_mes_anterior(@id, @anio, @mes_actual, 2) as lectura_ant3, '+
    'dbo.lectura_mes_anterior(@id, @anio, @mes_actual, 3) as lectura_ant4, '+
    'dbo.lectura_mes_anterior(@id, @anio, @mes_actual, 4) as lectura_ant5, '+
    'dbo.lectura_mes_anterior(@id, @anio, @mes_actual, 5) as lectura_ant6, '+
    'dbo.mes_anterior(@id, 2022, 2, 1) as lectura1, '+
    'dbo.mes_anterior(@id, @anio, @mes_actual, 1) as lectura2, '+
    'dbo.mes_anterior(@id, @anio, @mes_actual, 2) as lectura3, '+
    'dbo.mes_anterior(@id, @anio, @mes_actual, 3) as lectura4, '+
    'dbo.mes_anterior(@id, @anio, @mes_actual, 4) as lectura5, '+
    'dbo.mes_anterior(@id, @anio, @mes_actual, 5) as lectura6, '+
    'dbo.mes_anterior(@id, @anio, @mes_actual, 6) as lectura7, '+
    'dbo.mes_anterior(@id, @anio, @mes_actual, 7) as lectura8, '+  
    'dbo.adeudo(@id, 2022, 2, 1) as adeudo1, '+    //Enero2022
    'dbo.adeudo(@id, @anio, @mes_actual, 1) as adeudo2, '+  //Dic2021
    'dbo.adeudo(@id, @anio, @mes_actual, 2) as adeudo3, '+
    'dbo.adeudo(@id, @anio, @mes_actual, 3) as adeudo4, '+
    'dbo.adeudo(@id, @anio, @mes_actual, 4) as adeudo5, '+
    'dbo.adeudo(@id, @anio, @mes_actual, 5) as adeudo6, '+
    'dbo.adeudo(@id, @anio, @mes_actual, 6) as adeudo7, '+
    'dbo.fecha_emision(@id, 2022, 2, 1) as fecha_emision1, '+
    'dbo.fecha_emision(@id, @anio, @mes_actual, 1) as fecha_emision2, '+
    'dbo.fecha_emision(@id, @anio, @mes_actual, 2) as fecha_emision3, '+
    'dbo.fecha_emision(@id, @anio, @mes_actual, 3) as fecha_emision4, '+
    'dbo.fecha_emision(@id, @anio, @mes_actual, 4) as fecha_emision5, '+
    'dbo.fecha_emision(@id, @anio, @mes_actual, 5) as fecha_emision6, '+
    'dbo.fecha_emision(@id, @anio, @mes_actual, 6) as fecha_emision7, '+
    'dbo.mes_facturado(@id, 2022, 2, 1) as mes_facturado1, '+
    'dbo.mes_facturado(@id, @anio, @mes_actual, 1) as mes_facturado2, '+
    'dbo.mes_facturado(@id, @anio, @mes_actual, 2) as mes_facturado3, '+
    'dbo.mes_facturado(@id, @anio, @mes_actual, 3) as mes_facturado4, '+
    'dbo.mes_facturado(@id, @anio, @mes_actual, 4) as mes_facturado5, '+
    'dbo.mes_facturado(@id, @anio, @mes_actual, 5) as mes_facturado6, '+
    'dbo.mes_facturado(@id, @anio, @mes_actual, 6) as mes_facturado7 '+
    'FROM facthist a, padron b '+
    'WHERE a.contrato = @id '+
    'AND a.contrato = b.contrato '+
    'AND a.año = 2022 '+    //TODO: Este debe cambiar a 2022 con la facturacion de Enero
    'AND a.mes_facturado = @mes_facturado '+
    'AND a.mes = @mes '+ //TODO: Este debe cambiar a 1 con la facturación de Enero
    'GROUP BY a.contrato, a.fecha_vencimiento, a.adeudo, a.lectura_anterior, '+
    'a.lectura_actual, a.mes_facturado, a.recargo_actual, a.consumo_actual, a.consumo_vencido, a.recargo_vencido, '+
    'a.drenaje, a.drenaje_vencido, a.iva, a.iva_vencido, a.pipas, a.pipas_vencido, '+
    'b.nombre, b.direccion, b.colonia, b.cp, b.giro, b.adeuda, '+
    'b.region, b.sector, b.reparto, b.estatus, b.tarifa, b.medidor',
*/