/**
* Formats data that looks like this:
*
*
<http://www.radiohead.com:80/msgboard>; rel="original",
<http://localhost/web/timemap/link/radiohead.com/msgboard>; rel="self"; type="application/link-format"; from="Sat, 08 Apr 2000 21:34:30 GMT">,
<http://localhost>; rel="timegate",
<http://localhost/web/20000408213430/http://www.radiohead.com:80/msgboard>; rel="first memento"; datetime="Sat, 08 Apr 2000 21:34:30 GMT",
<http://localhost/web/20000420032543/http://www.radiohead.com:80/msgboard>; rel="memento"; datetime="Thu, 20 Apr 2000 03:25:43 GMT",
*
*
*/


const {
  WAYBACK_WEB_BASE_URL,
  METADATA_ORIGINAL,
  METADATA_TIMEGATE,
  METADATA_SELF,
  RESULT_MEMENTO,
} = require('./constants');

function formatWaybackTimeseries (timeseriesResult) {
  const formattedJson = _formatJSON(timeseriesResult);

  return JSON.stringify(formattedJson);
}

function _formatJSON (timeseriesResult) {
  const resultsList = timeseriesResult.split(',\n');
  let data = { results: [] };
  resultsList.forEach(function (result) {
    // don't attempt to parse if there's an empty string
    if (result) {
      const resultList = result.split('; ');
      const relListString = _handleRelString(resultList[1]);

      const isMetadata = _handleIsMetadata(relListString);
      const isResult = _handleIsResult(relListString);

      if (isMetadata) {
        const metadataJson = _formatMetadata(resultList, relListString);
        data = {
          ...data,
          ...metadataJson
        }  
      } else if (isResult) {
        const resultJson = _formatResult(resultList);
        // const resultJson = {};
        data.results.push(resultJson);
      }
    }
  });

  return data;
}

function _handleRelString (relString) {
  const relListString = relString.split('"');
  return relListString[1]
}

function _formatRelList (relString) {
  return relString.split(' ');
}

/**
* when looping through resultList, handles cases of metadata which do not represent a specific
* link to a wayback machine snapshopt
* current attributes pulled out as metadata are: rel="original" rel="timegate", rel="self"
*/
function _formatMetadata (metadataList, relListString) {
  const formatters = {
    [METADATA_ORIGINAL]: function (metadataList) {
      const url = _sanitizeUrl(metadataList[0]);

      return { url };
    },
    [METADATA_TIMEGATE]: function (metadataList) {
      return {};
    },
    [METADATA_SELF]: function (metadataList) {
      const url = _sanitizeUrl(metadataList[0]);
      const query = _transformBaseUrl(url, WAYBACK_WEB_BASE_URL);
      const from = _handleFromMetadata(metadataList[3]);

      return { query, from };
    },
  };
  const rel = _formatRelList(relListString)[0];

  return formatters[rel](metadataList);
}
// example: from="Sat, 08 Apr 2000 21:34:30 GMT">
// splitting on " here since that's the fastest way to get around the trailing >
function _handleFromMetadata (fromMetadata) {
  const fromMetadataList = fromMetadata.split('"');

  return fromMetadataList[1];
}

// example: datetime="Mon, 03 Oct 2016 08:17:53 GMT"
// splitting on " here since that's the fastest way to get around the trailing >
function _handleDatetimeResult (datetimeResult) {
  const datetimeResultList = datetimeResult.split('"');

  return datetimeResultList[1];
}

// boolean to determine whether this is metadata or a result
function _handleIsMetadata (relString) {
  const isMetadataRelTestArray = [METADATA_ORIGINAL, METADATA_TIMEGATE, METADATA_SELF];
  var isMetadataRelTestRexeg = new RegExp(isMetadataRelTestArray.join('|'));
  return isMetadataRelTestRexeg.test(relString);
}

/**
* when looping through resultList, handles cases of link results to wayback machine snapshots
* current attributes used to determine a link result: rel="memento"
*/
function _formatResult (resultList) {
  const urlSanitized = _sanitizeUrl(resultList[0]);
  const url = _transformBaseUrl(urlSanitized, WAYBACK_WEB_BASE_URL);
  const datetime = _handleDatetimeResult(resultList[2]);

  return { url, datetime };
}

function _handleIsResult (relString) {
  const isResultRelTestArray = [RESULT_MEMENTO];
  var isResultRelTestRexeg = new RegExp(isResultRelTestArray.join('|'));
  return isResultRelTestRexeg.test(relString);
}

function _sanitizeUrl (url) {
  // strip outer characters, which are always expected to be <>
  return url.slice(1, -1);
}

/**
* the base URL for the links to specific wayback snapshots don't have the WAYBACK_WEB_BASE_URL
* and instead have localhost, probably because I'm using a proxy from my localhost
* this function aims to replace that portion of the response data with WAYBACK_WEB_BASE_URL
* in a way which doesn't care about whether the string is from localhost, or a prox on another box
*/
function _transformBaseUrl (url, baseUrl) {
  const noProtocolUrl = url.split('//').slice(1).join('//');
  const noBaseUrlList = noProtocolUrl.split('/').slice(1);

  return `${baseUrl}${noBaseUrlList.join('/')}`;
}

module.exports = formatWaybackTimeseries;
