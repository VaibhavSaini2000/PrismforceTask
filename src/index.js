require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require("path");
const hbs = require("hbs");
const db=require('./database_config/database_config').get(process.env.NODE_ENV);
const Balance = require("./models/balance");
const Expense = require("./models/expense");
const Revenue = require("./models/revenue");


const static_path = path.join(__dirname ,"../public");
const template_path = path.join(__dirname ,"../templates/views");
const partials_path = path.join(__dirname ,"../templates/partials");

// app use
app.use(express.urlencoded({extended : false}));
app.use(express.json());
app.use(express.static(static_path));  
app.set('view engine', 'hbs');
app.set('views',template_path);
hbs.registerPartials(partials_path);

// database connection
mongoose.Promise=global.Promise;

mongoose.connect(db.DATABASE,{ 
    useNewUrlParser: true,
    useUnifiedTopology:true, 
    useFindAndModify : false,
    useCreateIndex: true 
})
.then( () => console.log("Connected to mongodb Database"))
.catch( (err) => console.log(err));

app.get('/',function(req,res){
    if(req.error) {
        res.render("index");
    } else {
        res.render("index",{error:req.error});
    }
});

app.get('/input', async(req,res) => {
    try {
        var revenuelist = await Revenue.find({}).sort( { "startDate": 1 } );
        var expenselist = await Expense.find({}).sort( { "startDate": 1 } );
        res.render("input",{revenuelist:revenuelist,expenselist:expenselist});
    } catch (error) {
        req.error = error;
        res.render("index",{error:error});
    }
});

app.get('/addrevenue', async(req,res) => {
    try {
        res.render("addrevenue");
    } catch (error) {
        req.error = error;
        res.render("index",{error:error});
    }
});

app.post('/addrevenue', async(req,res) => {
    try {

        const newRevenue = new Revenue({
            startDate: req.body.startDate,
            amount: req.body.amount,
        })

        const result = await newRevenue.save(function(error,doc){
            if(error) {
                console.log(error);
                req.error = error;
                res.redirect("index",{error:error});
            }
            else res.redirect(201,"input");
        });
    } catch (error) {
        req.error = error;
        console.log(error);
        res.redirect("index");
    }
});

app.get('/addexpense', async(req,res) => {
    try {
        res.render("addexpense");
    } catch (error) {
        req.error = error;
        console.log(error);
        res.redirect("index");
    }
});

app.post('/addexpense', async(req,res) => {
    try {

        const newExpense = new Expense({
            startDate: req.body.startDate,
            amount: req.body.amount,
        })

        const result = await newExpense.save(function(error,doc){
            if(error) {
                console.log(error);
                req.error = error;
                res.redirect("index");
            }
            else res.redirect("input");
        });
    } catch (error) {
        req.error = error;
        res.redirect("index",{error:error});
    }
});

app.get('/output', async(req,res) => {
    try {
        var revstart = await Revenue.find({}).select('startDate').sort( { "startDate": 1 } ).limit(1);
        var expstart = await Expense.find({}).select('startDate').sort( { "startDate": 1 } ).limit(1);
        revstartdate = revstart[0].startDate;
        expstartdate = expstart[0].startDate;

        var revend = await Revenue.find({}).select('startDate').sort( { "startDate": 1 } ).limit(1);
        var expend = await Expense.find({}).select('startDate').sort( { "startDate": 1 } ).limit(1);
        revenddate = revend[0].startDate;
        expenddate = expend[0].startDate;
        
        Revenue.aggregate(
            [
                {   
                    $match:
                    {
                        startDate : {
                            $gte: revstartdate,
                            $lt: revenddate
                        }
                    }
                },
                {
                    $group:
                    {
                        _id :
                        {
                            amount :  "$amount",
                            startDate : "$startDate"
                        }
                    }
                },
                {
                    $sort: {
                        startDate : 1
                    }
                }
            ]
        ).exec(function ( e, d ) {
            console.log( d )            
        });

        // for await (const doc of agg1) {
        //     console.log(doc.name);
        // }

        Expense.aggregate(
            [
                {
                    $match:
                    {
                        startDate : {
                            $gte: expstartdate,
                            $lt: expenddate
                        }
                    }
                },
                {
                    $group:
                    {
                        _id :
                        {
                            amount :  "$amount",
                            startDate : "$startDate"
                        }
                    },
                },
                {
                    $sort:{
                        startDate : 1
                    }
                }
            ]
        ).exec(function ( e, d ) {
            console.log( d )            
        });

        // for await (const doc of agg2) {
        //     console.log(doc.name);
        // }

        res.redirect("output");
    } catch (error) {
        req.error = error;
        console.log(error);
        res.redirect("index");
    }
});

const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`app is live at ${PORT}`);
});