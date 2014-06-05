var Canvas = require('canvas');
var fs = require('fs');
var git = require('nodegit');

var HEIGHT = 7; // height is always 7 (graph displays weeks)
var WIDTH = 52; // width is always 52 (goes back 1 year)
var SHADES = 5; // 5 shades (grey for 0 commits, 4 levels of green for >0 commits)

var README_PATH = 'README.md';

function createImage(text, opts) {
  opts = opts || {};
  opts.font = opts.font || '7pt serif-bold';
  opts.width = opts.width || WIDTH;
  opts.gamma = opts.gamma || 1.4;

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

function createRepo(image, opts, cb) {
  if(typeof opts === 'function') {
    cb = opts;
    opts = null;
  }
  opts = opts || {};
  opts.path = opts.path || './banner';
  opts.quantity = opts.quantity || 20;
  opts.author = opts.author || 'Gitbanner';
  opts.message = opts.message || 'Gitbanner commit';

  if(fs.existsSync(opts.path))
    return cb('A repo already exists at path "' + opts.path + '"');

  // create repo and a tree to commit to
  git.Repo.init(opts.path, false, function(err, repo) {
    if(err) return cb(err);
    repo.openIndex(function(err, index) {
      if(err) return cb(err);
      fs.writeFileSync(opts.path + '/' + README_PATH,
        'Generated with [Gitbanner](https://github.com/mappum/gitbanner).\r\n');
      index.addByPath(README_PATH, function(err) {
        if(err) return cb(err);
        index.writeTree(function(err, tree) {
          if(err) return cb(err);

          // set date to top left pixel
          var date = new Date;
          var dayOffset = 7 - date.getUTCDay();
          date.setUTCDate(date.getUTCDate() - (52 * 7) + dayOffset);

          var x = 0, y = 0;
          var lastCommit;

          function next(i) {
            var pixel = image[y][x];
            var nCommits = pixel * opts.quantity;

            if(i < nCommits) {
              var time = Math.floor(date.getTime() / 1000);
              var author = git.Signature.create(opts.author, opts.email, time, 0);
              var message = opts.message + ' - pixel:('+x+','+y+') - i:' + i; 
              var parent = [];
              if(lastCommit) parent[0] = lastCommit;

              repo.createCommit('HEAD', author, author, message, tree, parent, function(err, res) {
                if(err) return cb(err);

                repo.getCommit(res, function(err, commit) {
                  if(err) return cb(err);

                  lastCommit = commit;
                  setImmediate(next, i + 1);
                })
              });

            // incremement to next day/pixel
            } else {
              if(y == HEIGHT - 1) {
                x++;
                y = 0;

                if(x == image[0].length) return cb();
              } else {
                y++;
              }

              date.setUTCDate(date.getUTCDate() + 1);

              setImmediate(next, 0);
            }
          }
          next(0, 0, 0);
        });
      })
    });
  });
}

module.exports = {
  createImage: createImage,
  printImage: printImage,
  createRepo: createRepo
};
