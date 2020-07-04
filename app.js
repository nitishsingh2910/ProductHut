const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'public')));

// middlewares

app.use('/admin', adminData.router);

app.use(shopRoutes);

// 404 page not found error page
app.use((req, res, next) => {
    res.status(404).render('404', { pageTitle: 'Page Not Found', path: null });
});

app.listen(3000);