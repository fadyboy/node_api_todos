const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

// Create sample todos for GET test
const todos = [
    {"text": "This is my first todo"},
    {"text": "This is my second todo"},
    {"text": "This is my third todo"}
]

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