
const  express = require('express');
var bodyParser = require('body-parser');
const app = express();
var _ = require('lodash');
var morgan = require('morgan');

var reservasRouter = require("./routes/reservas");
var disponibilitatRouter = require("./routes/disponibilitat");




app.set('port',process.env.PORT || 3000);
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.use('/reservas', reservasRouter);
app.use('/disponibilitat', disponibilitatRouter);


app.listen(app.get('port'),()=>{
    console.log("Listening on port 3000");
})

