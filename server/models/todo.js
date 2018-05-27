var mongoose = require("mongoose");

var todoSchema = new mongoose.Schema({
    text:{
        type: String,
        required: true,
        minlength: 1,
        trim: 1
    },
    completed:{
        type: Boolean,
        default: false
    },
    completedAt:{
        type: Number,
        default: null
    }
});
var Todo = mongoose.model("Todo", todoSchema);

module.exports = {Todo};