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

function parseRHBM (htmlString) {
  const $ = cheerio.load(htmlString);
  console.log(htmlString)
}


module.exports = {
  parseWaybackRedirect,
  parseRHBM,
};
