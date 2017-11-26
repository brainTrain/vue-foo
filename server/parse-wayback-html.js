const cheerio = require('cheerio');

// function to parse response body and determine whether
// it's a redirect page or not by scraping/parsing the html
// returns 
function getWaybackRedirect (htmlString) {
  const $ = cheerio.load(htmlString);
  const redirectUrl = $('.impatient a').attr('href');
  return redirectUrl;
  console.log('redirectElements', redirectElements)
  // console.log('htmlString', htmlString)
}


module.exports = {
  getWaybackRedirect,
};
