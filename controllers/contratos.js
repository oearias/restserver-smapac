const { response } = require('express');
const { getConnection } = require('../database/connection');
const sql = require('mssql');

const contratosGet = async (req, res = response) => {

    console.log(req);

    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT top 1000 * FROM padron')



        const contratos = result.recordset ;

        res.json(
            {
                total: 6,
                contratos
            }
        );

    } catch (error) {
        res.status(500).send(error.message);
    }
}

const contratoGet = async (req, res = response) => {

    const { id } = req.params;

    const pool = await getConnection();

    const result = await pool.request().input("id", id).query('SELECT * FROM padron where contrato = @id')


    if(result.recordset.length < 1){
        return res.json({
            msg: 'No existe ningun contrato con ese número'
        });
    }

    res.json(
        result.recordset[0]
    );
}

const contratoGetByUserId = async (req, res = response) => {

    const { id } = req.params;

    const pool = await getConnection();

    const result = await pool.request().input('id', id)
        .query('select usuario.id, padron.contrato, padron.nombre, padron.direccion, padron.colonia,' +
            'padron.giro, padron.tarifa, padron.adeuda, padron.region, padron.estatus, ' +
            'usuario.nombre as nombre_usuario, usuario.email ' +
            'from padron , padron_usuario , usuario  ' +
            'where usuario.id=@id and padron.id = contrato_id AND padron_usuario.usuario_id = usuario.id ');

    //Validar cuando no encuentre usuario

    res.json(
        result.recordset
    );

}

const addContratoUser = async (req, res = response) => {

    try {
        const { id } = req.params;

        const { contrato_id } = req.body

        const pool = await getConnection();

        const result = await pool.request()
            .input('contrato_id', sql.Int, contrato_id)
            .input('usuario_id', sql.Int, id)
            .query('INSERT INTO padron_usuario (contrato_id, usuario_id) values (@contrato_id, @usuario_id)');

        res.json({
            msg: "Contrato añadido correctamente"
        })
    } catch (error) {
        res.json(error.message)
    }

}

const updateAdeudo = async (req, res = response) => {
    
    const {id} = req.params;

    const {pagado} = req.body;
}

module.exports = {
    contratoGet,
    contratosGet,
    contratoGetByUserId,
    addContratoUser
}