

const calculaReconex = (tarifa) => {

    try {

        let reco;

        let domestica           = ['D','R','S','Z 1','Z 3','Z 5'];
        let comercial           = ['C','L','Z 7'];
        let industrial          = ['I','N','Z 12','Z 15'];
        let domestica_localidad = ['E','Z 2'];
        let comercial_localidad = ['O','Z 8'];
        let test                = ['PPP'];

        if(domestica.includes(tarifa)){
            tarifa = 'Domestica';
        }else if(comercial.includes(tarifa)){
            tarifa = 'Comercial'
        }else if(industrial.includes(tarifa)){
            tarifa = 'Industrial'
        }else if(domestica_localidad.includes(tarifa)){
            tarifa = 'DL'
        }else if(comercial_localidad.includes(tarifa)){
            tarifa = 'CL'
        }else if(test.includes(tarifa)){
            tarifa = 'TEST'
        }

        switch(tarifa){

            case 'Domestica' : 
                reco = 928.00;
            break;

            case 'Comercial' : 
                reco = 1229.60;
            break;

            case 'Industrial' : 
                reco = 1693.60;
            break;

            case 'DL' : 
                reco = 232.00;
            break;

            case 'CL' : 
                reco = 307.40;
            break;

            case 'TEST' : 
                reco = 1;
            break;
        }

        return reco;
        
    } catch (error) {
        console.log(error.message);
    }

}

module.exports = {
    calculaReconex
}