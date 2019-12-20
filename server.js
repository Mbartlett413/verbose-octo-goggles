var express = require('express'),
  cors = require('cors'),
  app = express(),
  port = process.env.PORT || 3030,
  mongoose = require('mongoose'),
  Task = require('./api/models/pdfModel'), //created model loading here
  Pdf = require('./api/models/pdfModeltwo'), //created model loading here
  bodyParser = require('body-parser');
  
// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/Tododb'); 

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var routes = require('./api/routes/pdfRoutes'); //importing route
routes(app); //register the route


app.listen(port);


app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
});

console.log('todo list RESTful API server started on: ' + port);
