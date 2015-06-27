var express = require('express')
var morgan = require('morgan')
var fs = require('fs')
var bodyParser = require('body-parser')

var unclassifiedImages = {}
var classifiedImages = {}

fs.readdir(__dirname + '/images', function (err, files) {
  for (var f of files) {
    unclassifiedImages[f] = null
  }
})

var app = express()
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/static'))

function pickRandomProperty(obj) {
  var result;
  var count = 0;
  for (var prop in obj)
    if (Math.random() < 1/++count)
      result = prop;
  return result;
}

app.get('/new', function (req, res) {
  var imageID = pickRandomProperty(unclassifiedImages)
  if (imageID) {
    res.setHeader('X-Image-ID', imageID)
    res.sendFile(__dirname + '/images/' + imageID)
  } else {
    res.status(404).end()
  }
})

app.post('/classify', function (req, res) {
  var id = req.body.id
  var answer = req.body.answer === 'true'

  if (id in unclassifiedImages) {
    console.log('Classifying image ' + id + ' as ' + answer)
    delete unclassifiedImages[id]
    classifiedImages[id] = answer
  }

  res.end()
})

var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('Neuroswipe listening on ' + host + ':' + port)
})
