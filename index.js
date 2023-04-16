
const requestListener = function (req, res) {
  res.writeHead(200);
  res.end("Hello World from Node.js HTTP Server");
}
const app = require('http').createServer(requestListener);
const io = require('socket.io')(app);
const mongoose = require('mongoose');
const Room = require('./Models/rooms');
const Message = require('./Models/message');



var db = mongoose.connect('mongodb+srv://mustafayildiz12:MlKTrFwB5ToVwtLv@cluster0.f4vmug6.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB bağlantısı başarılı.');
}).catch((err) => {
  console.error('MongoDB bağlantısı başarısız:', err);
});


// Socket.IO dinleyicilerini ayarlar
io.on('connection', (socket) => {
  console.log(`Bağlantı kuruldu: ${socket.id}`);

  // Kullanıcının takma adını saklamak için kullanılan nesne
  let user = {};
  socket.emit('getId', socket.id);
  socket.on('setUsername', (username) => {
    // Kullanıcı takma adını kaydeder
    user[socket.id] = username;
    console.log(`${socket.id} kullanıcısı ${username} olarak ayarlandı`);
  });
  socket.on('getRooms', (_) => {
    Room.find().then(result => {
      socket.emit('rooms', result)
    })

  });
  socket.on('callMessages', async (roomNumber) => {
    socket.emit('loadMessages');
    loadMessages = await getMessages(roomNumber)
    socket.emit('messages', loadMessages)
  })
  socket.on('createRoom', (data) => {

    const room = Room({
      room: data
    });
    room.save().then(() => {
      Room.find().then(result => {
        socket.emit('rooms', result)
      })

    });
    console.log('Data: ', data);

  });

  socket.on('joinRoom', async (room) => {
    // Kullanıcıyı belirtilen odaya katılmaya zorlar
    socket.join(room);
    socket.emit('loadMessages');
    loadMessages = await getMessages(room)
    socket.emit('messages', loadMessages)


    console.log(`${socket.id} kullanıcısı ${room} odasına katıldı`);
  });

  //listen messages
  socket.on('chatMessage', (data) => {
    const message = new Message({
      username: data.username,
      room: data.room,
      text: data.text,
      id: socket.id
    });
    message.save().then(() => {
      Message.find({ "room": data.room }).then(result => {
        socket.emit('messages', result)

      })

    });
    console.log('Data: ', data);
  });

  // start process
  socket.on('startProcessing', (time) => {
    socket.emit('processing')
    // 5 second wait
    setTimeout(function () {
      socket.emit('processDone')
    }, time);

  });
  socket.on("status", (data) => {
    console.log(data)
  })

  socket.on("status", (data) => {
    console.log(data)
  })

  socket.on('disconnect', () => {
    console.log(`Bağlantı kesildi: ${socket.id}`);
    // Kullanıcının takma adını siler
    delete user[socket.id];
  });

  async function getMessages(roomdata) {
    return Message.find({ "room": roomdata })
  }

});

// Sunucuyu 3000 portunda dinlemeye başlar
app.listen(process.env.PORT || 3000, () => {
  console.log('Sunucu çalışıyor: http://localhost:3000');
});

// app.listen(port, host, () => {
//   console.log(`Server is running on http://${host}:${port}`);
// });

