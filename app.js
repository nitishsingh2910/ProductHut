const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const mongoose = require('mongoose');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('5f231e3190b5fd658847a5f2')
        .then(user => {
            req.user = user;
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

mongoose.connect('mongodb://localhost:27017/shop')
    .then(result => {

        if(User.findOne().then(user => {
            if(! user) {
                const user = new User({
                    name: 'Nitish',
                    email: 'nitishsingh0@gmail.com',
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
        }))

        app.listen(3000)
    })
    .catch(err => {
        console.log(err);
    });
