var express = require("express"),
    http = require("http");

var app = express();
var server = http.createServer(app);
var io = require("socket.io").listen(server);

io.configure(function () { 
    io.set("transports", ["xhr-polling"]); 
    io.set("polling duration", 10); 
});

var port = process.env.PORT || 8080;
server.listen(port);

app.get("/", function (req, res) {
    res.sendfile(__dirname + "/index.html");
});

io.sockets.on("connection", function (socket) {
    socket.emit("from server", { message: "Welcome to Jeff's Chat Room!" });
    sendAll({online: Object.keys(socket.manager.open).length});
    socket.on("from client", function (data) {
    console.log("received: ", data, " from ", socket.store.id);

    if (data.message)
        sendAll(data, socket.id);
    });
    
    socket.on("disconnect", function(reason) {
        sendAll({online: Object.keys(socket.manager.open).length});
    });
});

function sendAll(message, user) {
    for (var socket in io.sockets.sockets) {
        if (socket != user)
            io.sockets.sockets[socket].emit("from server", message);
    }
}


/*
var redis = require("redis");
var db = redis.createClient();

app.use(function(req, res, next){
  var ua = req.headers['user-agent'];
  db.zadd('online', Date.now(), ua, next);
});

app.use(function(req, res, next){
  var min = 6 * 1000;
  var ago = Date.now() - min;
  db.zrevrangebyscore('online', '+inf', ago, function(err, users){
    if (err) return next(err);
    req.online = users;
    next();
  });
});

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);


function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.send(500, { error: 'Something blew up!' });
  } else {
    next(err);
  }
}
function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
}

app.get("/nodejs", function(req, res) {
  res.send("howdy!");
  //res.send(req.online.length + ' users online');
});

console.log("app.js running on port 3000");
*/
