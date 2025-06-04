var express = require('express')
var path = require('path')
// var serveStatic = require('serve-static')

var app = express()

app.use('/assets', express.static(path.join(__dirname, '../assets')))
app.use('/dist', express.static(path.join(__dirname, '../dist')))

app.listen(3010)
