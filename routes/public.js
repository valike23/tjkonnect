'use strict';
var express = require('express');
var router = express.Router();
var mysql = require("mysql");
var csc = require("country-state-city").default;

var cloudinary = require('cloudinary').v2;
const config = require('../routes/config.js');
var connection = mysql.createConnection(config.dbfree);
const cryptoRandomString = require('crypto-random-string');
var auth = require("../routes/session");
const bcrypt = require('bcryptjs');
const mongo = require('./mongo');
const saltRounds = bcrypt.genSaltSync(10);
var worker = require("./worker");
const session = require("./session");
router.get('/', function (req, res) {

    res.json(session.sessions);
   
})
router.get('/countries', function (req, res) {
    let countries = csc.getAllCountries();
    res.json(countries);
    res.end();
})
router.get('/states/:id', function (req, res) {
    let country = req.params.id;
    let states = csc.getStatesOfCountry(country);
    res.json(states);
    res.end();
});
router.get('/competitioncontents/:page/:tag', function (req, res, next) {
    let tag = req.params.tag
    let page = req.params.page;
    page = (page - 1) * 5;
    console.log(tag)
    let sql = 'CALL competitionContent("' + tag + '",' + page + ')';
    connection.query(sql, function (err, results) {
        if (err) {
            console.log(err);
            res.status(503);
            res.json({
                developer: err.message,
                user: "Oops!!! An internal server error occured"
            });
            res.end();
            return;
        }
        console.log(results)
        res.json(results);
        res.end();

    })
})
router.get('/cities/:id', function (req, res) {
    let state = req.params.id;
    let cities = csc.getCitiesOfState(state);
    res.json(cities);
    res.end();
});
router.post('/register', function (req, res) {
    var user = req.body;
    var query = "INSERT INTO users SET ?";
    console.log(user);
    var hash = bcrypt.hashSync(user.password, saltRounds)
    console.log(hash);
    user.password = hash;
    connection.query(query, user, function (err, resu) {
        if (err) {
            console.log(err);
            res.status(503);
            let error = {
                message: err.sqlMessage,
                response: "Something went wrong! dont worry its from us and we are currently working on it. Try again later."
            }
            res.json(error);
            res.end();
            return;
        }
        res.json({
            message: "user created successfully",
            info: resu
           
        });
        console.log(resu);
        res.end();

    })
});
router.get('/prices/:data', function (req, res) {
    let query = 'select amount from payment_category where name =' + req.params.data;
    connection.query(query, function (err, results) {
        if (err) {
            res.status(503);
            console.log(err.message);
            res.json({
                err: err.message,
            message: 'something went wrong when connecting to the db'});
        }
        res.json(results);
        res.end();
    })
})
router.get("/content/:type/:id/:page", function (req, res) {
    let type = req.params.type;
    let id = req.params.id;
    let page = req.params.page;
    page = (req.params.page - 1) * 5;
    connection.query('call getUserContent("' + type +'",' + id + ',' + page + ')', function (err, result) {
        if (err) {
            res.status(503);
            console.log(err.message);
            res.json("something went wrong while retrieving user " + type);
        }
        res.json(result);
        res.end();
    });
});
router.post('/login', function (req, res) {    
    var user = req.body;
    console.log(user);
    var query = 'SELECT * FROM users WHERE username =' + mysql.escape(user.username);
    connection.query(query, function (err, results) {
        if (err) {
            console.log(err);
            res.status(500);
            res.json("something went wrong!!!");
            res.end();
            return;
        }
        if (results.length > 0) {
            bcrypt.compare(user.password, results[0].password, function (error, test) {
                if (error) {
                    console.log(error);
                    res.status(500);
                    res.json("bycrpt failed to compare correctly");
                    res.end();
                    return;
                }
                if (test) {
                    function createUserSession() {
                        let random = cryptoRandomString({ length: 20 });
                        if (auth.isUnique(random)) {
                            return {
                                user: results[0],
                                session: random,
                                duration: parseInt(Date.now()) + config.duration * 60000
                            }
                        }
                        else {
                            createUserSession();
                        }
                    }
                    let session = createUserSession();
                    auth.sessions.push(session);
                    console.log(session);
                    results[0].password = null;
                    var data = {
                        session: session.session,
                        user: results[0],
                        response: "successful"
                    }
                    res.json(data);
                    res.end();
                }
                else {
                    var data = {
                        user: null,
                        response: "password is incorrect!!!!"
                    }
                    res.json(data);
                    res.end();
                }
            });           
        }
        else {
            var data = {
                user: null,
                response: "username is incorrect!!!!"
            }
            res.json(data);
            res.end();
        }
    })
});
router.get('/plans', function (req, res) {
    let sql = 'SELECT id, amount, impression, 1 as category FROM `budget` ';
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
    })
})
router.get('/recent_upload', function (req, res) {
    let query = "call getRecentContent()";
    connection.query(query, function (err, results) {
        if (err) {
            res.status(503);
            res.json({
                err_beauty: "An error occured in the DB",
                err_raw: err.message
            });
            res.end();
            console.log(err);
            return;
        }
        res.json(results);
        res.end();

    })
});
router.get('/checkusername/:user', function (req, res) {
    let username = req.params.user;
    let data;
    let sql = 'call checkUsername("' + username + '")';
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
        console.log(results[0][0]);
        if (results[0][0]) {
            data = {
                status: true
            };

        }
        else {
            data = {
                status: false
            };
        }
        res.json(data);
        res.end();

    })
});
router.get("/most_viewed", function (req, res) {
    connection.query("call get_most_viewed_content()", function (err, result) {
        if (err) {
            console.log(err);
            res.status(500);
            res.json("something went wrong");
        }
        console.log(result);
        res.json(result);
        res.end();

    })
});
router.get("/trending/:page", function (req, res) {
    let page1 = (req.params.page - 1) * 8;
    
    let sql = 'CALL getTrending(' + page1 + ')';
    connection.query(sql, function (error, results) {
        if (error) {
            console.log(error);
            res.json({
                msg: "could not retrieve trending contents",
                err: error
            })
            res.end();
            return;
        }
        res.json(results);
        res.end();
    })
})
router.get("/similar/:name", function (req, res) {
    let sql = "CALL getSimilar('" + req.params.name + "')";
    connection.query(sql, function (error, results) {
        if (error) {
            console.log(error);
            res.json({
                msg: "could not retrieve similar contents",
                err: error
            })
        }
        res.json(results);
        res.end();
    })
});
router.get("/dashboard/:page", function (req, res) {
    let page1 = (req.params.page - 1) * 8;
    let page2 = page1 + 8;
    let sql = 'CALL getDashContentOut(' + page1 + ',' + page2 + ')';
    connection.query(sql, function (error, results) {
        if (error) {
            console.log(error);
            res.json({
                msg: "could not retrieve dashboard contents",
                err: error
            })
        }
        res.json(results);
        res.end();
    })
})
router.get("/promoted_videos", function (req, res) {
    connection.query('call getPromotedContent("video")', function (err, result) {
        if (err) {
            res.status(503);
            console.log(err.message);
            res.json("something went wrong while retrieving promoted videoss");
        }
        res.json(result);
        res.end();
    });
});
router.get("/promoted_images", function (req, res) {
    connection.query('call getPromotedContent("image")', function (err, result) {
        if (err) {
            res.status(503);
            res.json({
                message: "something went wrong while retrieving promoted images and gif",
            details: err.message});
        }
        res.json(result);
        res.end();
    });
});
router.get("/promoted_soundclips", function (req, res) {
    connection.query('call getPromotedContent("audio")', function (err, result) {
        if (err) {
            res.status(503);
            console.log(err);
            res.json("something went wrong while retrieving promoted musics");
        }
        res.json(result);
        res.end();
    });
});
router.get("/promoted_post", function (req, res) {
    connection.query('call getPromotedContent("post")', function (err, result) {
        if (err) {
            res.status(503);
            res.json("something went wrong while retrieving promoted post");
        }
        res.json(result);
        res.end();
    });
});
router.get("/comments/:content_id", function (req, res) {
  
    mongo.comment.getComments(req.params.content_id, res);
});
router.get("/replies/:comment_id", function (req, res) {
    let commentId = req.params.comment_id;
    mySeq.getReplies(commentId).then(function (results) {
        res.json(results);
        res.end();
    }, function (err) {
        res.json(err);
        res.end();
    })

});
router.get("/content/:contentId", function (req, res) {
    let content = req.params.contentId;
    let query = 'CALL getContent(?)';
    connection.query(query, content, function (err, result) {
        if (err) {
            res.status(500);
            res.json({
                "message": "An error occured in the DB",
                "error": err.message
            });
            res.end();
            console.log(err);
        }
        res.json(result);
        res.end();

    })

});
router.get("/competition", function (req, res) {
    let query = "CALL getCompetiton";
    connection.query(query, function (err, results) {
        if (err) {
            console.log(err.sqlMessage);
            res.status(503);
            res.json({
                err: err.message,
                message: "An error occured in the DB"
            });
            res.end();
            return;
        }
        res.json(results);
        res.end();
    })
});

function isExist(userSession) {
    if (session.users.length <= 0) {
        return false;
    }
    for (let i = 0; i < session.users.length; i++) {
        let mySession = session.users[i];
        if (mySession.session == userSession) {
            
            return true;
        }
        return false;
    }
}
module.exports = router;
