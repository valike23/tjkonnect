'use strict';
var express = require('express');

var cloudinary = require('cloudinary').v2;
const mysql = require("mysql");
const config = require('../config');
const models = require('../classes');
const connection = mysql.createConnection(config.dbfree);
cloudinary.config(config.cloudinary);
var auth = require("../session");
var multer = require('multer');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

let payment = {
    storePayment: function (ref, userId, category,cost) {
        let paymentDetail = {
            reference: ref,
            userId: userId,
            paymentCategory: category,
            cost:cost
        }
        let sql = 'INSERT INTO `payments` set ?';
        connection.query(sql, paymentDetail, function (err, res) {
            if (err) {
                return {
                    status: 0,
                    trace: err
                }
                return {
                    status: 1,
                    trace: res
                }
            }
        })
    }
}

module.exports = payment;