const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

// Create sample todos for GET test
const todos = [
    {_id:  new ObjectID(), text: "This is my first todo"},
    {_id: new ObjectID(), text: "This is my second todo", completed: true, completedAt: 1246},
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

// Test to delete todo
describe('DELETE /todos/:id', () => {
    it('Should delete the specified todo', (done) => {
        var delId = todos[0]._id.toHexString(); // get id of 1st todo

        request(app)
          .delete(`/todos/${delId}`)
          .expect(200)
          .expect((res) => {
              expect(res.body.todo._id).toBe(delId)
          })
          .end((err, res) => {
            if(err) {
                return done(err);
            }
            Todo.findById(delId).then((todo) => {
                expect(todo).toBeFalsy;
                done();
            }).catch((err) => done(err))
          }); 
    });

    it('Should return a 404 error if todo not found', (done) => {
        var hexId = new ObjectID();
        request(app)
          .delete(`/todos/${hexId}`)
          .expect(404)
          .end(done);
    });

    it('Should return a 404 error if object id is invalid', (done) => {
        request(app)
          .delete('/todos/12345')
          .expect(404)
          .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('Should update the todo', (done) => {
        var todoId = todos[0]._id.toHexString();
        var changes = {
            text: "The text has changed",
            completed: true
        };
        request(app)
          .patch(`/todos/${todoId}`)
          .send(changes)
          .expect(200)
          .end((err, res) => {
              if(err) {
                  return done(err);
              }
              Todo.findByIdAndUpdate(todoId, {$set:changes}).then((todo) =>{
                expect(todo.text).toBe(changes.text);
                expect(todo.completed).toBe(changes.completed);
                expect(typeof todo.completedAt).toBe('number');
                done();
              }).catch((err) => done(err))
          })
    });

    it('Should clear completedAt property when todo is not completed', (done) => {
        var todoId = todos[1]._id.toHexString();
        var changes = {
            completed: false
        };
        request(app)
          .patch(`/todos/${todoId}`)
          .send(changes)
          .expect(200)
          .end((err, res) => {
              if(err) {
                  return done(err);
              }
              Todo.findByIdAndUpdate(todoId, {$set:changes}).then((todo) => {
                  expect(todo.text).toBe(todos[1].text);
                  expect(todo.completed).toBe(false);
                  expect(todo.completedAt).toBe(null);
                  done();
              }).catch((err) => done(err))
          })
    });

    it('Should update this other todo', (done) => {
        var id = todos[2]._id.toHexString();
        var changes = {
            completed: true,
            text: "This na sure banker"
        }
        request(app)
          .patch(`/todos/${id}`)
          .send(changes)
          .expect(200)
          .expect((res) => {
              expect(res.body.todo.text).toBe(changes.text)
              expect(res.body.todo.completed).toBe(true)
              expect(typeof res.body.todo.completedAt).toBe('number')
          })
          .end(done);
    });

    it('Should remove the completedAt value to null v2', (done) => {
        var id = todos[1]._id.toHexString();
        request(app)
          .patch(`/todos/${id}`)
          .send({completed:false})
          .expect(200)
          .expect((res) => {
              expect(res.body.todo.completed).toBe(false)
              expect(res.body.todo.completedAt).toBe(null)
              expect(res.body.todo.text).toBe(todos[1].text)
          })
          .end(done);
    });
});