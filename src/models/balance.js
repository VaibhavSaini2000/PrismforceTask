var mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
    
    amount:{
        type: Number,
        required: true 
    },
    startDate:{
        type: Date,
        required: true
    }
});


const Balance = new mongoose.model("Balance",balanceSchema);

module.exports = Balance;