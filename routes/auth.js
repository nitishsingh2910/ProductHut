const express = require('express');
const {check, body} = require('express-validator/check')

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

router.post('/signup', 
    [
        check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, {req}) => {
            if(value == 'test@test.com'){
                throw new Error('This email is forbidden');
            }
            return true;
        }),
        body('password', 'Default error message')
        .isLength({min: 6}).withMessage('Please enter ')
        .isAlphanumeric(),
        body('confirmPassword')
        .custom((value, {req}) => {
            if(value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        })
    ],
    authController.postSignup);


module.exports = router;