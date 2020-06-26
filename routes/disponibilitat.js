const express = require("express");
var _ = require("lodash");
var async = require("async");
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

  let objecteLlistaTaules;
  try {
    objecteLlistaTaules = await getTaules();

    console.log("ACABO GETTAULES");
  } catch (err) {
    console.log(err);
  }
  let reservasPerDies;
  try {
    reservasPerDies = await getReservasPerDies(objecteDies, reservasPeriode);
  } catch (err) {
    console.log(err);
  }
  let taulesLliuresPerDies;
  try {
    taulesLliuresPerDies = await getTaulesLliuresPerDies(
      reservasPerDies,
      objecteLlistaTaules
    );
  } catch (err) {
    console.log(err);
  }

 
  res.json(reservasPerDies);
});




function getTaulesLliuresPerDies(reservasPerDies, objecteLlistaTaules) {
  return new Promise((resolve, reject) => {
    reservasPerDies.forEach((dia) => {
      dia.taules_ocupades_servei_1.forEach((reserva) => {
        let taulesLliuresServei_1 = objecteLlistaTaules;
        
      });
    });
    resolve(objecteDies);
  });
}

function getReservasPerDies(objecteDies, reservasPeriode) {
  return new Promise((resolve, reject) => {
    objecteDies.forEach((dia) => {
      let reservasDiaServei_1 = reservasPeriode.filter(
        (reserva) => reserva.data == dia.dia && reserva.id_servei == 1
      );
      var reservas_dia_servei_1 = [];
      Array.prototype.push.apply(reservas_dia_servei_1, reservasDiaServei_1);
      dia.taules_ocupades_servei_1 = reservas_dia_servei_1;
      let reservasDiaServei_2 = reservasPeriode.filter(
        (reserva) => reserva.data == dia.dia && reserva.id_servei == 2
      );
      var reservas_dia_servei_2 = [];
      Array.prototype.push.apply(reservas_dia_servei_2, reservasDiaServei_2);
      dia.taules_ocupades_servei_2 = reservas_dia_servei_2;
    });
    resolve(objecteDies);
  });
}

function getTaules() {
  return new Promise((resolve, reject) => {
    const queryTaules = `SELECT * FROM taules;`;
    let llistaTaules;
    mysqlConnection.query(queryTaules, (err, rows) => {
      if (!err) {
        llistaTaules = rows.map((item) => {
          console.log("ITEM: " + item);
          return {
            id_taula: item.id_taula,
            capacitatmaxima: item.capacitatmaxima,
          };
        });

        resolve(llistaTaules);
      } else {
        console.log(err);
        reject(err);
      }
    });
  });
}

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
      taules_ocupades_servei_1: 0,
      taules_ocupades_servei_2: 0,
      taules_lliures_servei_1: 0,
      taules_lliures_servei_2: 0,
    };
  });
  return objecteResposta;
};

function getReservasPeriode(firstDay, lastDay) {
  return new Promise((resolve, reject) => {
    const query = `SELECT reserves.id_reserva, data, num_comensals, id_taula, id_servei FROM reserves 
  inner join adjudicacions on reserves.id_reserva = adjudicacions.id_reserva
  WHERE data BETWEEN ? AND ?`;

    mysqlConnection.query(query, [firstDay, lastDay], (err, rows) => {
      if (!err) {
        var reservasPeriode = rows.map((item) => {
          return {
            id_reserva: item.id_reserva,
            data: item.data,
            id_servei: item.id_servei,
            num_comensals: item.num_comensals,
            id_taula: item.id_taula,
          };
        });
        console.log(
          "RESERVAS PERIODE IN FUNCTION" + JSON.stringify(reservasPeriode[3])
        );
        resolve(reservasPeriode);
      } else {
        console.log(err);
        reject(err);
      }
    });
  });
}

module.exports = disponibilitatRouter;
