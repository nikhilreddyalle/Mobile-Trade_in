//require modules
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

const mainRouter = require('./routes/mainRoutes');
const tradeRouter = require('./routes/tradeRoutes');
const userRouter = require('./routes/userRoutes');


//create app
const app = express();


//configure app
const port = 3000;
const host = 'localhost';
app.set('view engine', 'ejs');

//connect to database
mongoose.connect('mongodb://127.0.0.1/trading',
                {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    //start the server
    app.listen(port, host, ()=>{
        console.log('Server is running on port', port);
    })
})
.catch(err => console.log(err.message));

//mount middleware
app.use(
    session({
        secret: "asdfghjkoiuygtfghj",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl:'mongodb://127.0.0.1/trading'}),
        cookie: {maxAge: 60*60*1000}
        })
);
app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user||null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));


//setup routes
app.use('/', mainRouter);
app.use('/trades', tradeRouter);
app.use('/users', userRouter);


//error handling

//404
app.use((req, res, next) => {
    // console.log(req);
    let err = new Error(`The server cannot locate ${req.url}`);
    err.status = 404;
    next(err);
});


// 500
app.use((err, req, res, next) => {
    console.log(err.stack);
    if (!err.status) {
        err.status = 500;
        err.message = ("Internal Server Error");
    }

    res.status(err.status);
    res.render('error', {error:err});
});
