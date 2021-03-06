var express = require('express');
var nunjucks = require('nunjucks');
var url = require('url');
var path = require('path');
var exec = require('child_process').exec;
var phantomjs = require('phantomjs-prebuilt');

var app = express();

var baseURL = 'http://localhost:3000';
if (process.env.ENV === 'production') {
    baseURL = 'https://get-diagram.herokuapp.com';
}

app.use(express.static('public'));

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.get('/:type', function (req, res) {
    var type = req.params.type;
    var url = req.url;
    var query = url.substr(url.indexOf('?')+1);
    var cmd = phantomjs.path + ' rasterize.js \'' + baseURL + '/render/' + type + '?' + query + '\' ';

    // TODO: Cache in a way that will work on Heroku
    exec(cmd, function (err, stdout, stderr) {
        var img = new Buffer(stdout, 'base64');
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': img.length
        });
        res.end(img);
    });
});

app.get('/render/:type', function (req, res) {
    var type = req.params.type;
    var url = req.url;
    var query = url.substr(url.indexOf('?')+1);

    res.render(type + '.njk', { query: query });
});

app.listen(process.env.PORT || 3000);
