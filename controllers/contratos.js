const { response } = require("express");
const { getConnection, sql } = require("../database/connection");
const { queries } = require("../database/queries");
const { truncateD } = require("../helpers/format");
const { calculaReconex } = require("../helpers/calcula_reconexion");
const { comparaTablas } = require("../helpers/comparaPadronFacthist");
const { formatFechaVencimiento } = require("../helpers/fechaVencimiento");

const contratosGet = async (req, res = response) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT top 1000 * FROM padron");
    const contratos = result.recordset;

    res.json({
      total: 6,
      contratos,
    });
    
  } catch (error) {
    res.status(500).send(error.message);
  } finally {
    sql.pool.close();
  }
};

const contratoGet = async (req, res = response) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    //preguntamos primero la region del contrato y en base a eso realizamos la consulta del periodo de Facturación
    const consulta_region = await pool
      .request()
      .input("id", id)
      .query("SELECT region FROM padron WHERE contrato = @id");

    if (consulta_region.recordset.length < 1) {
      return res.json({
        msg:
          "No se encontró ningun contrato con ese número, " +
          "si el contrato existe y no aparece " +
          "favor de ponerse en contacto al correo: sistemas@smapac.gob.mx",
      });
    }

    const region = consulta_region.recordset[0]["region"];

    let consulta, querie;

    //Obtenemos el Periodofacturac

    switch(region){

      case 2: querie = "SELECT * from periodo_facturac WHERE estatus = 1 AND region = 2";
      break;

      case 3: querie = "SELECT * from periodo_facturac WHERE estatus = 1 AND region = 3";
      break;

      default: querie = "SELECT * from periodo_facturac WHERE estatus = 1 AND region is NULL";
      break;
    }

    // region == 2
    //   ? (querie =
    //       "SELECT * from periodo_facturac WHERE estatus = 1 AND region = 2")
    //   : (querie =
    //       "SELECT * from periodo_facturac WHERE estatus = 1 AND region is NULL");

    consulta = await pool.request().query(querie);

    const fecha = consulta.recordset[0]["fecha_inf"];
    const fecha2 = consulta.recordset[0]["fecha_sup"];
    const mes_facturado = consulta.recordset[0]["mes_facturado"];
    const anio = consulta.recordset[0]["año"];
    const mes = consulta.recordset[0]["mes"];

    const result = await pool
      .request()
      .input("id", id)
      .input("anio", anio)
      .input("mes", mes)
      .input("mes_facturado", mes_facturado)
      .input("fecha", fecha)
      .input("fecha2", fecha2)
      .query(queries.getContrato);

    if (result.recordset.length < 1) {
      return res.json({
        msg:
          "No se encontró ningun contrato con ese número, " +
          "si el contrato existe y no aparece " +
          "favor de ponerse en contacto al correo: sistemas@smapac.gob.mx",
      });
    }

    //Caso Reconexiones.
    result.recordset[0] = calculaReconex(result);

    //Padron vs Fatchist. Descripción dentro de la función
    result.recordset[0] = comparaTablas(result);

    //Formatea Fecha Vencimiento
    result.recordset[0]["fecha_vencimiento"] = formatFechaVencimiento(consulta);
    result.recordset[0]["mes_facturado"] =
      consulta.recordset[0]["mes_facturado_c"];

    console.log(result.recordset[0]);

    res.json(result.recordset[0]);
  } catch (error) {
    res.json(error.message);
  }
};

const contratoGetByUserEmail = async (req, res = response) => {

  console.log("entramos");
  
  try {
    const { email } = req.params;
    const pool = await getConnection();
    const consulta = await pool
      .request()
      .query(
        "SELECT * FROM periodo_facturac WHERE estatus = 1 AND region IS NULL "
      );

    const anio = consulta.recordset[0]["año"];
    const mes = consulta.recordset[0]["mes"];

    const result = await pool
      .request()
      .input("email", email)
      .input("anio", anio)
      .input("mes", mes)
      .query(queries.getContratosByUserEmail);

    if (result.recordset.length > 0) {
      for (let i = 0; i < result.recordset.length; i++) {
        if (
          result.recordset[i]["adeuda"] !=
            result.recordset[i]["adeuda_padron"] &&
          result.recordset[i]["adeuda_padron"] == 0
        ) {
          result.recordset[i]["adeuda"] = result.recordset[i]["adeuda_padron"];
        }

        if (result.recordset[i]["pagado"]) {
          result.recordset[i]["adeuda"] =
            result.recordset[i]["adeuda"] - result.recordset[i]["pagado"];

          if (result.recordset[i]["adeuda"] < 0) {
            result.recordset[i]["adeuda"] = 0;
          }
        }

        //Formatea el adeuda y aux a dos decimales, esto corrige el importe invalido en multipagos
        result.recordset[i]["adeuda"]
          ? truncateD(result.recordset[i]["adeuda"])
          : null;

        result.recordset[i]["aux"]
          ? truncateD(result.recordset[i]["aux"])
          : null;
      }
    }

    const contratos = result.recordset;

    console.log(contratos);

    res.json({
      contratos
    });
  } catch (error) {
    res.json(error.message);
  }
};

