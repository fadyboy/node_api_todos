var express = require("express");
var bodyParser = require("body-parser");

var {mongoose} = require("./db/mongoose");
var {Todo} = require("./models/todo");
var {User} = require("./models/user");

// create instance of app and listen on specfied port
var app = express();
app.use(bodyParser.json()); // Configure app middleware

// route to create todos
app.post("/todos", (req, res) =>{
    var todo = new Todo({
        text: req.body.text
    })

    todo.save().then((doc)=>{
      res.send(doc);
    }, (err)=>{
        res.status(400).send(err);
    });
});

// route to get todos
app.get("/todos", (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos}); // send todo as an obect so properties can be added later
  }, (err) => {
      res.status(400).send(err);
  })
})

app.listen(3000, ()=>{
    console.log("Listenting on port 3000");
})

module.exports = {app};

