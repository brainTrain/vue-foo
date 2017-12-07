const cheerio = require('cheerio');

/**
* function to parse response body and determine whether
* it's a redirect page or not by scraping/parsing the html
* returns 
*/
function parseWaybackRedirect (htmlString) {
  const $ = cheerio.load(htmlString);
  const redirectUrl = $('.impatient a').attr('href');

  return redirectUrl;
}

function parseRHBMTopics (htmlString, filepath) {
  const $ = cheerio.load(htmlString);
  const $topics = $('li');
  const datetime = parseWaybackDateTime(htmlString);
  const filename = _parseFileName(filepath);

  const data = {
    datetime,
    filename,
    filepath,
    // map of topics keyed by username
    userTopicMap: {},
  };
  const { userTopicMap } = data;

  $topics.each(function (_index, _element) {
    const $this = $(this);
    // cleanup nested lists to make selectors for username and topic simpler
    $('li ul', $this).remove();
    // lolz wow, a/b selectors
    const $topic = $('a', $this);
    const $username = $('b', $this);
    const topic = $topic.text();
    const username = $username.text();

    if (userTopicMap[username]) {
      userTopicMap[username].push(topic);
    } else {
      userTopicMap[username] = [topic];
    }
  });

  return data;
}


// scrape datetime from the wayback htmle
function parseWaybackDateTime (htmlString) {
  const $ = cheerio.load(htmlString);
  const $displayYearEl = $('#displayYearEl');
  const displayYearElTitle = $displayYearEl.attr('title');

  return displayYearElTitle ? displayYearElTitle.split(': ')[1] : '';
}

function _parseFileName (filepath) {
  const filepathList = filepath.split('/');

  return filepathList.slice(-1).pop();
}

module.exports = {
  parseWaybackDateTime,
  parseWaybackRedirect,
  parseRHBMTopics,
};
