const ObjectId = require("mongodb").ObjectId;

const { safeObjectId, escapeRegex } = require("./sanitize");

/**
 * Builds an ObjectId match query supporting single or array values.
 *
 * @param {Object} Query - { Property: string, Search: string|string[] }
 * @returns {Object} MongoDB query with $or
 */
// TODO: invalid ObjectIds silently return empty results instead of a 400 error — consider returning an error response
const GetGenericQueryId = (Query) => {
  if (Array.isArray(Query.Search)) {
    const QueriesArrProp = Query.Search
      .map((ArrSearch) => safeObjectId(ArrSearch))
      .filter((oid) => oid !== null)
      .map((oid) => ({ [Query.Property]: oid }));

    return { $or: QueriesArrProp.length > 0 ? QueriesArrProp : [{ _id: null }] };
  } else {
    const oid = safeObjectId(Query.Search);
    if (oid === null) return { $or: [{ _id: null }] };
    return { $or: [{ [Query.Property]: oid }] };
  }
};

/**
 * Builds a boolean match query supporting single or array values.
 *
 * @param {Object} Query - { Property: string, Search: string|string[] }
 * @returns {Object} MongoDB query with $or
 */
const GetGenericQueryBool = (Query) => {
  if (Array.isArray(Query.Search)) {
    const QueriesArrProp = Query.Search.map((ArrSearch) => {
      return { [Query.Property]: ArrSearch == "true" };
    });
    return { $or: QueriesArrProp };
  } else {
    return { $or: [{ [Query.Property]: Query.Search == "true" }] };
  }
};

/**
 * Builds an exact string match query supporting single or array values.
 *
 * @param {Object} Query - { Property: string, Search: string|string[] }
 * @returns {Object} MongoDB query with $or
 */
const GetGenericQueryString = (Query) => {
  if (Array.isArray(Query.Search)) {
    const QueriesArrProp = Query.Search.map((ArrSearch) => {
      return { [Query.Property]: ArrSearch };
    });
    return { $or: QueriesArrProp };
  } else {
    return { $or: [{ [Query.Property]: Query.Search }] };
  }
};

/**
 * Builds a comparison query ($gt, $gte, $lt, $lte) for numeric values.
 *
 * @param {Object} Query - { Property: string, Search: number|number[] }
 * @param {string} operator - MongoDB operator (e.g. "$gt", "$gte")
 * @returns {Object|Array} MongoDB comparison query
 */
const GetGenericComparisonQuery = (Query, operator) => {
  if (Array.isArray(Query.Search)) {
    return Query.Search.map((ArrSearch) => {
      return { [Query.Property]: { [operator]: ArrSearch } };
    });
  } else {
    return { [Query.Property]: { [operator]: Query.Search } };
  }
};

/**
 * Builds a comparison query ($gt, $gte, $lt, $lte) for date values.
 *
 * @param {Object} Query - { Property: string, Search: string|string[] }
 * @param {string} operator - MongoDB operator (e.g. "$gt", "$gte")
 * @returns {Object|Array} MongoDB date comparison query
 */
const GetDateComparisonQuery = (Query, operator) => {
  if (Array.isArray(Query.Search)) {
    return Query.Search.map((ArrSearch) => {
      return { [Query.Property]: { [operator]: new Date(ArrSearch) } };
    });
  } else {
    return { [Query.Property]: { [operator]: new Date(Query.Search) } };
  }
};

/**
 * Builds a not-equal ObjectId query supporting single or array values.
 *
 * @param {Object} Query - { Property: string, Search: string|string[] }
 * @returns {Object} MongoDB query with $ne and $and
 */
const GetGenericQueryNeid = (Query) => {
  if (Array.isArray(Query.Search)) {
    const QueriesArrProp = Query.Search
      .map((ArrSearch) => safeObjectId(ArrSearch))
      .filter((oid) => oid !== null)
      .map((oid) => ({ [Query.Property]: { $ne: oid } }));

    return { $and: QueriesArrProp.length > 0 ? QueriesArrProp : [{}] };
  } else {
    const oid = safeObjectId(Query.Search);
    if (oid === null) return {};
    return { [Query.Property]: { $ne: oid } };
  }
};

/**
 * Builds a not-equal string query supporting single or array values.
 *
 * @param {Object} Query - { Property: string, Search: string|string[] }
 * @returns {Object} MongoDB query with $ne and $and
 */
const GetGenericQueryNestring = (Query) => {
  if (Array.isArray(Query.Search)) {
    const QueriesArrProp = Query.Search.map((ArrSearch) => {
      return { [Query.Property]: { $ne: ArrSearch } };
    });
    return { $and: QueriesArrProp };
  } else {
    return { [Query.Property]: { $ne: Query.Search } };
  }
};

/**
 * Builds a partial/regex match query. Each word in the search string
 * becomes a separate regex condition joined with $and.
 *
 * @param {Object} Query - { Property: string, Search: string }
 * @returns {Object} MongoDB query with $and of $regex conditions
 */
const GetGenericQueryPartial = (Query) => {
  const fullAndArray = Query.Search.split(" ").map((word) => {
    return { [Query.Property]: { $regex: escapeRegex(word), $options: "si" } };
  });

  return { $and: fullAndArray };
};

/**
 * Builds text search filters from request query params.
 * Each param value is split by spaces and each word becomes a regex filter.
 *
 * @param {Object} req - Express request object
 * @returns {Array} Array of filter arrays
 */
const CreateAndArr = (req) => {
  const NonTextFields = ["page", "limit", "initialDate", "finalDate"];

  const andArr = Object.keys(req.query)
    .filter((prop) => !NonTextFields.includes(prop))
    .map((prop) =>
      req.query[prop].split(" ").map((word) => {
        return { [prop]: { $regex: escapeRegex(word), $options: "si" } };
      }),
    );

  return andArr;
};

/**
 * Creates an ObjectId from a timestamp for date-range filtering via _id.
 *
 * @param {string|Date} timestamp - Date string or Date object
 * @returns {ObjectId} ObjectId with embedded timestamp
 */
const objectIdWithTimestamp = (timestamp) => {
  if (typeof timestamp == "string") {
    timestamp = new Date(timestamp);
  }

  var hexSeconds = Math.floor(timestamp / 1000).toString(16);
  return ObjectId(hexSeconds + "0000000000000000");
};

module.exports = {
  GetGenericQueryId,
  GetGenericQueryBool,
  GetGenericQueryString,
  GetGenericComparisonQuery,
  GetDateComparisonQuery,
  GetGenericQueryNeid,
  GetGenericQueryNestring,
  GetGenericQueryPartial,
  CreateAndArr,
  objectIdWithTimestamp,
};
