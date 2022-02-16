
const formatNumber = (valor = 0) => {

    let format = valor;
    
    format = parseFloat(valor).toFixed(2);

    format = format.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return format;
}

const truncateD = ( valor = 0 ) => {

    let format = valor;

    format = parseFloat(valor.toFixed(2));

    console.log(format);

    return format;
}



module.exports = {
    formatNumber,
    truncateD
}