var mongo = require('mongodb').MongoClient;
var DataBase = require('../db/config'); 

var url = DataBase.url;

module.exports = function(app){
    
app.get('/test', function(req, res){
    res.sendFile(__dirname + '/views/add_student.html');
  });
  
  app.get('/student_database', function(req, res){
    res.render('index');
  });
  
  //to display add student form
  app.get('/add_student.html', function(req, res){
    res.render('add_student');    
  });
  
  //post mesthod of inserting new student details
  app.post('/insert', function(req, res){
      //object to hold all the input values
      var item = {
        name: req.body.name,
        reg_no: req.body.reg_no,
        branch: req.body.branch,
        contact_no: req.body.contact_no
      };
      //connecting to database
      mongo.connect(url, function(err, db){
        if(err){
          console.log(err);
        }else {
          //inserting input object to the database
          db.collection('students').insertOne(item, function(err, result){
            if(err){
              console.log(err);
            }else {
              console.log('Item inserted');
              db.close();
              //after addintion redirecting the page to the form again
              res.render('add_student', {result_s: "STUDENT DETAILS ADDED SUCCESSEFULLY"});
            }
          });
        }
      });
  });
  
  //to display the form to search a student details
  app.get('/search_student.html', function(req, res){
      res.render('search_student');
  });
  
  //handling post request of serach
  app.post('/search', function(req, res){
      var name = req.body.name;       //name to be searched
      //connecting to the database
      mongo.connect(url, function(err, db){
        if(err){
          console.log(err);
        }else {
          var col = db.collection('students');
          //taking the collection as an array to search  for the student details
          col.find().toArray(function(err, item){
            if(err){
              console.log(err);
            }else {
              var flag = false;   //flag to save the results of search
              for(var i=0; i<item.length; i++){
                if(item[i].name == name){
                  flag = true;    //when details found
                  var resName = item[i].name;
                  var resReg_no = item[i].reg_no;
                  var resBranch = item[i].branch;
                  var resContact = item[i].contact_no;
                }
              }
              if(!flag){
                res.render('search_student', {result_f: name + " NOT FOUND"}); //if not found render display none file
                db.close();
              }
              //if found render the file and send data to display
              res.render('displayOne', { name: resName, reg_no: resReg_no, branch: resBranch, contact_no: resContact });
              db.close();
            }
          });
        }
      });
  });
  
  
  //route to handle display all students request
  app.get('/display.html', function(req, res){
    mongo.connect(url, function(err, db){
      if(err){
        console.log(err);
      }else {
        var col = db.collection('students');
        col.find().toArray(function(err, item){
          if(err){
            console.log(err);
          }else {
            //sending item containiing the entire collection 
            res.render('display', { data: item });
            db.close();
          }
        });
      }
    });
  });
  
  //route to handle delete student details request. rendering the form to input name
  app.get('/remove_student.html', function(req, res){
      res.render('remove_student'); 
  });
  
  //handling post request to remove student details
  app.post('/remove', function(req, res){
      var input_name = req.body.name;   //name to be removed from list
      mongo.connect(url, function(err, db){
        if(err){
          console.log(err);
        }else {
          var col = db.collection('students');
          //get the list as array and serach for data containing input name
          col.find().toArray(function(err, item){
            if(err){
              console.log(err);
            }else {
              var flag = false;
              for(var i=0; i<item.length; i++){
                if(item[i].name == input_name){
                  //if the data is present delete that data
                  flag = true;
                  col.deleteOne({name: input_name}, function(err, result){
                    if(err){
                      console.log(err);
                    }else{
                      console.log("Item deleted");
                      db.close();
                      //render the form again with message of success
                      res.render('remove_student', {result_s: input_name + " DETAILS DELETED"}); 
                    }
                  });
                }
              }
              if(!flag){
                //if data to be deleted not present in the database, render the form again with the message of failure
                console.log("Item not found");
                db.close();
                res.render('remove_student', {result_f: input_name + " NOT FOUND"}); 
              }
            }
          });
        }
      });
  });
  
  //rote to handle update details request
  app.get('/update_student.html', function(req, res){
    res.render('update_student_form');
  });
  
  //handling the post request from data to be updated
  app.post('/update', function(req, res){
    var input_name = req.body.name;   //name of the student whose details to be updated
      mongo.connect(url, function(err, db){
        if(err){
          console.log(err);
        }else {
          var col = db.collection('students');
          //get the list as array and serach for data containing input name
          col.find().toArray(function(err, item){
            if(err){
              console.log(err);
            }else {
              var flag = false;
              for(var i=0; i<item.length; i++){
                if(item[i].name == input_name){
                  flag = true;
                  //item found, render next form to change detals
                  res.render('update_student_after', { data: item[i] });
                  
                  //taking input of new values
                  app.post('/update_next', function(req, res){
                    mongo.connect(url, function(err, db){
                      if(err){
                        console.log(err);
                      }else{
                        var col = db.collection('students');
                        col.updateOne({name: input_name}, {$set: {name: req.body.name, reg_no: req.body.reg_no, branch: req.body.branch, contact_no: req.body.contact_no}}, function(err, result){
                          if(err){
                            console.log(err);
                          }else{
                            console.log('Item  updated');
                            db.close();
                            res.render('update_student_form', {result_s: req.body.name + " DETAILS UPDATED"});
                          }
                        });
                      }
                    });
                  });
                }
              }
              if(!flag){
                //if item to be updated not found, render the form to input name again with failure message
                console.log("Item not found");
                db.close();
                res.render('update_student_form', {result_f: input_name + " NOT FOUND"}); 
              }
            }
          });
        }
      });  
  });
}