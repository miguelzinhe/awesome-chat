const express = require('express')
const path = require('path')

const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

// Routes
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'public'))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

app.get('/', (req, res) => {
  res.render('index')
})

let messages = []
let users = []
let connections = []

// Chat configs
io.on('connection', socket => {
  connections.push(socket)
  console.log('%s connected', connections.length)

  socket.on('addNewUser', data => {
    socket.broadcast.emit('userJoined', data)
    users.push(data.username)
    socket.emit('numUsers', messages)
  })

  socket.emit('previousMessages', messages)

  // add messages
  socket.on('sendMessages', data => {
    messages.push(data)
    socket.broadcast.emit('receivedMessage', data)
  })

  socket.on('disconnect', data => {
    console.log(`disconnected: ${socket.id}`)
    users.splice(users.indexOf(data.username), 1)
    connections.splice(connections.indexOf(socket), 1)
    console.log('%s connected', connections.length)
  })
})

http.listen(3000, () => {
  console.log('listening on http://localhost:3000')
})