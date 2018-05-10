var express = require("express");
var bodyParser = require("body-parser");
var {ObjectID} = require("mongodb");

var {mongoose} = require("./db/mongoose");
var {Todo} = require("./models/todo");
var {User} = require("./models/user");

// create instance of app and listen on specfied port
var app = express();
const port = process.env.PORT || 3000;
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

// route to get all todos
app.get("/todos", (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos}); // send todo as an obect so properties can be added later
  }, (err) => {
      res.status(400).send(err);
  })
});

// route to get specific todo
app.get("/todos/:id", (req, res) => {
    var id = req.params.id;
    // check if id is valid
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    Todo.findById(id).then((todo) => {
        if(!todo){
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((err) => {
        res.status(400).send();
    })
});

app.listen(port, ()=>{
    console.log(`Listening or port ${port}`);
})

module.exports = {app};

