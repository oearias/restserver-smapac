const { response } = require('express');
const { getConnection } = require('../database/connection');
const sql = require('mssql');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
})

const reportesGet = async (req, res = response) => {

    try {
        const pool = await getConnection();

        const result = await pool.request()
            .query("SELECT " +
                "a.id, a.contrato, a.folio, " +
                "a.fecha_reporte as fecha_reporte2, " +
                "FORMAT(a.fecha_reporte, 'yyyy-MM-dd') as fecha_reporte, " +
                "a.fecha_realizacion as fecha_realizacion2, " +
                "FORMAT(a.fecha_realizacion, 'yyyy-MM-dd') as fecha_realizacion, " +
                "a.campo_aux1, " +
                "a.descripcion, " +
                "d.id as reporte_tipo_id, " +
                "d.nombre as reporte_tipo, " +
                "e.id as estatus_id, " +
                "e.nombre as estatus " +
                "FROM reportes a " +
                "LEFT JOIN " +
                "reporte_tipo d " +
                "on a.tipo_orden = d.id " +
                "LEFT JOIN " +
                "reporte_estatus e " +
                "on e.id = a.reporte_estatus " +
                "order by a.id desc");

        res.json(result.recordset);

    } catch (error) {
        return res.json(error.message)
    }

}

const reporteGet = async (req, res = response) => {

    const { id } = req.params;
    const pool = await getConnection();

    try {

        const result = await pool.request()
            .input('identificador', id)
            .query("SELECT " +
                "a.id, a.contrato, a.folio, " +
                "a.fecha_reporte as fecha_reporte2, " +
                "FORMAT(a.fecha_reporte, 'dd/MM/yyy') as fecha_reporte, " +
                "a.fecha_realizacion as fecha_realizacion2, " +
                "FORMAT(a.fecha_realizacion, 'dd/MM/yyy') as fecha_realizacion, " +
                "a.campo_aux1, a.inspectores, " +
                "a.descripcion, " +
                "d.id as reporte_tipo_id, " +
                "d.nombre as reporte_tipo, " +
                "e.id as estatus_id, " +
                "e.nombre as estatus, " +
                "c.id as inspector_id, " +
                "c.nombre as inspector " +
                "FROM reportes a " +
                "LEFT JOIN reporte_inspectores b " +
                "on a.id =b.reporte_id " +
                "LEFT JOIN inspectores c " +
                "on c.id = b.inspector_id " +
                "LEFT JOIN " +
                "reporte_tipo d " +
                "on a.tipo_orden = d.id " +
                "LEFT JOIN " +
                "reporte_estatus e " +
                "on e.id = a.reporte_estatus " +
                "WHERE a.id = @identificador " +
                "order by a.id desc");

        if (result.recordset.length == 0) {
            return res.status(500).json({
                msg: "No hay registros en la tabla"
            });
        }

        res.status(200).json(result.recordset);
    } catch (error) {
        return res.json(
            error.message
        )
    }
}

const reporteGetByFolio = async (req, res = response) => {
    
    const { id } = req.params;
    const pool = await getConnection();

    try {

        const result = await pool.request()
            .input('folio', id)
            .query("SELECT " +
                "a.id, a.contrato, a.folio, " +
                "a.fecha_reporte as fecha_reporte2, " +
                "FORMAT(a.fecha_reporte, 'yyyy-MM-dd') as fecha_reporte, " +
                "a.fecha_realizacion as fecha_realizacion2, " +
                "FORMAT(a.fecha_realizacion, 'yyyy-MM-dd') as fecha_realizacion, " +
                "a.campo_aux1, a.inspectores, " +
                "a.descripcion, " +
                "d.id as reporte_tipo_id, " +
                "d.nombre as reporte_tipo, " +
                "e.id as estatus_id, " +
                "e.nombre as estatus, " +
                "c.id as inspector_id, " +
                "c.nombre as inspector " +
                "FROM reportes a " +
                "LEFT JOIN reporte_inspectores b " +
                "on a.id =b.reporte_id " +
                "LEFT JOIN inspectores c " +
                "on c.id = b.inspector_id " +
                "LEFT JOIN " +
                "reporte_tipo d " +
                "on a.tipo_orden = d.id " +
                "LEFT JOIN " +
                "reporte_estatus e " +
                "on e.id = a.reporte_estatus " +
                "WHERE a.folio = @folio " +
                "order by a.id desc");

        if (result.recordset.length == 0) {
            return res.status(500).json({
                msg: "No hay registros en la tabla"
            });
        }

        res.status(200).json(result.recordset);
    } catch (error) {
        return res.json(
            error.message
        )
    }
}

