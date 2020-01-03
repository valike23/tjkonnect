'use strict';
const mysql = require("mysql");
const config = require('../config');
const models = require('../classes');
const connection = mysql.createConnection(config.dbfree);

let validations = {
    validateUpgrade: function (userId,res,rej) {
        let sql = 'SELECT id, refused FROM `application_form` WHERE application_form.status = 2  and application_form.userId =? order by id desc';
        connection.query(sql, [userId], function (err, results) {
            if (err) {
                rej(err);
                return;
            }
            return res(results);
        })

    }
}
module.exports = validations;
