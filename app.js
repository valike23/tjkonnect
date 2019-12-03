'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var admin = require('./routes/admin');
var users = require('./routes/users');
const ticket = require('./routes/ticket');
var publicApi = require('./routes/public');
var session = require('./routes/session');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,token");
    if (req.method === "OPTIONS")
        res.send(200);
    next();
});



// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/private', users);
app.use('/api/public', publicApi);
app.use('/api/ticket', ticket);
app.use('/api/admin', admin);
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
})
app.post('/form', function (req, res) {
    console.log(req.body);
    res.json(req.body);
    res.end()
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


//setInterval(function () {
//   // console.log("code run!!!!!!!!!!");
//    var current = Number(Date.now());
//    deleteSession(current);
//    }
//, 60000);
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 163);
//delete session that elaspe 10 mins....(runs every 2 mins)
//function deleteSession(current) {
//    if (session.users.length > 0) {
//    //A session last for 5 mins    
//        for (var i = 0; i < session.users.length; i++) {
//            var user = session.users[i];
//            if (Number(user.expiration) <= current) {
//                console.log("delete" + JSON.stringify(user.session) + i);
//                session.users.splice(i);
//                deleteSession();
//                break;
//            }

//        }
//    }

//}

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
