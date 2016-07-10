#!/usr/bin/env node
var express = require('express');
var path = require('path');

var app = express();
app.use(express.static(path.join(__dirname)));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/node_modules/jquery/dist', express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist')));
app.use('/dist', express.static(path.join(__dirname, 'public', 'dist')));
var port = 8088;
app.listen(port, function () {
  console.log('Site available at http://localhost:' + port);
});
