#!/usr/bin/env node

var Canvas = require('canvas');

var HEIGHT = 7; // height is always 7 (graph displays weeks)
var WIDTH = 52; // width is always 52 (goes back 1 year)
var SHADES = 5; // 5 shades (grey for 0 commits, 4 levels of green for >0 commits)

function createImage(text, opts) {
  opts = {};
  opts.font = opts.font || '7pt serif';
  opts.width = opts.width || WIDTH;
  opts.gamma = opts.gamma || 1.2;

  var canvas = new Canvas(opts.width, HEIGHT),
      ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000';
  ctx.font = opts.font;
  ctx.fillText(text, 0, 7);
  var pixels = ctx.getImageData(0, 0, opts.width, HEIGHT).data;

  var image = [];
  for(var i = 0; i < HEIGHT; i++) image.push([]);

  for(i = 3; i < pixels.length; i += 4) {
    var x = Math.floor(i / 4) % opts.width,
        y = Math.floor(Math.floor(i / 4) / opts.width);

    var value = Math.pow(pixels[i] / 255, 1 / opts.gamma);
    if(pixels[i] < 120) value = 0;

    image[y][x] = Math.round(value * (SHADES - 1));
  }

  return image;
}

function printImage(image) {
  var width = Math.min(image[0].length, process.stdout.columns);
  var levels = [' ', '\u2591', '\u2592', '\u2593', '\u2588'];

  for(var i = 0; i < HEIGHT; i++) {
    var s = '';
    for(var j = 0; j < width; j++)
      s += levels[image[i][j]];
    console.log(s);
  }

  if(width < image[0].length)
    console.log('Banner is wider than console, output is cut off');
}

printImage(createImage('Hello world'))