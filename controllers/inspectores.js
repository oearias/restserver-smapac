const { response } = require("express");
const { getConnection } = require("../database/connection");
const sql = require("mssql");

const inspectoresGet = async (req, res = response) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query("SELECT * FROM inspectores ");

    res.json(result.recordset);
  } catch (error) {
    
    console.log(error);
    
  }
};


const inspectoresGetByReporteId = async (req, res = response) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", id)
      .query(
        "SELECT b.id, b.nombre FROM reporte_inspectores a INNER JOIN inspectores b on a.inspector_id = b.id WHERE a.reporte_id = @id"
      );

    res.json(result.recordset);
  } catch (error) {
    res.send(error.message);
  }
};

const inspectorGet = async (req, res = response) => {
  const { id } = req.params;
  const pool = await getConnection();

  const result = await pool
    .request()
    .input("identificador", id)
    .query("SELECT * FROM inspectores where id = @identificador ");

  console.log(result.recordset.length);

  if (result.recordset.length == 0) {
    return res.status(500).json({
      msg: "No hay registros en la tabla",
    });
  }

  res.status(200).json(result.recordset);
};

const inspectorPost = async (req, res = response) => {
  const { nombre } = req.body;
  const pool = await getConnection();

  try {
    let nombreMayus = "";

    if (nombre) {
      nombreMayus = nombre.toUpperCase();
    }

    const result = await pool
      .request()
      .input("nombre", nombreMayus)
      .query("INSERT INTO inspectores ( nombre ) values (@nombre)");

    console.log(result);

    if (result.rowsAffected[0] == 0) {
      return res.status(500).json({
        msg: "Los datos no se cargaron",
      });
    }

    res.status(200).json({
      msg: "El usuario: " + nombre + " fue cargado exitosamente",
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
};

const inspectorPut = async (req, res = response) => {
  const { id } = req.params;
  const { nombre } = req.body;

  const pool = await getConnection();

  try {
    let nombreMayus = "";

    if (nombre) {
      nombreMayus = nombre.toUpperCase();
    }
    await pool
      .request()
      .input("id", id)
      .input("nombre", sql.VarChar, nombreMayus)
      .query("UPDATE inspectores " + "SET nombre = @nombre " + "WHERE id=@id");
    res.json({
      msg: `Usuario: ${nombreMayus} editado correctamente`,
    });
  } catch (error) {
    res.json({
      error: "No se pudo actualizar el usuario",
    });
  }
};

const InspectorDelete = async (req, res = response) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();

    const result = await pool
      .request()

      .input("id", id)
      .query("DELETE FROM inspectores where id = @id");
    console.log(result);

    res.status(200).json({
      msg: "Inspector eliminado correctamente",
    });
  } catch (error) {
    res.json(error.message);
  }
};

module.exports = {
  inspectoresGetByReporteId,
  inspectoresGet,
  inspectorGet,
  inspectorPost,
  inspectorPut,
  InspectorDelete,
};
