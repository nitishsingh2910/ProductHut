const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const User = require('./models/user');
const MONGODB_URI = 'mongodb://localhost:27017/shop';

const app = express();
const sessionStore = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'should be a long string',
    resave: false, 
    saveUninitialized: false, 
    store: sessionStore
    })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {

    if(! req.session.user){
        return next();
    }

    User.findById(req.session.user._id)
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => {
        console.log(err);
    })
})

// middlewares

app.use( (req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn,
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRoutes.router);
app.use(shopRoutes);
app.use(authRoutes);

// 404 page not found error page
app.use(errorController.get404);

mongoose.connect(MONGODB_URI)
    .then(result => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });
