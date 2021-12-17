// set up basic express http server
const {
  WAYBACK_BASE_URL,
  WAYBACK_WEB_BASE_URL,
  HTML_FILE_CACHE_DIR,
  JSON_FILE_CACHE_DIR,
} = require("./constants");

const fs = require("fs");
const request = require("request");
const crypto = require("crypto");
const formatWaybackTimeseries = require("./format-wayback-timeseries");
const {
  parseWaybackRedirect,
  parseRHBMTopics,
} = require("./parse-wayback-html");
const express = require("express");
const cors = require("cors");
const through2 = require("through2");
const requestProxy = require("express-request-proxy");
const app = express();
const http = require("http").Server(app);

const PORT = "8000";

const CORS_OPTIONS = {
  origin: "http://localhost:8080",
};
app.use(cors(CORS_OPTIONS));

app.get(
  "/api/wayback/available",
  requestProxy({
    url: `${WAYBACK_BASE_URL}/available`,
  })
);

let waybackTimeseriesString = "";
const waybackTimeseriesTransform = {
  name: "waybackTimeseriesTransform",
  transform: function() {
    return through2.obj(
      function(chunk, encoding, callback) {
        const chunkString = chunk.toString();
        waybackTimeseriesString += chunkString;
        callback();
      },
      function(callback) {
        const formattedResults = formatWaybackTimeseries(
          waybackTimeseriesString
        );
        const { results } = JSON.parse(formattedResults);
        console.log("results", results);
        this.push(formattedResults);
        // clear tmp value after we've pushed the formatted results
        waybackTimeseriesString = "";
        // TODO: figure out best place to set server cache, lazy load on user load? Hmmm 🤔
        handleGetResults(results);
        callback();
      }
    );
  },
};

app.get(
  "/api/wayback/web/timemap/link/:siteUrl",
  requestProxy({
    url: `${WAYBACK_WEB_BASE_URL}/web/timemap/link/:siteUrl`,
    transforms: [waybackTimeseriesTransform],
  })
);

app.get("/download-url/:url", function(req, res) {
  const { params: { url } } = req;
  const { filepath, isFileSaved } = formatHTMLFilePath(url);

  // only write a file if it doesn't exist
  if (!isFileSaved) {
    getWaybackPage(url, filepath);
  }

  res.send(`ohhhhh: ${url}`);
});

// NOTE: I don't remember where this is consumed so I'm doin it in the html file fetch/write handler and created doAJSONWrite lul
app.get("/parse-url/:url", function(req, res) {
  const { params: { url } } = req;
  const { filepath, isFileSaved } = formatHTMLFilePath(url);

  // only write a file if it doesn't exist
  if (!isFileSaved) {
    getWaybackPage(url, filepath, function(htmlString) {
      writeJSONFile(htmlString, url);
    });
  } else {
    readHTMLFile(filepath, function(htmlString) {
      writeJSONFile(htmlString, url);
    });
  }

  res.send(`ohhhhh: ${url}`);
});

function doAJSONWrite(url) {
  const { filepath, isFileSaved } = formatHTMLFilePath(url);
  // only write a file if it doesn't exist
  if (!isFileSaved) {
    getWaybackPage(url, filepath, function(htmlString) {
      writeJSONFile(htmlString, url);
    });
  } else {
    readHTMLFile(filepath, function(htmlString) {
      writeJSONFile(htmlString, url);
    });
  }
}

app.get("/topic-json", function(req, res) {
  const jsonz = getAllTehJSONz();
  console.log("uhhhhhhhhhhhhhhh", jsonz);
  let jsonArray = [];
  let topicsByName = {};
  jsonz.forEach(function(filename, index) {
    const filepath = `${__dirname}${JSON_FILE_CACHE_DIR}/${filename}`;
    console.log("filepath", filepath);
    fs.readFile(filepath, "utf-8", function(error, jsonString) {
      // const jsonObject = JSON.parse(jsonString);
      try {
        const jsonObject = JSON.parse(jsonString);
        const { userTopicMap } = jsonObject;
        Object.keys(userTopicMap).forEach(function(name) {
          topicsByName[name]
            ? (topicsByName[name] = [
                ...topicsByName[name],
                ...userTopicMap[name],
              ])
            : (topicsByName[name] = userTopicMap[name]);
        });
      } catch (error) {
        console.log("error", error);
      }

      jsonArray.push(jsonString);

      if (index === jsonz.length - 1) {
        res.send({
          topicsByName,
        });
      }
    });
  });
});

app.get("/topic-json", function(req, res) {});

function getAllTehJSONz() {
  const JSON_SOURCES = fs.readdirSync(`${__dirname}${JSON_FILE_CACHE_DIR}`);
  return JSON_SOURCES;
}

function writeJSONFile(htmlString, url) {
  const { filepath } = formatJSONFilePath(url);
  const RHMBTopics = parseRHBMTopics(htmlString, filepath);
  writeFile(filepath, JSON.stringify(RHMBTopics));
}

function readHTMLFile(filepath, callback = function() {}) {
  fs.readFile(filepath, "utf-8", function(error, htmlString) {
    callback(htmlString);
  });
}

function handleGetResults(results) {
  let stepsSkipped = 0;
  results.forEach(function(result, index) {
    const { url } = result;
    const filename = formatFilename(url, "html");
    const filepath = formatFilePath(filename, HTML_FILE_CACHE_DIR);
    const fileExists = fs.existsSync(filepath);
    // console.log("fileExists", fileExists);
    doAJSONWrite(url);
    // if the file exists, fetch based on timeoutStep variable
    if (!fileExists) {
      // fetch/save every n seconds
      const timeoutStep = 1500;
      // if steps are skipped, remove the total from current index to maintain even steps
      const step = index - stepsSkipped;
      const timeoutValue = index ? step * timeoutStep : timeoutStep;
      const time = process.hrtime();

      setTimeout(function() {
        handleHtmlFileSave(url);
        // log time delta
        console.log("time delta:", process.hrtime(time));
      }, timeoutValue);
    } else {
      // keep track of how many steps have been skipped
      // so we can keep our steps even, despite gaps
      stepsSkipped++;
    }
  });
}

function handleHtmlFileSave(url) {
  const { filepath, isFileSaved } = formatHTMLFilePath(url);

  // only write a file if it doesn't exist
  if (!isFileSaved) {
    getWaybackPage(url, filepath);
  }
}

function formatJSONFilePath(url) {
  const filename = formatFilename(url, "json");
  const filepath = formatFilePath(filename, JSON_FILE_CACHE_DIR);
  const isFileSaved = fs.existsSync(filepath);

  return { filepath, isFileSaved };
}

function formatHTMLFilePath(url) {
  const filename = formatFilename(url, "html");
  const filepath = formatFilePath(filename, HTML_FILE_CACHE_DIR);
  const isFileSaved = fs.existsSync(filepath);

  return { filepath, isFileSaved };
}

function formatFilename(url, extension = "txt") {
  // hashing url for smaller/friendlier (for software) filenames
  const urlHash = crypto
    .createHash("md5")
    .update(url)
    .digest("hex");

  return `${urlHash}.${extension}`;
}

function formatFilePath(filename, directory) {
  const fileDir = `${__dirname}${directory}`;

  return `${fileDir}/${filename}`;
}

function getWaybackPage(url, filepath, callback = function() {}) {
  request(url, function(error, response, body) {
    if (error) {
      return console.log(error);
    }

    const redirectUrl = parseWaybackRedirect(body);

    if (redirectUrl) {
      getWaybackPage(redirectUrl, filepath, callback);
    } else {
      writeFile(filepath, body, callback);
    }
  });
}

function writeFile(filepath, body, callback = function() {}) {
  fs.writeFile(filepath, body, function(error) {
    // callback(body);

    if (error) {
      console.log(`tried to write to: ${filepath}`);
      console.log(error);
    }
  });
}

http.listen(PORT, function() {
  console.log(`listening on *: ${PORT}`);
});
