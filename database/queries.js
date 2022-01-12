const queries = {

    getRecibo: 'SELECT a.contrato, a.mes_facturado, a.recargo_actual, a.consumo_actual, ' +
    'a.consumo_vencido, a.recargo_vencido, a.fecha_vencimiento, a.lectura_anterior, a.lectura_actual, ' +
    'a.drenaje, a.drenaje_vencido, a.iva, a.iva_vencido, a.pipas, a.pipas_vencido, ' +
    'b.nombre, b.direccion, b.colonia, b.cp, b.giro, a.adeudo as adeuda, '+
    'b.region, b.sector, b.estatus, b.tarifa, b.medidor, b.reparto, ' +
    'dbo.sum_pagado(@id, @fecha_pagado_inf, @fecha_pagado_sup) as pagado, '+
    'dbo.lectura_mes_anterior(@id, @anio, @mes_actual, 1) as lectura_ant1, '+  //TODO: Aqui el mes_Actual lo cambiamos a 13 en la facturacion de Enero
    'dbo.lectura_mes_anterior(@id, @anio, @mes_actual, 2) as lectura_ant2, '+
    'dbo.lectura_mes_anterior(@id, @anio, @mes_actual, 3) as lectura_ant3, '+
    'dbo.lectura_mes_anterior(@id, @anio, @mes_actual, 4) as lectura_ant4, '+
    'dbo.lectura_mes_anterior(@id, @anio, @mes_actual, 5) as lectura_ant5, '+
    'dbo.lectura_mes_anterior(@id, @anio, @mes_actual, 6) as lectura_ant6, '+
    'dbo.mes_anterior(@id, @anio, @mes_actual, 1) as lectura1, '+
    'dbo.mes_anterior(@id, @anio, @mes_actual, 2) as lectura2, '+
    'dbo.mes_anterior(@id, @anio, @mes_actual, 3) as lectura3, '+
    'dbo.mes_anterior(@id, @anio, @mes_actual, 4) as lectura4, '+
    'dbo.mes_anterior(@id, @anio, @mes_actual, 5) as lectura5, '+
    'dbo.mes_anterior(@id, @anio, @mes_actual, 6) as lectura6, '+
    'dbo.mes_anterior(@id, @anio, @mes_actual, 7) as lectura7, '+
    'dbo.mes_anterior(@id, @anio, @mes_actual, 8) as lectura8, '+
    'dbo.adeudo(@id, @anio, @mes_actual, 1) as adeudo1, '+
    'dbo.adeudo(@id, @anio, @mes_actual, 2) as adeudo2, '+
    'dbo.adeudo(@id, @anio, @mes_actual, 3) as adeudo3, '+
    'dbo.adeudo(@id, @anio, @mes_actual, 4) as adeudo4, '+
    'dbo.adeudo(@id, @anio, @mes_actual, 5) as adeudo5, '+
    'dbo.adeudo(@id, @anio, @mes_actual, 6) as adeudo6, '+
    'dbo.adeudo(@id, @anio, @mes_actual, 7) as adeudo7, '+
    'dbo.fecha_emision(@id, @anio, @mes_actual, 1) as fecha_emision1, '+
    'dbo.fecha_emision(@id, @anio, @mes_actual, 2) as fecha_emision2, '+
    'dbo.fecha_emision(@id, @anio, @mes_actual, 3) as fecha_emision3, '+
    'dbo.fecha_emision(@id, @anio, @mes_actual, 4) as fecha_emision4, '+
    'dbo.fecha_emision(@id, @anio, @mes_actual, 5) as fecha_emision5, '+
    'dbo.fecha_emision(@id, @anio, @mes_actual, 6) as fecha_emision6, '+
    'dbo.fecha_emision(@id, @anio, @mes_actual, 7) as fecha_emision7, '+
    'dbo.mes_facturado(@id, @anio, @mes_actual, 1) as mes_facturado1, '+
    'dbo.mes_facturado(@id, @anio, @mes_actual, 2) as mes_facturado2, '+
    'dbo.mes_facturado(@id, @anio, @mes_actual, 3) as mes_facturado3, '+
    'dbo.mes_facturado(@id, @anio, @mes_actual, 4) as mes_facturado4, '+
    'dbo.mes_facturado(@id, @anio, @mes_actual, 5) as mes_facturado5, '+
    'dbo.mes_facturado(@id, @anio, @mes_actual, 6) as mes_facturado6, '+
    'dbo.mes_facturado(@id, @anio, @mes_actual, 7) as mes_facturado7 '+
    'FROM facthist a, padron b ' +
    'WHERE a.contrato = @id ' +
    'AND a.contrato = b.contrato '+
    'AND a.año = 2021 '+    //TODO: Este debe cambiar a 2022 con la facturacion de Enero
    'AND a.mes_facturado = @mes_facturado '+
    'AND a.mes = @mes_actual '+ //TODO: Este debe cambiar a 1 con la facturación de Enero
    'GROUP BY a.contrato, a.fecha_vencimiento, a.adeudo, a.lectura_anterior, '+
    'a.lectura_actual, a.mes_facturado, a.recargo_actual, a.consumo_actual, a.consumo_vencido, a.recargo_vencido, '+
    'a.drenaje, a.drenaje_vencido, a.iva, a.iva_vencido, a.pipas, a.pipas_vencido, '+
    'b.nombre, b.direccion, b.colonia, b.cp, b.giro, b.adeuda, '+
    'b.region, b.sector, b.reparto, b.estatus, b.tarifa, b.medidor'
}

module.exports = {
    queries
}