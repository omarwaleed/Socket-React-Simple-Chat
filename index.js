let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

app.use(express.static('public'));
app.use(express.static('src'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
    io.emit('user connection', 'user connected');
    console.log(Object.keys(io.sockets.sockets));
    // io.sockets.sockets[socket.id].emit('users', Object.keys(io.sockets.sockets));
    io.emit('users', Object.keys(io.sockets.sockets))
    socket.on('connection', function(){
        socket.emit('users', Object.keys(io.socket.sockets));
    })
    socket.on('disconnect', function(){
        console.log('a user disconnected');
        io.emit('user connection', 'user disconnected');
        io.emit('users', Object.keys(io.sockets.sockets));
        console.log(Object.keys(io.sockets.sockets));
    });
    socket.on('chat message', function(msg){
        console.log('id of sender is '+socket.id);
        console.log(Object.keys(io.sockets.sockets));
        if(msg.to !== undefined){
            socket.to(msg.to).emit('chat message', msg);
        } else {
            socket.broadcast.emit('chat message', msg);
        }
        console.log('msg: ', msg);
    });
    socket.on('typing', function(content){
        socket.broadcast.emit('typing', content);
        console.log('typing',content);
    })
})

http.listen(3000, ()=>{
    console.log('listening on', 3000);
})
