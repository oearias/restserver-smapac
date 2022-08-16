const { truncateD } = require("./format");

const comparaTablas = (result = []) => {

    //Esta adecuación se hizo por las personas que pagan en linea y consultan enseguida ya que
    //la tabla que se setea a 0 es la de padron y no facthist
    //para no hacer más movimientos de actualizaciones solo se comparan las dos tablas y se devuelve un 0 si padron
    //está en 0

    if (
        result.recordset[0]["adeuda"] != result.recordset[0]["adeuda_padron"] &&
        result.recordset[0]["adeuda_padron"] == 0
      ) {
        result.recordset[0]["adeuda"] = result.recordset[0]["adeuda_padron"];
      }



  
      if ( result.recordset[0]["pagado"] && result.recordset[0]["flag_reconexion"] == null)
      {
        console.log('condition!!!');
        result.recordset[0]["adeuda"] =
          result.recordset[0]["adeuda"] - result.recordset[0]["pagado"];
  
        result.recordset[0]["adeuda"] = truncateD(result.recordset[0]["adeuda"]);
  
        if (result.recordset[0]["adeuda"] < 0) {
          result.recordset[0]["adeuda"] = 0;
        }
      }

    //Formatea el adeuda y aux a dos decimales, esto corrige el importe invalido en multipagos
    result.recordset[0]["adeuda"]
    ? truncateD(result.recordset[0]["adeuda"])
    : null;

    result.recordset[0]["aux"] ? truncateD(result.recordset[0]["aux"]) : null;

    return result.recordset[0];
}

module.exports = {
    comparaTablas
}