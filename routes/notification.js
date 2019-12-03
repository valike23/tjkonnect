const mysql = require("mysql");
const config = require('../routes/config.js');
const models = require('./classes');
const connection = mysql.createConnection(config.dbfree);
var auth = require("../routes/session");

let notification = {
    createNotification: function (message, userId,res) {
        let data = {
            message: message,
            userId : userId
        }
        let sql = "insert into notifications set ?";
        connection.query(sql, data, function (err, results) {
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
            return;

        })

    },
    retrieveNotification: function (userId, status, res) {
        let sql = "select * from notifications where status = " + status + "and userId = " + userId;
        connection.query(sql, data, function (err, results) {
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
            return;

        })
    },
    retrieveAllNotifications: function (userId,  res) {
        let sql = "select * from notifications where userId = "  + userId;
        connection.query(sql, function (err, results) {
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
            return;

        })
    },
    readNotification: function (id,userId, res) {
        let sql = "update notifications set status = 1 where id = " + id + "and userId = " + userId;
        connection.query(sql, data, function (err, results) {
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
            return;

        })
    },
    addContentNotification: function (type, contentId, userId, username, title, res) {
        console.log(userId)
        let sql = 'select subscriber from subscriptions where subscribee =? and notification = 1';
        let msg = username + " has just uploaded a new " + type + " '" + title + "'";
        connection.query(sql, userId, function (err, subscribers) {
            if (err) {
                res.status(200);
                res.json({
                    msg: "content uploaded successfully but notification generation failed",
                    trace: err
                });
                res.end();
                return;

            }

            let sql2 = "insert into notifications (message, userId,type,content) values ?";
            let notifys = [];
            for (var i = 0; i < subscribers.length; i++) {
                let notify = [];
                notify.push(msg);
                notify.push(subscribers[i].subscriber);
                notify.push( "upload");
                notify.push(contentId);
               

                notifys.push(notify);
            }
            console.log(notifys);
            connection.query(sql2, [notifys], function (err, results) {
                if (err) {
                    res.status(200);
                    res.json({
                        msg: "content uploaded successfully but notification generation failed",
                        trace: err
                    });
                    res.end();
                    return;

                }
                res.json('upload sucessful');
                res.end();
            })
        })
    }
}


module.exports = notification;