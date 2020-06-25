const express = require("express");
var _ = require("lodash");

var disponibilitatRouter = require("express").Router();
var moment = require("moment");

const mysqlConnection = require("../database");

disponibilitatRouter.get("/:data", async (req, res, next) => {
  console.log("ENTRO AL GET");
  const { data } = req.params;
  const firstDay = moment(data, "YYYY-MM-DD")
    .startOf("month")
    .format("YYYY-MM-DD");
  const lastDay = moment(data, "YYYY-MM-DD")
    .endOf("month")
    .format("YYYY-MM-DD");

  let objecteDies;
  try {
    objecteDies = getDies(firstDay);
    console.log("ACABO GETDIES");
  } catch (err) {
    console.log(err);
  }

  let reservasPeriode;
  try {
    reservasPeriode = await getReservasPeriode(firstDay, lastDay);
    console.log("ACABO GETRESERVAS");
  } catch (err) {
    console.log(err);
  }

  /* let objecteLlistaTaules;
  try {
    objecteLlistaTaules = await getTaules();

    console.log("ACABO GETTAULES");
  } catch (err) {
    console.log(err);
  } */

  console.log(objecteDies);
  res.json(objecteDies);
});

const getTaules = async () => {
  console.log("CALL LLISTA TAULES");
  const queryTaules = `SELECT * FROM taules;`;
  let llistaTaules;

  async.waterfall([
    function (callback) {
      mysqlConnection.query(queryTaules, callback);
    },
    function (rows, fields, callback) {
      llistaTaules = rows.map((item) => {
        console.log("ITEM: " + item);
        return {
          id_taula: item.id_taula,
          capacitatmaxima: item.capacitatmaxima,
        };
      });
    },
  ]);

  console.log("END QUERY NO ERRROR");
  console.log(
    "END QUERY NO ERRROR - LLISTA TAULES:  " + JSON.stringify(llistaTaules)
  );

  return llistaTaules;
};

/*  */

const getDies = (firstDay) => {
  var daysInMonth = [];
  var monthDate = moment(firstDay).startOf("month");
  _.times(monthDate.daysInMonth(), function (n) {
    daysInMonth.push(monthDate.format("YYYY-MM-DD"));
    monthDate.add(1, "day");
  });
  var objecteResposta = daysInMonth.map((item) => {
    return {
      dia: item,
      taules_ocupades: 0,
    };
  });
  return objecteResposta;
};

const getReservasPeriode = async (firstDay, lastDay) => {
  const query = `SELECT reserves.id_reserva, data, num_comensals, id_taula FROM reserves 
  inner join adjudicacions on reserves.id_reserva = adjudicacions.id_reserva
  WHERE data BETWEEN ? AND ?`;

  mysqlConnection.query(query, [firstDay, lastDay], (err, rows) => {
    if (!err) {
      var reservasPeriode = rows.map((item) => {
        return {
          id_reserva: item.id_reserva,
          data: item.data,
          num_comensals: item.num_comensals,
          id_taula: item.id_taula,
        };
      });
      console.log(
        "RESERVAS PERIODE IN FUNCTION" + JSON.stringify(reservasPeriode[3])
      );
      return reservasPeriode;
    } else {
      console.log(err);
    }
    return reservasPeriode;
  });
};

module.exports = disponibilitatRouter;

reservasRouter.post("/", (req, res) => {
  const {
    nom,
    telefon,
    torn,
    data,
    num_comensals,
    estat,
    id_taula,
    comentaris,
  } = req.body;
  console.log(req.body);
  const query = `
  SET @nom=?;
  SET @telefon=?;
  SET @torn=?;
  SET @data=?;
  SET @num_comensals=?;
  SET @estat=?;
  SET @id_taula=?;
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

  SET @last_id_in_reservas = LAST_INSERT_ID();
  INSERT INTO adjudicacions (id_reserva,id_taula)
  VALUES (@last_id_in_reservas,@id_taula)
  `;
  mysqlConnection.query(
    query,
    [nom, telefon, torn, data, num_comensals, estat, id_taula, comentaris],
    (err, rows, fields) => {
      if (!err) {
        let inserted_id = res.insertId;
        console.log("INSERTED ID:  " + inserted_id);
        res.json({ Status: "Reserva saved" });
      } else {
        console.log(err);
      }
    }
  );
});
