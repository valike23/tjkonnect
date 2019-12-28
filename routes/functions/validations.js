'use strict';
const mysql = require("mysql");
const config = require('../config');
const models = require('../classes');
const connection = mysql.createConnection(config.dbfree);

let validations = {
    validateUpgrade: function (userId,res) {
        let sql = 'SELECT id, refused FROM `application_form` WHERE application_form.status = 2  and application_form.id =?';
        connection.query(sql, [userId], function (err, results) {
            if (err) {
                res.status(503);
                res.json(err.message);
                res.end();
                return;
            }
            return {

            }
        })

    }
}
module.exports = validations;
