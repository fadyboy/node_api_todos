// get config settings
require("../server/config/config");

const express = require("express");
const bodyParser = require("body-parser");
const {ObjectID} = require("mongodb");
const _ = require("lodash");

const {mongoose} = require("./db/mongoose");
const {Todo} = require("./models/todo");
const {User} = require("./models/user");
const {authenticate} = require("./middleware/authenticate");

// create instance of app and listen on specfied port
var app = express();
const port = process.env.PORT;
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

// route to delete a specific todo
app.delete("/todos/:id", (req, res) => {
    var id = req.params.id;
    // check if id is valid
    if(!ObjectID.isValid(id)) {
        return res.status(404).send({msg:"No such todo found"});
    }
    Todo.findByIdAndRemove(id).then((todo) =>{
        if(!todo){
            return res.status(404).send();
        }
        res.status(200).send({todo});
    }).catch((err) => {
        res.status(400).send();
    })
});

// route to update a specific todo
app.patch("/todos/:id", (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ["text", "completed"])
    // check id is valid
    if(!ObjectID.isValid(id)){
        return res.status(404).send({msg:"No such todo found"});
    }
    if(_.isBoolean(body.completed) && body.completed){
        // if completed is set to true get timestamp
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }
    Todo.findByIdAndUpdate(id, {$set:body}, {new:true}).then((todo) => {
        if(!todo) {
            return res.status(404).send({msg:"No todo found"});
        }
        res.send({todo});
    }).catch((err) => {
        res.status(400).send();
    })
});

// create route to create a new user
app.post("/users", (req, res) => {
    var body = _.pick(req.body, ["email", "password"]);
    var user = new User(body); // body is an object with email and password properties
    user.save().then(() => {
        return user.generateAuthToken()
        // res.send(doc);
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((err) => {
        res.status(400).send(err);
        
    })
});

app.get("/users/me", authenticate, (req, res) => {
    res.send(req.user);
});

app.listen(port, () => {
    console.log(`Listening or port ${port}`);
})

module.exports = {app};

