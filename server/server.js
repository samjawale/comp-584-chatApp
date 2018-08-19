const serverPort = process.env.PORT || 8081;

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const MongoClient = require('mongodb').MongoClient;
const dbURL = "mongodb://localhost:27017/";
const dbName = "ChatSamDB";
const dbCollectionUsers = "users";
const dbCollectionChatHistory = "chatHistory";

server.listen(serverPort, () => console.log('Application is listening on port: ' + serverPort + '!'));

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

// Sign-In function
app.post('/signIn', (req, res) => {
    var email = req.body.email;
    var pwd = req.body.pwd;

    console.log(email + ' ' + pwd);

    MongoClient.connect(dbURL, function(err, db) {
        if (err) {
            db.close();
            throw err;
        }
        var dbo = db.db(dbName);
        var myobj = { email: email, password: pwd };
        dbo.collection(dbCollectionUsers).findOne({email: email}, function(err, result) {
            if (err) {
                db.close();
                throw err;
            }
            if (result) {
                if (result.password == pwd) {
                    console.log('Record Found');
                    db.close();
                    res.send({
                        msg: "success"
                    })
                } 
                else {
                    db.close();
                    res.send({
                        msg: "invalid"
                    })
                }
            }
            else {
                console.log('No record found!');
                db.close();
                res.send({
                    msg: "no data"
                })
            }
        });
    });
})

// Sign-Up function
app.post('/signUp', (req, res) => {
    var email = req.body.email;
    var pwd = req.body.pwd;

    console.log(email + ' ' + pwd);

    MongoClient.connect(dbURL, function(err, db) {
        if (err) {
            db.close();
            throw err;
        }
        var dbo = db.db(dbName);
        dbo.collection(dbCollectionUsers).findOne({email: email}, function(err, result) {
            if (err) {
                db.close();
                throw err;
            }
            if (result) {
                console.log('Record Found');
                db.close();
                res.send({
                    msg: "found"
                })
            }
            else {
                console.log('No record found!');
                var myobj = { email: email, password: pwd };
                dbo.collection(dbCollectionUsers).insertOne(myobj, function(err, result) {
                    if (err) {
                        db.close();
                        throw err;
                    }
                    console.log("User inserted...");
                    db.close();
                    res.send({
                        msg: "success"
                    })
                });
            }
        });
    });    
})

// Message recieve and sending
io.on('connection', function (socket) {

    socket.on('fromClient', function (data) {
        var vToUser = data.To;
        var vFromUser = data.From;
        var vMsg = data.Message;
        var vDate = data.Date;
        console.log(vFromUser + ' -> ' + vToUser + ' [ ' + vMsg + ' | ' + vDate + ' ]');

        MongoClient.connect(dbURL, function(err, db) {
            if (err) {
                db.close();
                throw err;
            }
            var dbo = db.db(dbName);
            var myobj = { From: vFromUser, To: vToUser, Message: vMsg, Date: vDate };
            dbo.collection(dbCollectionChatHistory).insertOne(myobj, function(err, result) {
                if (err) {
                    db.close();
                    throw err;
                }
                if (result) {
                    console.log('Data inserted...');
                    db.close();
                    io.emit(vToUser, { userFrom: vFromUser, msg: vMsg, date: vDate });
                }
            });
        });
    });

    socket.on('disconnect', function () {
        console.log('User disconnected');
        io.emit('user disconnected');
    });

});

// Fetch all Users
app.post('/getUserList', (req, res) => {
    var vUserId = req.body.userId;
    console.log('Getting userlist...');

    MongoClient.connect(dbURL, function(err, db) {
        if (err) {
            db.close();
            throw err;
        }
        var dbo = db.db(dbName);
        var vWhere = { email: {$nin:[vUserId]} };
        var vSort = { email: 1 };
        var vSelect = { _id: 0, email: 1 }
        dbo.collection(dbCollectionUsers).find(vWhere).sort(vSort).project(vSelect).toArray(function(err, result) {
            if (err) {
                db.close();
                throw err;
            }
            console.log('Fetched users!');
            console.log(result);
            db.close();
            res.send({
                msg: "success",
                userList: result
            })
        });
    });    
})

// Fetch recent messages
app.post('/getLastMsgs', (req, res) => {
    var vUserId = req.body.userId;
    var vLimit = req.body.limit;

    console.log(vUserId + ' with ' + vLimit + ' messages');

    MongoClient.connect(dbURL, function(err, db) {
        if (err) {
            db.close();
            throw err;
        }
        var dbo = db.db(dbName);
        var vWhere = {
            $or:[
              {From: vUserId},
              {To: vUserId}
            ]
        };
        var vSort = {date: -1};
        dbo.collection(dbCollectionChatHistory).find(vWhere).sort(vSort).limit(vLimit).toArray(function(err, result) {
            if (err) {
                db.close();
                throw err;
            }
            console.log('Fetched Last msgs!');
            //console.log(result);
            db.close();
            res.send({
                msg: "success",
                history: result
            })
        });
    });    
})

// Fetch today messages
app.post('/getCurrentChat', (req, res) => {
    var vUserId = req.body.userId;
    var vUserFor = req.body.userFor;

    console.log(vUserId + ' with ' + vUserFor);

    MongoClient.connect(dbURL, function(err, db) {
        if (err) {
            db.close();
            throw err;
        }
        var dbo = db.db(dbName);
        
        var vDate = new Date();
        var vWhere = {
            $or:[
              {From: vUserId, To: vUserFor},
              {From: vUserFor, To: vUserId}
            ]
        };
        var vSort = {date: 1};
        dbo.collection(dbCollectionChatHistory).find(vWhere).sort(vSort).toArray(function(err, result) {
            if (err) {
                db.close();
                throw err;
            }
            console.log('Fetched today msgs!');
            //console.log(result);
            db.close();
            res.send({
                msg: "success",
                todayChat: result
            })
        });
    });    
})