const reportesPost = async (req, res = response) => {

    const {
        contrato,
        folio, fecha_reporte,
        fecha_realizacion, campo_aux1,
        descripcion, tipo_orden,
        reporte_estatus, inspectores, fotos } = req.body;

    const pool = await getConnection();

    try {

        const totalFotos = Object.values(fotos).length;

        const transaction = new sql.Transaction();

        await transaction.begin();

        const result = await pool.request().query(`INSERT INTO reportes ( contrato, folio, fecha_reporte, fecha_realizacion, campo_aux1, descripcion, tipo_orden, reporte_estatus ) VALUES (${contrato}, ${folio}, '${fecha_reporte}', '${fecha_realizacion}', '${campo_aux1}', '${descripcion}', ${tipo_orden}, ${reporte_estatus} ); SELECT SCOPE_IDENTITY() as id`);

        //Existen inspectores?
        if (inspectores.length > 0) {

            for (let i = 0; i < Object.keys(inspectores).length; i++) {

                await pool.request().query(`INSERT INTO reporte_inspectores ( reporte_id , inspector_id ) VALUES ( ${result.recordset[0]['id']}, ${inspectores[i]['inspector']} )`);

            }
        }

        //Existen fotos?
        if (totalFotos > 0) {

            for (let i = 0; i < totalFotos; i++) {

                //var filepath = base64Img.imgSync(fotos[i],  tmpobj.name, Date.now());

                const objetoCloudinary = await cloudinary.uploader.upload(fotos[i]);

                const { secure_url, public_id } = objetoCloudinary;

                if (!secure_url) {

                    return res.send({ message: "No fue posible cargar la fotografia" });

                } else {

                    await pool.request().query(`INSERT INTO reportes_foto (reporte_id, url_photo, public_id) VALUES( ${result.recordset[0]['id']}, '${secure_url}', '${public_id}'  )`);
                }

            }

        }

        await transaction.commit();

        res.status(200).json({
            msg: "El Reporte fue cargado exitosamente"
        });

    } catch (error) {

        return res.status(500).json({
            msg: error.message
        })
    }

}

