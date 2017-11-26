// set up basic express http server
const formatWaybackTimestamps = require('./format-wayback-timestamps');
const express = require('express');
const cors = require('cors');
const through2 = require('through2');
const requestProxy = require('express-request-proxy');
const app = express();
const http = require('http').Server(app);

const PORT = '8000';
const WAYBACK_WEB_BASE_URL = 'http://web.archive.org/';
const WAYBACK_BASE_URL = 'http://archive.org/wayback/';

const CORS_OPTIONS = {
  origin: 'http://localhost:8080'
};
app.use(cors(CORS_OPTIONS));

app.get('/api/wayback/available', requestProxy({
  url: `${WAYBACK_BASE_URL}/available`,
}));


let waybackTimemapString = '';
const timemapTransform = {
  name: 'timemapTransform',
  transform: function () {
    return through2.obj(
      function (chunk, encoding, callback) {
        const chunkString = chunk.toString();
        waybackTimemapString += chunkString;
        callback();
      },
      function (callback) {
        const formattedResults = formatWaybackTimestamps(waybackTimemapString);
        this.push(formattedResults);
        stringy = null;
        callback();
      }
    )
  }
};

app.get('/api/wayback/web/timemap/link/:siteUrl', requestProxy({
  url: `${WAYBACK_WEB_BASE_URL}/web/timemap/link/:siteUrl`,
  transforms: [timemapTransform],
}));

http.listen(PORT, () => {
    console.log('listening on *:' + PORT);
});
