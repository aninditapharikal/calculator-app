const firebase = require("firebase");
const cors = require('cors');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

const config = firebase.initializeApp({
  apiKey: "AIzaSyCYiO3qgwY0SRdmt6yBh2LN2O9mfun0SQI",
  authDomain: "calculator-web-app-6202a.firebaseapp.com",
  databaseURL: "https://calculator-web-app-6202a-default-rtdb.firebaseio.com",
});

const db = config.database();
const ref = db.ref('data');

const port = process.env.PORT || 4000;
const server = app.listen(port);
require("dotenv").config();

app.use(cors());
app.use(bodyParser.json())

//app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
//WebSocket
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});
io.on('connection', socket => {
  socket.on('new data published', function (msg) {
    io.emit('render', msg);
  });
})

//To fetch data from firebase
app.get('/api/data', (req, res) => {
  var arrayResult = []
  const query = ref.orderByChild("timeStamp").limitToFirst(10)
  query.once("value")
    .then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        arrayResult.push(childSnapshot.val().value);
      });
      res.json(arrayResult)
    });
})

//To save data in Firebase
app.post(`/api/data`, (req, res) => {
  const recordTime = req.body['time']
  const recordVal = req.body['value']

  db.ref('/data').push({
    "timeStamp": recordTime,
    "value": recordVal
  })
  res.status(200)
  res.send("Success!")
})

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
  // Handle React routing, return all requests to React app
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}


//console.log(`Server istening on ${port}`);