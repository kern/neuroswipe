var AWS = require('aws-sdk')
var Firebase = require('firebase')
var bodyParser = require('body-parser')
var express = require('express')
var fs = require('fs')
var morgan = require('morgan')
var request = require('request')

var db = new Firebase('https://neuroswipe.firebaseio.com/')
var unclassifiedImages = {}
var classifiedImages = {}

var s3 = new AWS.S3({
  "accessKeyId": "AKIAI2WCPTSIGTT75ZQQ",
  "secretAccessKey": "XAHPH66VVuZsdVrQotIj8A/TgIfYyJESAYMDYSrT"
})

s3.listObjects({ Bucket: 'neuroswipe' }, function (err, data) {
  for (var f of data.Contents) {
    var id = f.Key.replace(/\.[^.$]+$/, '')
    unclassifiedImages[id] = null
  }

  db.child('classified').on('value', function(snapshot) {
    classifiedImages = snapshot.val()
    for (var id in classifiedImages) {
      if (id in unclassifiedImages) {
        delete unclassifiedImages[id]
      }
    }
  })
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
    request
      .get('http://neuroswipe.s3-us-west-2.amazonaws.com/' + imageID + '.jpg')
      .pipe(res)
  } else {
    res.status(404).end()
  }
})

app.post('/classify', function (req, res) {
  var id = req.body.id
  var answer = req.body.answer === 'true'

  if (id in unclassifiedImages) {
    delete unclassifiedImages[id]
    console.log('Classifying image ' + id + ' as ' + answer)
    db.child('classified/' + id).set(answer)
  }

  res.end()
})

var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('Neuroswipe listening on ' + host + ':' + port)
})
