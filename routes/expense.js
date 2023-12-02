const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/ExpenseTrackerApp");

const expenseSchema = new mongoose.Schema({
       amount: Number,
       remark: String,
       category: String,
       paymentmode: {
            type: String,
            enum: ["cash", "online", "check"],
       },
       user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
       },
    },
    {timestamps : true}
);

module.exports = mongoose.model('Expense', expenseSchema);