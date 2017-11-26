// set up basic express http server
const {
  WAYBACK_BASE_URL,
  WAYBACK_WEB_BASE_URL,
} = require('./constants');
const formatWaybackTimeseries = require('./format-wayback-timeseries');
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

http.listen(PORT, () => {
    console.log('listening on *:' + PORT);
});
