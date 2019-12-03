const uri = require("./config").mongo.uri;
const MongoClient = require('mongodb').MongoClient;
const url = uri;

MongoClient.connect(url, function (err, db) {
  
    if (err) {console.log( err) };
    console.log("Database created!");
    db.close();
});

let mongo = {
    comment: {
        addComment: function ( comment, res) {
            MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                var dbo = db.db("tjconnect");
                var myobj = comment;
                dbo.collection("comments").insertOne(myobj, function (err, resp) {
                    if (err) throw err;
                    console.log("1 document inserted");
                    db.close();
                    res.json("comment added");
                    res.end();
                });
            });
        },
        addReply: function (comment, id, res) {
            MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                var dbo = db.db("tjconnect");
                
                dbo.collection("comments").updateOne({ "id":  id },
                    {
                        "$push": {
                            "replies": comment
                        }
                    }, function (err, resp) {
                        if (err) {
                            res.json(err);
                            res.end();
                            return;
                        }
                        res.json(resp);
                        res.end();
                        return;
                    })
                
            });
        },
        getComments: function (id, res) {
            MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                var dbo = db.db("tjconnect");
                try {
                    id = Number(id);
                } catch (e) {
                    console.log("conversion failed")
                }
                console.log(id);
                dbo.collection("comments").find({ contentId : id}, { projection: { _id: 0 } }).toArray(function (err, result) {
                    if (err) throw err;
                    res.json(result);
                    res.end();
                    db.close();
                });
            })
        }
    }
}


module.exports = mongo;