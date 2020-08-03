const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    
    // const isLoggedIn = req.get('Cookie').trim().split('=')[1];
    // console.log(isLoggedIn);
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    }
    else{
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage : message
    });
};

exports.postLogin = (req, res, next) => {
    // res.setHeader('Set-Cookie', 'loggedIn=true');
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email: email})
    .then(user => {
        if(! user){
            req.flash('error', 'Invalid Email or Password');
            return res.redirect('/login');
        }
        bcrypt.compare(password, user.password)
            .then(doMatch => {
                if(doMatch){
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    req.session.save(err => {
                        console.log(err);
                        return res.redirect('/');
                    });
                }
                else{
                    req.flash('error', 'Invalid Email or Password');
                    return res.redirect('/login');
                }
            })
            .catch(err => {
                console.log(err);
                res.redirect('/login');
            })
    })
    .catch(err => {
        console.log(err);
    })
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
}

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    }
    else{
        message = null;
    }    
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    // check if this user already exists
    User.findOne({email: email})
        .then(userDoc => {
            if(userDoc){
                req.flash('error', 'Email already exists.');
                return res.redirect('/signup');
            }
            return bcrypt.hash(password, 12)
            .then(hashedPassword => {
                const user = new User({
                    email: email,
                    password: hashedPassword,
                    cart: {items: []}
                });
                user.save();
            })
            .then(result => {
                res.redirect('/login');
        })
        })
        .catch(err => {
            console.log(err);
        });
};