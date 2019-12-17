'use strict';
var express = require('express');
var router = express.Router();
var cloudinary = require('cloudinary').v2;
const mysql = require("mysql");
const config = require('../routes/config.js');
const models = require('./classes');
const connection = mysql.createConnection(config.dbfree);
cloudinary.config(config.cloudinary);
var auth = require("../routes/session");
var multer = require('multer');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();


router.use(function (req, res, next) {

    let authen = auth.isAuth(req.headers.token);
    if (authen) {
        req.authen = authen;
        next();
    }
    else {
        res.status(402);
        res.json("you are not logged in");
        res.end();
        return;
    }
})
router.use(function (req, res, next) {

    let user = req.authen.user;
    if (user.type == "admin") {
       
        next();
    }
    else {
        res.status(403);
        res.json("Authorization Failed");
        res.end();
        return;
    }
})

router.get('/all_prices', function (req, res) {
    let sql = "select * from payment_category";
    connection.query(sql, function (err, results) {
        if (err) {
            res.status(503);
            console.log(err.message);
            res.json({
                err: err.message,
                message: 'something went wrong when connecting to the db'
            });
        }
        res.json(results);
        res.end();
    })
})

router.post('/price', function (req, res) {
    let sql = 'insert into payment_category set ?';
    let price = {
        name: req.body.name,
        amount: req.body.amount
    }
    connection.query(sql, price, function (err, results) {
        if (err) {
            res.status(503);
            res.json({
                developer: err.message,
                user: "Oops!!! An internal server error occured"
            });
            res.end();
            return;
        }
        res.json(results);
        res.end();

    })

})

router.post('/change_price', function (req, res) {
    let sql = 'update payment_category set name= ?,amount= ? where id=?';
    let data = [req.body.name, req.body.amount,  req.body.id]
    connection.query(sql, data, function (err, results) {
        if (err) {
            res.status(503);
            res.json(err.message);
            res.end();
            return;
        }
        res.json(results);
        res.end();
    })
})




module.exports = router;