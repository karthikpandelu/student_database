//requiring files
var express = require('express');
var studentController = require('./controller/studentController');
var bodyParser = require('body-parser');
var mongo = require('mongodb').MongoClient;
//var assert = require('assert');

var app = express();

//url encoded parser
app.use(bodyParser.urlencoded({extended: false}));

//parse json
app.use(bodyParser.json());

//setup view engine
app.set('view engine', 'pug');

//use static files
app.use(express.static('./public'));

//mongodb url
var url = 'mongodb://localhost:27017/studentdb';

//calling controller
//studentController(app);

/////////////////////////////////////////
//routes setup
app.get('/student_database', function(req, res){
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/add_student.html', function(req, res){
    res.sendFile(__dirname + '/views/add_student.html');
});

app.post('/insert', function(req, res){
    var item = {
      name: req.body.name,
      reg_no: req.body.reg_no,
      branch: req.body.branch,
      contact_no: req.body.contact_no
    };

    mongo.connect(url, function(err, db){
      if(err){
        console.log(err);
      }else {
        db.collection('students').insertOne(item, function(err, result){
          if(err){
            console.log(err);
          }else {
            console.log('Item iserted');
            db.close();
            res.redirect('/add_student.html');
          }
        });
      }
    });
});

app.get('/search_student.html', function(req, res){
    res.sendFile(__dirname + '/views/search_student.html');
});

app.post('/search', function(req, res){
    var name = req.body.name;
    var resArray = [];
    mongo.connect(url, function(err, db){
      if(err){
        console.log(err);
      }else {
        var cursor = db.collection('students').find();
        cursor.forEach(function(doc, err){
          if(err){
            console.log(err);
          }else {
            resArray.push(doc);
          }
        }, function(){
          db.close();
          res.render('layout', {result: resArray});
        });
      }
    });
});

app.get('/display.html', function(req, res){
    res.sendFile(__dirname + '/views/display.html');
});

app.get('/remove_student.html', function(req, res){
    res.sendFile(__dirname + '/views/remove_student.html');
});



/////////////////////////////////////////

//listen to port 3000
app.listen(3000, function(){
    console.log('Student database live in port 3000!');
});
