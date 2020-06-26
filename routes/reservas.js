const express = require("express");
var reservasRouter = require("express").Router();
const myModule = require("../database");

const pool = myModule.pool;

reservasRouter.get("/", (req, res) => {
  pool.getConnection(function (err, connection) {
    if (err) throw err; // not connected!
    connection.query("SELECT * from reserves", (error, rows, fields) => {
      connection.release();
      if (!err) {
        res.json(rows);
      } else {
        console.log(error);
        throw error;
      }
    });
  });
});

reservasRouter.get("/:data", (req, res) => {
  const { data } = req.params;
  pool.getConnection(function (err, connection) {
    if (err) throw err; // not connected!
    connection.query(
      "SELECT * FROM reserves inner join clients on reserves.id_client = clients.id_client and reserves.data=? inner join adjudicacions on reserves.id_reserva = adjudicacions.id_reserva and reserves.data=?",
      [data, data],
      (error, rows, fields) => {
        connection.release();
        if (!err) {
          res.json(rows);
        } else {
          console.log(error);
          throw error;
        }
      }
    );
  });
});

reservasRouter.delete("/:id", (req, res) => {
  const { id } = req.params;
  pool.getConnection(function (err, connection) {
    if (err) throw err; // not connected!
    connection.query(
      `
      SET @id=?;
      DELETE FROM adjudicacions WHERE id_reserva=@id;
      DELETE FROM reserves WHERE id_reserva=@id;
      `,
      [id],
      (error, rows, fields) => {
        connection.release();
        if (!error) {
          res.json(rows);
        } else {
          console.log(error);
          throw error;
        }
      }
    );
  });
});

/* reservasRouter.post("/", (req, res) => {
  const {
    nom,
    telefon,
    torn,
    data,
    num_comensals,
    estat,
    comentaris,
    id_taula,
  } = req.body;
  console.log(req.body);
  const query = `
  SET @nom=?;
  SET @telefon=?;
  SET @torn=?;
  SET @data=?;
  SET @num_comensals=?;
  SET @estat=?;
  SET @comentaris=?;

  INSERT INTO clients (nom, telefon)
  SELECT * FROM (SELECT @nom, @telefon) AS tmp
  WHERE NOT EXISTS(
      SELECT telefon FROM clients WHERE telefon=@telefon
  )LIMIT 1;
  SET @id_this_client = (SELECT id_client FROM clients WHERE telefon=@telefon);
  SET @hora_entrada = (SELECT hora_inici FROM torns WHERE id_torn=@torn);
  SET @servei = (SELECT id_servei FROM torns WHERE id_torn=@torn);

  INSERT INTO reserves (id_client,id_servei,id_torn,hora_entrada,data,num_comensals,estat,comentaris)
  VALUES (@id_this_client,@servei,@torn,@hora_entrada,@data,@num_comensals,@estat,@comentaris); 
  `;
  mysqlConnection.query(
    query,
    [nom, telefon, torn, data, num_comensals, estat, comentaris],
    (err, rows, fields) => {
      if (!err) {
        let idLastReserva = JSON.stringify(rows[rows.length - 1].insertId);
        console.log("ROWS ID LAST: " + idLastReserva);
        console.log("ID_TAULA ARRAY:   " + id_taula);
        let queryString =
          "INSERT INTO adjudicacions(id_reserva,id_taula)VALUES";
        for (var i = 0; i < id_taula.length; i++) {
          queryString += "(" + idLastReserva + "," + id_taula[i] + ")";
          if (i == id_taula.length - 1) {
            queryString += ";";
          } else {
            queryString += ",";
          }
        }
        console.log("QUERY STRING:   " + queryString);
        mysqlConnection.query(queryString, (err, rows, fields) => {
          if (!err) {
            res.json({ Status: "Reserva saved" });
          } else {
            console.log(err);
          }
        });
      } else {
        console.log(err);
      }
    }
  );
}); */

reservasRouter.post("/", async (req, res) => {
  const {
    nom,
    telefon,
    torn,
    data,
    num_comensals,
    estat,
    comentaris,
    id_taula,
  } = req.body;
  console.log(req.body);
  const query = `
  SET @nom=?;
  SET @telefon=?;
  SET @torn=?;
  SET @data=?;
  SET @num_comensals=?;
  SET @estat=?;
  SET @comentaris=?;

  INSERT INTO clients (nom, telefon)
  SELECT * FROM (SELECT @nom, @telefon) AS tmp
  WHERE NOT EXISTS(
      SELECT telefon FROM clients WHERE telefon=@telefon
  )LIMIT 1;
  SET @id_this_client = (SELECT id_client FROM clients WHERE telefon=@telefon);
  SET @hora_entrada = (SELECT hora_inici FROM torns WHERE id_torn=@torn);
  SET @servei = (SELECT id_servei FROM torns WHERE id_torn=@torn);

  INSERT INTO reserves (id_client,id_servei,id_torn,hora_entrada,data,num_comensals,estat,comentaris)
  VALUES (@id_this_client,@servei,@torn,@hora_entrada,@data,@num_comensals,@estat,@comentaris); 
  `;
  let queryadjudicacions;
  try {
    queryadjudicacions = await insertReservas(
      query,
      nom,
      telefon,
      torn,
      data,
      num_comensals,
      estat,
      comentaris,
      id_taula
    );
  } catch (err) {
    console.log(err);
  }
  try {
    await insertadjudicacions(queryadjudicacions);
    res.json({ Status: "Reserva saved" });
  } catch (err) {
    console.log(err);
    res.json({ Status: "Problem saving reserva" });
  }
});

function insertadjudicacions(query) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!
      connection.query(query, (err, rows, fields) => {
        connection.release();
        if (!err) {
          resolve();
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  });
}

function insertReservas(
  query,
  nom,
  telefon,
  torn,
  data,
  num_comensals,
  estat,
  comentaris,
  id_taula
) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!
      connection.query(
        query,
        [nom, telefon, torn, data, num_comensals, estat, comentaris],
        (err, rows) => {
          connection.release();
          if (!err) {
            let idLastReserva = JSON.stringify(rows[rows.length - 1].insertId);
            let queryString =
              "INSERT INTO adjudicacions(id_reserva,id_taula)VALUES";
            for (var i = 0; i < id_taula.length; i++) {
              queryString += "(" + idLastReserva + "," + id_taula[i] + ")";
              if (i == id_taula.length - 1) {
                queryString += ";";
              } else {
                queryString += ",";
              }
            }
            resolve(queryString);
          } else {
            console.log(err);
            reject(err);
          }
        }
      );
    });
  });
}

module.exports = reservasRouter;
