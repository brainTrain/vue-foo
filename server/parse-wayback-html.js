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

function parseRHBM (htmlString, filepath) {
  const $ = cheerio.load(htmlString);
  const $topics = $('li');
  const data = {
    datetime: '',
    filepath,
    // map of topics keyed by username
    userTopicMap: {},
  };
  const { userTopicMap } = data;

  $topics.each(function (_index, _element) {
    // cleanup nested lists to make selectors for username and topic simpler
    $('li ul', this).remove();
    // lolz wow, a/b selectors
    const $topic = $('a', $(this));
    const $username = $('b', $(this));
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

module.exports = {
  parseWaybackRedirect,
  parseRHBM,
};