const contratoEmail = (req, res = response) => {
  
  const { email } = req.params;

  try{
  
    dbConfig = {
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      server: process.env.DB_HOST,
      database: process.env.DB,
      pool: {
        max: 10,
        min: 0,
      },
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    };

    let connection = new sql.ConnectionPool(dbConfig);
  
    connection.connect((err) => {
      if (err) {
        console.log("Error connecting ", err);
        res.send(err);
      } else {

        let request = new sql.Request(connection);

        request.query(
          "SELECT * FROM periodo_facturac WHERE estatus = 1 AND region is NULL",
          (err, recordset) => {
            if (err) {
              res.send(err);
            } else {

              let consulta = recordset;

              const anio = consulta.recordset[0]["año"];
              const mes = consulta.recordset[0]["mes"];

              request
                .input("mes", mes)
                .input("anio", anio)
                .input("email", email)
                .query(queries.getContratosByUserEmail, (err, result) => {
                  if (!err) {
                    if (result.recordset.length > 0) {
                      for (let i = 0; i < result.recordset.length; i++) {
                        if (
                          result.recordset[i]["adeuda"] !=
                            result.recordset[i]["adeuda_padron"] &&
                          result.recordset[i]["adeuda_padron"] == 0
                        ) {
                          result.recordset[i]["adeuda"] =
                            result.recordset[i]["adeuda_padron"];
                        }

                        if (result.recordset[i]["pagado"]) {
                          result.recordset[i]["adeuda"] =
                            result.recordset[i]["adeuda"] -
                            result.recordset[i]["pagado"];

                          if (result.recordset[i]["adeuda"] < 0) {
                            result.recordset[i]["adeuda"] = 0;
                          }
                        }

                        //Formatea el adeuda y aux a dos decimales, esto corrige el importe invalido en multipagos
                        result.recordset[i]["adeuda"]
                          ? truncateD(result.recordset[i]["adeuda"])
                          : null;

                        result.recordset[i]["aux"]
                          ? truncateD(result.recordset[i]["aux"])
                          : null;
                      }
                    }

                    const contratos = result.recordset;
                    console.log("Consulta desde la App");
                    console.log(contratos);

                    res.json(contratos);

                  } else {
                    res.send(err);
                  }
              });
            }
          }
        );
      }
    });

  }catch(err){
    console.log(err);
    res.send(err)
  }


};

const addContratoUser = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { contrato } = req.body;

    const pool = await getConnection();

    //Obtenemos el id

    //Preguntamos primero si no existe el contrato añadido

    const result = await pool
      .request()
      .input("contrato", contrato)
      .input("id", id)
      .query(
        "SELECT * FROM usuario_padron " +
          "WHERE contrato = @contrato " +
          "AND usuario_id = @id"
      );

    if (result.recordset.length > 0) {
      return res.json({
        msg: "El contrato ya se encuentra vinculado a su correo",
      });
    } else {
      await pool
        .request()
        .input("contrato", sql.Int, contrato)
        .input("usuario_id", sql.Int, id)
        .query("INSERT INTO usuario_padron values (@contrato, @usuario_id)");
    }

    res.status(200).json({
      info: "Ok",
      msg: "Contrato añadido correctamente",
    });
  } catch (error) {
    res.json(error.message);
  }
};

const deleteContratoUser = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const pool = await getConnection();

    const consulta = await pool
      .request()
      .input("contrato", id)
      .input("email", email)
      .query(
        "SELECT b.id FROM usuario_padron a " +
          "INNER JOIN " +
          "USUARIO B " +
          "ON (a.usuario_id = b.id " +
          "AND b.email = @email AND a.contrato = @contrato )"
      );

    if (consulta.recordset.length > 0) {
      const usuario_id = consulta.recordset[0]["id"];
      //Procedemos a borrar el contrato

      await pool
        .request()
        .input("contrato", id)
        .input("usuario_id", usuario_id)
        .query(
          "DELETE usuario_padron " +
            "where contrato =  @contrato " +
            "AND usuario_id = @usuario_id"
        );

      res.json({
        msg: "Contrato desvinculado correctamente",
      });
    }
  } catch (error) {
    res.json(error.message);
  }
};

module.exports = {
  contratoGet,
  contratosGet,
  contratoGetByUserEmail,
  addContratoUser,
  deleteContratoUser,
  contratoEmail,
};
