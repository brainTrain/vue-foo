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
const { parseWaybackRedirect, parseRHBM } = require('./parse-wayback-html');
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
        console.log(typeof(formattedResults))
        const { results } = JSON.parse(formattedResults);
        this.push(formattedResults);
        // clear tmp value after we've pushed the formatted results
        waybackTimeseriesString = '';
        // TODO: figure out best place to set server cache, lazy load on user load? Hmmm 🤔
        // handleGetResults(results);
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
  const { filepath, isFileSaved } = handleFilePath(url);

  // only write a file if it doesn't exist
  if (!isFileSaved) {
    getWaybackPage(url, filepath);
  }

  res.send(`ohhhhh: ${url}`);
});

app.get('/parse-url/:url', function (req, res) {
  const { params: { url } } = req;
  const { filepath, isFileSaved } = handleFilePath(url);

  // only write a file if it doesn't exist
  if (!isFileSaved) {
    getWaybackPage(url, filepath, parseRHBM);
  } else {
    readHTMLFile(filepath, parseRHBM);
  }

  res.send(`ohhhhh: ${url}`);
});

function readHTMLFile (filepath, callback = function () {}) {
  fs.readFile(filepath, 'utf-8', function (error, data) {
    callback(data, filepath);
  });
}

function handleGetResults (results) {
  let stepsSkipped = 0;
  results.forEach(function (result, index) {
    const { url } = result;
    const filename = formatFilename(url);
    const filepath = formatFilePath(filename);
    const fileExists = fs.existsSync(filepath);
    
    // if the file exists, fetch based on timeoutStep variable
    if (!fileExists) {
      // fetch/save every n seconds
      const timeoutStep = 1500;
      // if steps are skipped, remove the total from current index to maintain even steps
      const step = index - stepsSkipped;
      const timeoutValue = index ? step * timeoutStep : timeoutStep;
      const time = process.hrtime();

      setTimeout(function () {
        console.log('\n\nfetchin, savin for :',  url);
        console.log('stepsSkipped', stepsSkipped);
        console.log('step', step);
        console.log('total files', step + stepsSkipped);
        handleHtmlFileSave(url);
        // log time delta
        console.log('time delta:', process.hrtime(time));
      }, timeoutValue);
    } else {
      console.log(`


        SKIIIPPPP


      `);
      // keep track of how many steps have been skipped
      // so we can keep our steps even, despite gaps
      stepsSkipped ++; 
      console.log('stepsSkipped', stepsSkipped)
    }
  });
}

function handleHtmlFileSave (url) {
  const { filepath, isFileSaved } = handleFilePath(url);

  // only write a file if it doesn't exist
  if (!isFileSaved) {
    getWaybackPage(url, filepath);
  }
}

function handleFilePath (url) {
  const filename = formatFilename(url);
  const filepath = formatFilePath(filename);
  const isFileSaved = fs.existsSync(filepath);

  return { filepath, isFileSaved, }
}

function formatFilename (url) {
  // hashing url for smaller/friendlier (for software) filenames
  const urlHash = crypto.createHash('md5').update(url).digest('hex');
  return `${urlHash}.html`;
}

function formatFilePath (filename) {
  const fileDir = `${__dirname}${HTML_FILE_CACHE_DIR}`;
  return `${fileDir}/${filename}`;
}

function getWaybackPage (url, filepath, onFileWritten = function () {}) {
  request(url, function (error, response, body) {
    if (error) {
     return console.log(error)
    }

    const redirectUrl = parseWaybackRedirect(body);

    if (redirectUrl) {
      console.log('redirectUrl', redirectUrl)
      getWaybackPage(redirectUrl, filepath);
    } else {
      writeHtmlFile(filepath, body, onFileWritten);
    }
  });
}

function writeHtmlFile (filepath, body, callback = function () {}) {
  fs.writeFile(filepath, body, function(error) {
    if (error) {
      console.log(`tried to write to: ${filepath}`);
      console.log(error);
      callback(body, filepath);
    }
  }); 
}

http.listen(PORT, () => {
    console.log(`listening on *: ${PORT}`);
});
