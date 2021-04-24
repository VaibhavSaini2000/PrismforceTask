var mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    
    amount:{
        type: Number,
        required: true,
        validate: {
            validator : function(value) {
                if(value < 0) {
                    throw new Error("Expense Amount should always be positive.");
                }
            }
        } 
    },
    startDate:{
        type: Date,
        required: true
    }
});


const Expense = new mongoose.model("Expense",expenseSchema);

module.exports = Expense;