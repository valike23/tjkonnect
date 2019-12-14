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
const mongo = require("./mongo");
const payment = require("./functions/payments");
var multer = require('multer');
const notification = require("./notification");
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs = require('fs');
var filename;
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/competition');
    },
    filename: function (req, file, cb) {
        filename = "banner" + "-" + Date.now();
        cb(null, filename);
    }
});
var storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/profile');
    },
    filename: function (req, file, cb) {
        filename = "profile" + "-" + Date.now();
        cb(null, filename);
    }
})

/* GET users listing. */


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
        req.isAdmin = true;
        next();
    }
    else {
        req.isAdmin = false;
        next();
    }
})
router.get('/', function (req, res) {
    mongo.comment.getComments(10, res);
});
router.put("/update", function (req, res) {

   
    let temp = Object.keys(req.body)[0];
    let edit = {};
    edit.holder = temp;
    edit.value = req.body[temp]
    var authen = req.authen;
    console.log(edit);

    let query = "update users set `" + edit.holder + "`= '" + edit.value + "' where id =" + authen.user.id;
    connection.query(query, function (err, results) {
        if (err) {
            res.status(501);
            res.json({
                err: "error updating try again later",
                track: err,
                data: edit
            });
            res.end();
            return;
        }
        for (var key in authen.user) {
            if (key == edit.holder) {
                authen[key] = edit.value;
                console.log(authen);
                console.log(auth.update(authen));
                break;
            }
        }
        res.json("update successful");
        res.end();
    })
})

