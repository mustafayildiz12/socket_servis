const app = require('http').createServer();
const io = require('socket.io')(app);
const mongoose = require('mongoose');

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

  socket.on('setUsername', (username) => {
    // Kullanıcı takma adını kaydeder
    user[socket.id] = username;
    console.log(`${socket.id} kullanıcısı ${username} olarak ayarlandı`);
  });

  socket.on('joinRoom', (room) => {
    // Kullanıcıyı belirtilen odaya katılmaya zorlar
    socket.join(room);



    Message.find().then(result => {
      socket.emit('messages', result)
    })

    console.log(`${socket.id} kullanıcısı ${room} odasına katıldı`);
  });

  socket.on('chatMessage', (data) => {
    const message = new Message({
      username: data.username,
      room: data.room,
      text: data.text,
    });
    message.save().then(() => {
      io.to(data.room).emit('chatMessage', {
        username: data.username,
        message: data.text,
      });
    });
    console.log('Data: ', data);
  });

  socket.on('disconnect', () => {
    console.log(`Bağlantı kesildi: ${socket.id}`);
    // Kullanıcının takma adını siler
    delete user[socket.id];
  });
  // Sohbet mesajlarını dinler ve MongoDB veritabanına kaydeder

});

// Sunucuyu 3000 portunda dinlemeye başlar
app.listen(3000, () => {
  console.log('Sunucu çalışıyor: http://localhost:3000');
});
