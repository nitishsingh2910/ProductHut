const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById("5f1e6270f93d1f8e3abe2ec4")
        .then(user => {
            req.user = new User(user.name, user.email, user.cart, user._id);
            next();
        })
        .catch(err => {
            console.log(err);
        })
});


// middlewares

app.use('/admin', adminRoutes.router);

app.use(shopRoutes);

// 404 page not found error page
app.use(errorController.get404);

mongoConnect( () => {
    app.listen(3000);
});
