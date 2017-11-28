const WAYBACK_WEB_BASE_URL = 'https://web.archive.org/';
const WAYBACK_BASE_URL = 'http://archive.org/wayback/';
const METADATA_ORIGINAL = 'original';
const METADATA_TIMEGATE = 'timegate';
const METADATA_SELF = 'self';
const RESULT_MEMENTO = 'memento';
const HTML_FILE_CACHE_DIR = '/wayback-html-cache';
const JSON_FILE_CACHE_DIR = '/wayback-json-cache';

serverConstants = {
  WAYBACK_BASE_URL,
  WAYBACK_WEB_BASE_URL,
  METADATA_ORIGINAL,
  METADATA_TIMEGATE,
  METADATA_SELF,
  RESULT_MEMENTO,
  HTML_FILE_CACHE_DIR,
  JSON_FILE_CACHE_DIR,
};

module.exports = serverConstants;
