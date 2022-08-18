formatFechaVencimiento = ( consulta = [] ) => {

    //Fecha de vencimiento para el periodo, esto se hizo ya que por medio de las APIS del periodo había que enviar el numero de contrato y cambiar el frontend
    let fecha = new Date(consulta.recordset[0]["fecha_sup"]);
    //Esta porcion de codigo no le resta un dia a la fecha
    fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());


    // const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const month = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  
    let mes = month[fecha.getMonth()];
    let anio = fecha.getFullYear();
    let dia = fecha.getDate();

    fecha_vencimiento = dia + "/" + mes + "/" + anio;

    return fecha_vencimiento;

}

module.exports = {
    formatFechaVencimiento
}