router.post('/save_payment_info', function (req, res) {
    let sql =''
})
router.get("/competitions/:status", function (req, res) {
    if (req.isAdmin == false) {
        res.status(401);
        res.end();
        return;
    }
    let status = req.params.status;
    let sql = 'select * from competition where isvalid =' + status;
    connection.query(sql, function (err, results) {
        if (err) {
            console.log(err);
            res.status(503);
            res.json(err.message);
            res.end();
            return;
        }
        res.json(results);
        res.end();

    })

});
router.post("/validate_competition", function (req, res) {
    if (req.isAdmin == false) {
        res.status(401);
        res.end();
        return;
    }
    let status = req.body.status;
    let reason = req.body.reason;
    let organizer = req.body.organizer;
    let comptId = req.body.comptId;
    let sql = "update competition set isValid =" + status + ",reason ='" + reason + "'  where competitionId ='" + comptId + "'";
    connection.query(sql, function (err, results) {
        if (err) {
            console.log(err);
            res.status(503);
            res.json(err.message);
            res.end();
            return;
        }

        let message = "";
        if (status == 1) {
            message = "Your Competition with ID " + comptId + " has been activated";
        }
        else {
            message = "Your Competition with ID " + comptId + " has been rejected because, " + reason;
        }
        let note = new models.notification(message, organizer);
        let sql = 'insert into notifications set ?';
        connection.query(sql, note, function (err, results) {
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
});

router.get('/getsubcontent/:page', function (req, res, next) {
    var authen = req.authen;
    let id = authen.user.id;
    let page = req.params.page;
    page = (page -1)* 5;
    let sql = 'CALL getSubContent(' + id + ',' + page + ')';
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
//router.post("/uploadpicsMobile", function (req, res) {
//    var authen = req.authen;
//    let image = req.body.image;
//    let sql = "update users set profilePics ='" + image + "'  where id = " + authen.user.id;
//    connection.query(sql, function (err, results) {
//        if (err) {
//            res.status(503);
//            res.json(err);
//            res.end();
//            return;
//        }
//        console.log(results);
//        res.json(results);
//        res.end();

//    })
//})
router.post("/uploadpics", multipartMiddleware, function (req, res) {
    var thumbFile = req.files.file.path;
    var authen = req.authen;
    console.log('auten', authen);
    var base = '/images/profile/profile.jpg';
    if (authen.user.publicId == null) {
        cloudinary.uploader.upload(thumbFile,
            function (error, thumbnail) {
                console.log(thumbnail);
                let sql = 'update users set profilePics ="' + thumbnail.secure_url + '", publicId="' + thumbnail.public_id + '" where id =' + authen.user.id;
                connection.query(sql, function (err, results) {
                    if (err) {
                        res.status(503);
                        res.json(err);
                        res.end();
                        return;
                    }
                    console.log(results);
                    res.json(results);
                    res.end();
                })
            });
    }
    else {
        cloudinary.uploader.destroy(authen.user.publicId, function (result) {
            console.log(result);
            cloudinary.uploader.upload(thumbFile,
                function (error, thumbnail) {
                    console.log(thumbnail);


                    let sql = 'update set profilePics ="' + thumbnail.secure_url + '", publicId="' + thumbnail.public_id + '" where id =' + authen.user.id;
                    connection.query(sql, function (err, results) {
                        if (err) {
                            res.status(503);
                            res.json(err);
                            res.end();
                            return;
                        }
                        console.log(results);
                        res.json(results);
                        res.end();
                    })
                });

        });
    }
    
       
    

    //if (!(authen.user.profilePics == base)) {
    //    console.log("lmk");
    //    let mybase = './public' + authen.user.profilePics;
    //    try {
    //        if (fs.existssync(mybase)) {
    //            try {
    //                fs.unlinksync(mybase)
    //                //file removed
    //            } catch (err) {
    //                console.error(err);
    //                res.status(502);
    //                res.json("delete failed, try again later");
    //                res.end();
    //            }
    //        }
    //    } catch (err) {
    //        console.error(err)
    //    }

    //}
    //var upload = multer({ storage: storage2 }).single('file');
    //upload(req, res, function (err) {
    //    if (err) {
    //        console.log(err)
    //        return res.end("Error uploading file.");
    //    }

    //    let address = '/images/profile/' + filename;
    //    authen.user.profilePics = address;
    //    let query = "update users set profilePics = '" + address + "' where id = " + authen.user.id;
    //    connection.query(query, function (err, results) {
    //        if (err) {
    //            console.log(err);
    //            res.end();
    //        }
    //        let test = auth.update(authen);
    //        if (test) {
    //            res.json(authen);
    //            res.end();
    //        }
    //        else {
    //            res.status(401);
    //            res.end();
    //        }

    //    });

    //});



});
router.get("/user_content/:page", function (req, res) {
    let id = req.authen.user.id;
    let page1 = (req.params.page - 1) * 8;

    let sql = 'CALL getUserContents(' + id +',' + page1 + ')';
    connection.query(sql, function (error, results) {
        if (error) {
            console.log(error);
            res.json({
                msg: "could not retrieve user's contents",
                err: error
            })
            res.end();
            return;
        }
        res.json(results);
        res.end();
    })
})
router.post('/upload/video', multipartMiddleware, function (req, res) {
    let name = req.body.name;
    let duration = req.body.duration;
    var contentFile = req.files.content.path;
    var thumbFile = req.files.thumb.path;
    let authen = req.authen;
    let hashTag = req.body.hashTag;
    
    cloudinary.uploader.upload(contentFile, {
        resource_type: "video",
        chunk_size: 6000000
    },
        function (error, content) {
            if (error) {
                console.log(error);
                res.json({
                    msg: "sorry an error occured while uploading the file",
                    err: error
                })
            }
            console.log(content);
            if (thumbFile) {
                cloudinary.uploader.upload(thumbFile,
                    function (error, thumbnail) {
                        if (error) {
                            console.log(error);
                            res.json({
                                msg: "sorry an error occured while uploading the file",
                                err: error
                            })
                        }
                        console.log(thumbnail);
                        let contentDetail = new models.content(name, content.url, thumbnail.secure_url, content.resource_type, authen.user.id, content.secure_url, duration, hashTag, thumbFile.public_id, thumbnail.public_id);
                        let sql = 'insert into contents set ?';
                        connection.query(sql, contentDetail, function (err, results) {
                            if (err) {
                                res.status(503);
                                res.json(err);
                                res.end();
                                return;
                            }
                            console.log(results);
                            notification.addContentNotification("video", results.insertId, authen.user.id, authen.user.username, name, res);
                            res.json("upload successful");
                            res.end();
                        })
                    });
            }
            else {
                let contentDetail = new models.content(name, content.url, null, content.resource_type, authen.user.id, content.secure_url, duration, hashTag, thumbFile.public_id, null);
                let sql = 'insert into contents set ?';
                connection.query(sql, contentDetail, function (err, results) {
                    if (err) {
                        res.status(503);
                        res.json(err);
                        res.end();
                        return;
                    }
                    console.log(results);
                    notification.addContentNotification("video", results.insertId, authen.user.id, authen.user.username, name, res);
                    res.json("upload successful");
                    res.end();
                })


            }
             


        });
});
router.post('/upload/audio', multipartMiddleware, function (req, res) {
    let name = req.body.name;
    let duration = req.body.duration;
    var contentFile = req.files.content.path;
    let hashTag = req.body.hashTag;
    let authen = req.authen;

    cloudinary.uploader.upload(contentFile, {
        resource_type: "raw",
        chunk_size: 6000000
    },
        function (error, content) {
            if (error) {
                console.log(error);
                res.json({
                    msg: "sorry an error occured while uploading the audio",
                    err: error
                })
            }
            console.log(content);
          
            let sql = 'insert into contents set ?';
           // let contentDetail = new models.content(name, content.url, "audio", authen.user.id, content.secure_url, duration);
            let contentDetail = new models.content(name, content.url, null, "audio", authen.user.id, content.secure_url, duration,hashTag,content.public_id,null);
            connection.query(sql, contentDetail, function (err, results) {
                if (err) {
                    res.status(503);
                    res.json(err);
                    res.end();
                    return;
                }
                console.log(results);
                notification.addContentNotification("audio", results.insertId, authen.user.id, authen.user.username, name, res);
                res.json("upload successful");
                res.end();
               
            })


        });
});
router.post('/upload/post', multipartMiddleware, function (req, res) {
    let authen = req.authen;
    let id = authen.user.id;
    let body = req.body;
    let hashTag = req.body.hashTag;
    var thumbFile = req.files.thumb.path;
    if (thumbFile) {
        cloudinary.uploader.upload(thumbFile,
            function (error, thumbnail) {
                if (error) {
                    console.log(error);
                    res.status(503);
                    res.json({
                        "message": "An error occured",
                        "devMsg": error
                    });
                    return;
                }
                console.log(thumbnail);
                let content = new models.content(body.title, body.content, thumbnail.secure_url, 'post', id, null, null, hashTag, thumbnail.public_id,null);
                let sql = 'insert into contents set ?';
                connection.query(sql, content, function (err, results) {
                    if (err) {
                        res.status(503);
                        res.json({
                            "message": "An error occured",
                            "devMsg": err.message
                        });
                        console.log(err);
                        res.end();
                        return;
                    }
                    console.log(results);
                    notification.addContentNotification("post", results.insertId, authen.user.id, authen.user.username, body.title, res);
                    res.json("upload successful");
                    res.end();
                })

            })
    }
    else {
        let sql = 'insert into contents set ?';
        let content = new models.content(body.title, body.content, null, 'post', id, null, null,null,null, null);

        connection.query(sql, content, function (err, results) {
            if (err) {
                res.status(503);
                res.json({
                    "message": "An error occured",
                    "devMsg": err.message
                });
                console.log(err);
                res.end();
                return;
            }
            console.log(results);
            notification.addContentNotification("post", results.insertId, authen.user.id, authen.user.username, body.title, res);
            res.json("upload successful");
            res.end();
        })


    }

    
    })

// require three items the liker's id(this is retrieved from the session)
//the content id should come from the user. and if its a like or disliked 1 or 0 respectively
//{contentId : 1, userId : int , mliked: 0 //disliked}
router.post('/likes', function (req, res) {
    let likes = req.body;
    let authen = req.authen;
    let status = '';
    //likes = JSON.parse(likes);
    console.log(authen.user.id);
    var sql = 'CALL likeOrDislikeContent(' + authen.user.id + ' ,' + likes.contentId + ',' + likes.mliked + ')';
    connection.query(sql, function (err, results) {
        if (err) {
            res.status(503);
            res.json(err.message);
            res.end();
            return;
        }
        res.json(results);
        res.end();
    })
});

router.get('/likes', function (req, res) {
    let authen = req.authen;
    let id = authen.user.id;
    let sql = '';
    connection.query()
})
router.post('/subscription', function (req, res) {
    let authen = req.authen;
    var sub = new models.subscription(authen.user.id, req.body.subscribee, req.body.notification);
    var sql = "CALL addSubscription(" + sub.subscriber + "," + sub.subscribee + "," + sub.notification + ")";
    connection.query(sql, function (err, results) {
        if (err) {
            res.status(503);
            res.json(err.message);
            res.end();
            return;
        }
        res.json(results);
        res.end();
    })
});
router.get('/issubscribed/:sub', function (req, res) {
    let user = req.authen.user;
    let sql = "CALL isSubscribed(" + user.id + "," + req.params.sub + ")";
    connection.query(sql, function (err, results) {
        if (err) {
            console.log(err);
            res.status(503);
            res.json(err.message);
            res.end();
            return;
        }
        res.json(results);
        res.end();

    })

})
router.get('/remove_subscription/:sub', function (req, res) {
    let user = req.authen.user;
    let sql = "CALL removeSubscription(" + user.id + "," + req.params.sub + ")";
    connection.query(sql, function (err, results) {
        if (err) {
            console.log(err);
            res.status(503);
            res.json(err.message);
            res.end();
            return;
        }
        res.json(results);
        res.end();

    })

})
router.get('/togglenotification/:sub', function (req, res) {
    let user = req.authen.user;
    let sql = "CALL toggleNote(" + user.id + "," + req.params.sub + ")";
    connection.query(sql, function (err, results) {
        if (err) {
            console.log(err);
            res.status(503);
            res.json(err.message);
            res.end();
            return;
        }
        res.json(results);
        res.end();

    })
})
// this sections are for promotions
// *****
// This request is called when a user request a promotion.
router.post('/promotion', function (req, res) {
    let id = req.authen.user.id;
    let info = req.body;
   let response = payment.storePayment(info.ref, id, info.category,info.cost);
    var promotion = new models.promoted(req.body.content, id, null, req.body.ref,
      Math.floor(req.body.cost/req.body.budget), req.body.cost,null,req.body.budget);
    //var sql = "CALL requestPromotion(" + promotion.content_id + "," + promotion.promoter_id + "," + promotion.duration + "," + promotion.payment + "," + promotion.cost + ")";
    let sql = "INSERT INTO promotions SET ?"
    connection.query(sql,promotion, function (err, results) {
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
//*** for admin to accept a promotion
router.put('/promotion', function (req, res) {
    let authen = req.authen;
    if (authen.user.type != 'admin') {
        res.status(401);
        res.json("Authorization Failed");
        res.end();
        return;
    }
    let sql = 'update promotions set promotee =?, duration = ? , promotedDate = ? where id=?';
    let data = [authen.user.id, req.body.duration, new Date(),req.body.id]
    connection.query(sql,data, function (err, results) {
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
// retrieve promotions ... all promoted contents and all unconfirmed promotions
router.get('/promotion/:access', function (req, res) {
    var access = JSON.parse(req.params.access);
    var sql = (access) ?  "select * from promotions": "select * from promotions where promotee = null";
    connection.query(sql, function (err, results) {
        if (err) {
            res.status(503);
            res.json(err.message);
            res.end();
            return;
        }
        res.json(results);
        res.end();
    })

});
//comment API2 (private)
router.post("/comments", function (req, res) {
    let myComment = req.body;
    let user = req.authen.user;
    let comment = new models.comment();
    comment.comment = myComment.comment;
    comment.replies = [];
    comment.contentId = myComment.content;
    comment.profilePics = user.profilePics;
    comment.username = user.username;
    mongo.comment.addComment(comment, res);
    

});
router.post("/reply", function (req, res) {
    let myComment = req.body;
    let user = req.authen.user;
    let reply = new models.reply(user.username, myComment.comment,myComment.replying, user.profilePics)
    mongo.comment.addReply(reply, myComment.commentId, res);
});
router.delete("/comment/:id", function (req, res) {

});
router.get('/upgrade', function (req, res) {
    let authen = req.authen;
    let id = authen.user.id;
    let sql = "UPDATE `users` SET `type`='organization' WHERE id = ?";
    connection.query(sql, id, function (err, results) {
        if (err) {
            res.json(err);
            res.end();
            return;
        }
        res.json({
            'details': results,
        'message': 'your account has been updated'});
        res.end();
    }
        )
})
router.post('/change_user', function (req, res) {

})
router.post('/createCompetition', multipartMiddleware, function (req, res) {
    let authen = req.authen;
    var thumbFile = req.files.file.path;

    if (authen.user.type != 'organization') {
        res.status(401);
        res.json("access failed");
        res.end();
        return;
    }
    cloudinary.uploader.upload(thumbFile,
        function (error, thumbnail) {
            console.log(thumbnail);
            let band, band_cost;
            let user_cost = req.user_cost;
            if (req.body.band == 0) {
                band = 0; band_cost = 0;
            } else {
                band = 1; band_cost = req.body.band_cost;
            }

            let competition = new models.competition(req.body.name, authen.user.id, req.body.start, req.body.end, thumbnail.secure_url, band, band_cost, user_cost, req.body.hash);
            let sql = 'insert into competition set ?';
            connection.query(sql, competition, function (err, results) {
                if (err) {
                    res.status(503);
                    res.json(err);
                    res.end();
                    return;
                }
                console.log(results);
                res.json(results);
                res.end();
            })
        });
        
   
       
});
router.get('/subscriptions', function (req, res) {
    let id = req.authen.user.id;
    let query = "CALL getSubscriptions(?)";
    connection.query(query, id, function (err, results) {
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

});
router.get('/iliked/:id', function (req, res) {
    let content = req.params.id;
    let id = req.authen.user.id;
    let sql = 'SELECT likes_dislikes.liked  FROM `likes_dislikes` WHERE likes_dislikes.contentId =' + content + ' and likes_dislikes.userId =' + id;
    connection.query(sql, function (error, results) {
        if (error) {
            console.log(error);
            res.json({
                msg: "could not likes now!",
                err: error
            })
            res.end();
            return;
        }
        console.log(results);
        res.json(results);
        res.end();
    })
})

router.post('/saved', function (req, res) {
    let id = req.authen.user.id;
    let content = req.body.id;
    let data = {
        contentId: content,
        userId: id
    }
    let sql = 'insert into saved set ?';
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
    })
})
router.get('/saved/:page', function (req, res) {
    let id = req.authen.user.id;
    let page = (req.params.page - 1) * 8;
    let query = "CALL getSaved(" + id +"," + page + ")";
    connection.query(query, function (err, results) {
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
router.get("/issaved/:id", function (req, res) {
    let user = req.authen.user.id;
    let content = req.params.id;
    let query = "SELECT 1 as saved FROM `saved` WHERE contentId =" + content +" and userId =" + user;
    connection.query(query,  function (err, results) {
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
//notification endpoints
router.get("/all_notification", function (req, res) {
    let id = req.authen.user.id;
    notification.retrieveAllNotifications(id, res);
    return;

});

router.get("/read_notification/:note", function (req, res) {
    let notification_id = req.params.note;
    let id = req.authen.user.id;
    notification.readNotification(notification_id, id, res);
    return;
})
router.get("/retrieve_notification/:status", function (req, res) {
    let status = req.params.status;
    let id = req.authen.user.id;
    notification.retrieveNotification(id,status,res);
    return;
})



module.exports = router;
