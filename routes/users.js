const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/ExpenseTrackerApp");

const userSchema = new mongoose.Schema({
     username: String,
     email: String,
     password: String,
     token:{
          type: Number,
          default: -1,
      },
     expenses:[{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Expense',
     }],

     } ,

     {timestamps : true}
);

userSchema.plugin(plm);
module.exports = mongoose.model('User', userSchema);