const reportesPatch = async (req, res = response) => {

    const { id } = req.params;

    const { contrato, folio, fecha_reporte, fecha_realizacion,
        descripcion, campo_aux1, tipo_orden, reporte_estatus,
        inspectores, arrInsert, arrRemove } = req.body;

    try {

        const pool = await getConnection();

        if (inspectores.length === 0) {

            const consulta =
                `UPDATE reportes SET contrato = ${contrato}, folio=${folio}, 
            fecha_reporte='${fecha_reporte}', fecha_realizacion='${fecha_realizacion}', 
            campo_aux1='${campo_aux1}', descripcion='${descripcion}',
            tipo_orden=${tipo_orden}, reporte_estatus=${reporte_estatus} WHERE id = ${id}`;

            const result = await pool.request().query(consulta);

        } else {

            const consulta =
            `UPDATE reportes SET contrato = ${contrato}, folio=${folio}, 
            fecha_reporte='${fecha_reporte}', fecha_realizacion='${fecha_realizacion}', 
            campo_aux1='${campo_aux1}', descripcion='${descripcion}',
            tipo_orden=${tipo_orden}, reporte_estatus=${reporte_estatus} WHERE id = ${id}`;

            const transaction = new sql.Transaction();

            await transaction.begin();

            const result = await pool.request().query(consulta);

            //inspectores a eliminar

            if (Object.keys(arrRemove).length > 0) {

                for (let i = 0; i < Object.keys(arrRemove).length; i++) {

                    const result2 = await pool.request().query(`DELETE FROM reporte_inspectores WHERE inspector_id =  ${arrRemove[i]}  `);
                }
            }

            //inspectores a insertar

            if (Object.keys(arrInsert).length > 0) {

                for (let i = 0; i < Object.keys(arrInsert).length; i++) {

                    const result2 = await pool.request().query(`INSERT INTO reporte_inspectores (reporte_id, inspector_id) VALUES (${id}, ${arrInsert[i]})  `);
                }
            }

            await transaction.commit();

        }

        res.json({
            msg: `Reporte editado correctamente`,
        });


    } catch (error) {

        res.json({
            error: 'No se pudo actualizar el reporte'
        });

    }
}

const reportesDelete = async (req, res = response) => {

    try {
        const { id } = req.params;

        const pool = await getConnection();

        //obtenemos las public ids mediante el id del reporte y eliminamos imagenes del cloudinary
        const resultFotos = await pool.request().query(`SELECT public_id FROM reportes_foto where reporte_id  = ${id} `);
        const resultInspectores = await pool.request().query(`SELECT * FROM reporte_inspectores where reporte_id  = ${id} `);

        const transaction = new sql.Transaction();

        await transaction.begin();

        //pregunta si hay fotos
        //hay que recorrer mediante un ciclo el result  e ir haciendo peticiones al cloudinary para eliminar las fotos...
        if (resultFotos.recordset.length > 0) {

            for (let i = 0; i < resultFotos.recordset.length; i++) {
                const public_id = resultFotos.recordset[i]['public_id'];

                await cloudinary.uploader.destroy(public_id, res => {
                    console.log(res);
                })
            }

            await pool.request().query(`DELETE FROM reportes_foto where reporte_id = ${id} `);

        }

        //pregunta si hay inspectores
        if (resultInspectores.recordset.length > 0) {
            await pool.request().query(`DELETE FROM reporte_inspectores where reporte_id = ${id} `);
        }

        await pool.request().query(`DELETE FROM reportes WHERE id = '${id}' `);

        //realizas un commit y mandas un mensaje exitoso.
        await transaction.commit();

        res.status(200).json({
            msg: "Registro eliminado correctamente"
        });

    } catch (error) {
        res.json(error.message)
    }
}

const uploadFoto = async (req, res = response) => {

    try {
        const { folio } = req.params;
        const pool = await getConnection();


        if (req.files == undefined) {
            return res.send({ message: "Fields is Empty" })
        }

        const { tempFilePath } = req.files.archivo;
        const objetoCloudinary = await cloudinary.uploader.upload(tempFilePath);

        const { secure_url, public_id } = objetoCloudinary;

        if (!secure_url) {

            return res.send({ message: "No fue posible cargar la fotografia" })
        }

        const result = await pool.request().query(`INSERT INTO reportes_foto ( url_photo, folio, public_id ) VALUES ('${secure_url}', ${folio}, '${public_id}' );`);

        console.log(result);

        if (result.rowsAffected[0] == 0) {

            return res.status(500).json({
                msg: "Los datos no se cargaron"
            });
        }

        res.status(200).json({
            url: secure_url
        });


    } catch (error) {
        res.json(error.message)
    }

}

module.exports = {
    reportesGet,
    reporteGet,
    reporteGetByFolio,
    reportesPost,
    reportesPatch,
    reportesDelete,
    uploadFoto
}