const mysql = require("mysql");

/* const mysqlConnection = mysql.createConnection({
    host: "localhost",
    user:"root",
    password:"password",
    database:"restaurant",
    dateStrings: true,
    multipleStatements:true
}); */

const mysqlConnection = mysql.createConnection({
    host: "nxtabledatabase.mysql.database.azure.com",
    user:"nxtableadmin@nxtabledatabase",
    password:"nxtable48097932X",
    database:"restaurant",
    port: 3306,
    dateStrings: true,
    multipleStatements:true
});

mysqlConnection.connect(function(err){
    if(err){
        console.log(err);
        return;
    }else{
        console.log("Db is connected");
    }
})


module.exports = mysqlConnection;