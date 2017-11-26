function formatWaybackTimestamps (timestampsResult) {
  const resultList = timestampsResult.split(',\n');
  return JSON.stringify(resultList);
}

module.exports = formatWaybackTimestamps;
