var mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
    
    amount:{
        type: Number,
        required: true,
        validate: {
            validator : function(value) {
                if(value < 0) {
                    throw new Error("Revenue Amount should always be positive.");
                }
            }
        } 
    },
    startDate:{
        type: Date,
        required: true
    }
});


const Revenue = new mongoose.model("Revenue",revenueSchema);

module.exports = Revenue;