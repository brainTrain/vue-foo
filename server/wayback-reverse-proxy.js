// set up basic express http server
const {
  WAYBACK_BASE_URL,
  WAYBACK_WEB_BASE_URL,
  HTML_FILE_CACHE_DIR,
} = require('./constants');

const fs = require('fs');
const request = require('request');
const crypto = require('crypto');
const formatWaybackTimeseries = require('./format-wayback-timeseries');
const { getWaybackRedirect } = require('./parse-wayback-html');
const express = require('express');
const cors = require('cors');
const through2 = require('through2');
const requestProxy = require('express-request-proxy');
const app = express();
const http = require('http').Server(app);

const PORT = '8000';

const CORS_OPTIONS = {
  origin: 'http://localhost:8080'
};
app.use(cors(CORS_OPTIONS));

app.get('/api/wayback/available', requestProxy({
  url: `${WAYBACK_BASE_URL}/available`,
}));

let waybackTimeseriesString = '';
const waybackTimeseriesTransform = {
  name: 'waybackTimeseriesTransform',
  transform: function () {
    return through2.obj(
      function (chunk, encoding, callback) {
        const chunkString = chunk.toString();
        waybackTimeseriesString += chunkString;
        callback();
      },
      function (callback) {
        const formattedResults = formatWaybackTimeseries(waybackTimeseriesString);
        this.push(formattedResults);
        // clear tmp value after we've pushed the formatted results
        waybackTimeseriesString = '';
        callback();
      }
    )
  }
};

app.get('/api/wayback/web/timemap/link/:siteUrl', requestProxy({
  url: `${WAYBACK_WEB_BASE_URL}/web/timemap/link/:siteUrl`,
  transforms: [waybackTimeseriesTransform],
}));

app.get('/download-url/:url', function (req, res) {
  const { params: { url } } = req;
  handleHtmlFileSave(url);
  res.send(`ohhhhh: ${url}`);
});

function handleHtmlFileSave (url) {
  // hashing url for smaller/friendlier (for software) filenames
  const urlHash = crypto.createHash('md5').update(url).digest('hex');
  const filename = `${urlHash}.html`;
  getWaybackPage(url, filename);
}

function getWaybackPage (url, filename) {
  request(url, function (error, response, body) {
    const { statusCode } = response;
    const redirectUrl = getWaybackRedirect(body);

    if (redirectUrl) {
      console.log('redirectUrl', redirectUrl)
      getWaybackPage(redirectUrl, filename);
    } else {
      writeHtmlFile(filename, body);
    }
  });
}

function writeHtmlFile (filename, body) {
  const filepath = `${__dirname}${HTML_FILE_CACHE_DIR}`;
  console.log('filepath', filepath)
  console.log('filename', filename)
  fs.writeFile(`${filepath}/${filename}`, body, function(error) {
    if (error) {
      console.log(`tried to write to: ${filepath}`);
      console.log(`tried to save: ${filename}`);
      console.log(error);
    }
  }); 
}

http.listen(PORT, () => {
    console.log('listening on *:' + PORT);
});
