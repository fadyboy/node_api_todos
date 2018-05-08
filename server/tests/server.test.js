const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

// Create sample todos for GET test
const todos = [
    {_id:  new ObjectID(), text: "This is my first todo"},
    {_id: new ObjectID(), text: "This is my second todo"},
    {_id: new ObjectID(),text: "This is my third todo"}
];

// Make sure no Todos exist before running test
beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos)
          .then(() => done())
    });
})

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'This is a sample todo';

        request(app)
          .post('/todos')
          .send({text})
          .expect(200)
          .expect((res) => {
            expect(res.body.text).toBe(text)
          })
          .end((err, res) => {
              if(err) {
                  return done(err);
              }
              Todo.find({text}).then((todos) => {
                  expect(todos.length).toBe(1);
                  expect(todos[0].text).toBe(text);
                  done()
              })
              .catch((err) => done(err));
          })
    });

    it('should not create a new todo with invalid data', (done) => {
        var text = "";
        request(app)
          .post('/todos')
          .send({text})
          .expect(400)
          .end((err, res) => {
              if(err) {
                  return done(err);
              }
              Todo.find({text}).then((todos) => {
                  expect(todos.length).toBe(0);
                  done()
              })
              .catch((err) => done(err));
          })
    });
});

describe('GET /todos', () => {
    it('Should get a list of todos', (done) => {
      request(app)
        .get('/todos')
        .expect(200)
        .end((err, res) => {
            if(err) {
                return done(err);
            }
            Todo.find().then((todos) => {
                expect(todos.length).toBe(3);
                done()
            })
            .catch((err) => done(err));
        })
    })
});

describe('GET /todos/:id', () => {
    // note (done) because test is async
    // convert the ObjectID to 24 byte hex string representation
    it('Should return the specified todo', (done) => {
      request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    });

    it('Should return a 404 if todo not found', (done) => {
      var hexId = new ObjectID().toHexString();  
      request(app)
        .get(`/todos/${hexId}`)
        .expect(404)
        .end(done);
    });

    it('Should return a 404 for non ObjectIDs', (done) => {
        request(app)
          .get('/todos/1235')
          .expect(404)
          .end(done);
    })
});