module.exports.search = (query, find) => {
  let queryKeyword = query.keyword;
  if (queryKeyword) {
    find.title = new RegExp(queryKeyword, "i");
  }
  return queryKeyword;
};