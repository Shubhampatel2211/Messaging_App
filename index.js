const express = require('express')
const app = express()
const http = require('http').createServer(app)
const path = require('path');
const PORT = process.env.PORT || 7000
const routes = require('./routes/app');
var bodyParser = require('body-parser');
global.ResponseController = require('./controller/responsecontroller')
var userControllers = require('./controller/usercontroller')
global.db = require('./config/db');
global.db = db.connect(http);
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/', routes)

http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

app.use(bodyParser.urlencoded({
  extended: true,
  limit: '100mb'
}))
app.use(bodyParser.json({
  limit: '100mb'
}))

app.use(express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads'));

app.use(express.static(path.join(__dirname, 'profile')));
app.use('/profile', express.static('profile'));

const io = require('socket.io')(http)
io.on('connection', (socket) => {
  console.log('User Connection ' + socket.id);

  socket.on('connectUser', async (sender_id, receiver_id) => {
    console.log('user_connect sender_id-->', sender_id)
    let user_data = { sender_id: sender_id, receiver_id, socket_id: socket.id }
    let data = await userControllers.user_connected(user_data)
    console.log('user_connect data--->>', data)
  })

  socket.on('userlist', async (user_id) => {
    console.log('user_connect sender_id-->', user_id)
    let data = await userControllers.user_list(user_id)
    io.to(socket.id).emit("userlist", data);
  })

  socket.on('createRoom', async ({ room_id, sender_id, receiver_id, date, time }) => {
    var body = { room_id, sender_id, receiver_id, date, time }
    console.log("create room")
    socket.join(room_id);
    let data = await userControllers.create_room(body)
  });

  socket.on('checkRoom', async (data) => {
    var roomid = data.room_id
    let datas = await userControllers.check_room(roomid)
    io.emit('checkRoom', datas);
  });

  socket.on('joinRoom', async ({ room_id, sender_id, receiver_id }) => {
    socket.join(room_id);
  });

  socket.on('changeOnlineStatus', async ({ user_id, status }) => {
    console.log('changeOnlineStatus ============>>', status);
    let data = await userControllers.changeOnlineStatus(user_id, status);
    io.emit('checkOnlineStatus', data[0]);
  });

  socket.on('checkOnlineStatus', async ({ sender_id, receiver_id }) => {
    console.log('checkOnlineStatus ==>>', sender_id, receiver_id);
    let data = await userControllers.checkOnlineStatus(sender_id, receiver_id);
    io.emit('checkOnlineStatus', data);
  });

  socket.on('chatMessage', async (msgData) => {
    let data = await userControllers.socketChatMessage(msgData);
    io.to(msgData.room_id).emit("listChatMessages", data);
  });

  socket.on('listChatMessages', async ({ sender_id, receiver_id, room_id }) => {
   
    let data = await userControllers.listChatMessages(room_id);
    io.to(room_id).emit("listChatMessages", data);
  });

  socket.on('deleteChatMessages', async (message_id) => {
    let data = await userControllers.deleteChatMessages(message_id);
    io.emit('deleteChatMessages', data);
  });

  socket.on('readAllMessage', async ({ room_id }) => {
    let data = await userControllers.read_message(room_id);
    io.emit('readAllMessage', data);
  });

  socket.on('typing', ({ receiver_id, room_id, typingMsg }) =>{
    io.to(room_id).emit('typing', { typingMsg, receiver_id, room_id })
  });

  socket.on('stopTyping', ({ receiver_id, room_id, typingMsg }) => {
    io.to(room_id).emit('stopTyping', { receiver_id, room_id, typingMsg })
  });

  socket.on('disconnectUser', async (user_id) => {
    console.log("user disconnected id is ", user_id);
    let data = await userControllers.disconnectUser({ user_id });
    broadcastOnlineStatus(data.user_id, data.is_online);
  });

  socket.on("disconnect", (reason) => {
    console.log("\nA client disconnected, reason: %s", reason);
    console.log("Number of clients: %d", io.of('/').server.engine.clientsCount);
    console.log("user is disconnected from socket ")
  });

});

function broadcastOnlineStatus(userId, isOnline) {
  io.emit('onlineStatus', { userId, isOnline }); // Broadcast the online status of the user to all connected clients
}

app.use((err, req, res, next) => {
  const multer = require('multer')
  if (err instanceof multer.MulterError) {
      console.log('err ===>', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
          err.message = err.field + ' file size is too large.'
      }
      res.statusCode = 400;
      console.log(res.statusCode);
      err.status = 400;
  }
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
 
  res.json({  
      message: err.message,
      status: false,
      code: res.statusCode
  });
});

