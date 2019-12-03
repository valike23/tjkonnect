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



module.exports = router;