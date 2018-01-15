//requiring files
var express = require('express');
var studentRoutes = require('./routes/routes');
var bodyParser = require('body-parser');

var app = express();

//url encoded parser
app.use(bodyParser.urlencoded({extended: false}));

//parse json
app.use(bodyParser.json());

//setup view engine
app.set('view engine', 'pug');

//use static files
app.use(express.static('public'));

// calling routes
studentRoutes(app);

//listen to port 3000
app.listen(3000, function(){
    console.log('Student database live in port 3000!');
});