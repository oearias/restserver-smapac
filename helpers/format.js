
const formatNumber = (valor = 0) => {

    let format = valor;

    console.log(format);
    
    format = parseFloat(valor).toFixed(2);

    format = format.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    console.log(format);

    return format;
}



module.exports = {
    formatNumber
}