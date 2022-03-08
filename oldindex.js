const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

global.bodyParser = require('body-parser');

var multer = require('multer');
var globalVariable = []
// const { kStringMaxLength } = require('buffer');

app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb',
    parameterLimit: 100000
  }))
  app.use(bodyParser.json({
    limit: '50mb',
    parameterLimit: 100000
  }))
  
  
  app.post('/stored', (req, res) => {
      console.log(req.body);
      db.collection('quotes').insertOne(req.body, (err, data) => {
          if(err) return console.log(err);
          res.send(('saved to db: ' + data));
      })
  });
  
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images');
    },
    filename: (req, file, cb) => {
        console.log(file);
        var filetype = '';
        if (file.mimetype === 'image/gif') {
            filetype = 'gif';
        }
        if (file.mimetype === 'image/png') {
            filetype = 'png';
        }
        if (file.mimetype === 'image/jpeg') {
            filetype = 'jpg';
        }
        cb(null, 'image-' + Date.now() + '.' + filetype);
    }
});
var upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), function (req, res, next) {
    console.log(req.file);
    if (!req.file) {
        res.status(500);
        return next(err);
    }
    res.json({ fileUrl: 'http://192.168.1.45:3000/images/' + req.file.filename });
})

app.post('/upload-multiple', upload.array('file', 5), function (req, res, next) {

    let images = [];
    for (var i = 0; i < req.files.length; i++) {
        images.push({ fileUrl: 'http://192.168.1.45:3000/images/' + req.files[i].filename });
    }
    res.json(images);
})

// login

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/images/*', (req, res, path) => {
    var imagePath = req.url, url = 'http://192.168.1.45:3000/' + imagePath;
    res.sendFile(__dirname + '/public' + imagePath);
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('chat message',  function(msg, fn){
        fn(true);
        // var userData 
        // userData.push(msg.name)
        console.log(msg)
        const key = 'sendto_' + msg.receiver;
        io.emit(key, msg);
    });

        socket.on("save-client-data",  (clientData)=> {
            globalVariable.push({'name':clientData.user_name,'mobile':clientData.user_mobile})
            // globalVariable.push({'mobile':clientData.user_mobile})
            console.log(clientData,globalVariable)
           
        });
        // var clientData =  globalVariable[clientId];
        socket.emit("get-client-data", globalVariable);
        
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});