const { safeObjectId } = require("./sanitize");

/**
 * Creates bidirectional assignments between two collections.
 * Adds ObjectId references from each collection to the other using $addToSet.
 *
 * @param {Object} MongoWraper - MongoDB wrapper instance
 * @param {Object} body - Object with two collection keys, each containing an array of IDs
 * @param {string} db0 - Database for the first collection
 * @param {string} db1 - Database for the second collection
 */
const Assign = async (MongoWraper, body, db0, db1) => {
  const collection = Object.keys(body);

  await Promise.all([
    MongoWraper.UpdateMongoManyBy_idAddToSet(
      body[collection[0]],
      {
        [collection[1] + "_id"]: {
          $each: body[collection[1]].map((e) => safeObjectId(e)).filter(Boolean),
        },
      },
      collection[0],
      db0,
    ),
    MongoWraper.UpdateMongoManyBy_idAddToSet(
      body[collection[1]],
      {
        [collection[0] + "_id"]: {
          $each: body[collection[0]].map((e) => safeObjectId(e)).filter(Boolean),
        },
      },
      collection[1],
      db1,
    ),
  ]);
};

/**
 * Removes bidirectional assignments between two collections.
 * Pulls ObjectId references from each collection using $pull.
 *
 * @param {Object} MongoWraper - MongoDB wrapper instance
 * @param {Object} body - Object with two collection keys, each containing an array of IDs
 * @param {string} db0 - Database for the first collection
 * @param {string} db1 - Database for the second collection
 */
const UnAssign = async (MongoWraper, body, db0, db1) => {
  const collection = Object.keys(body);

  await Promise.all([
    MongoWraper.UpdateMongoManyBy_idPull(
      body[collection[0]],
      {
        [collection[1] + "_id"]: {
          $in: body[collection[1]].map((e) => safeObjectId(e)).filter(Boolean),
        },
      },
      collection[0],
      db0,
    ),
    MongoWraper.UpdateMongoManyBy_idPull(
      body[collection[1]],
      {
        [collection[0] + "_id"]: {
          $in: body[collection[0]].map((e) => safeObjectId(e)).filter(Boolean),
        },
      },
      collection[1],
      db1,
    ),
  ]);
};

/**
 * Removes a specific ID reference from all documents in a collection.
 *
 * @param {Object} MongoWraper - MongoDB wrapper instance
 * @param {string} collection - Target collection name
 * @param {string} field - Field prefix (appended with "_id")
 * @param {string} id - The ObjectId string to remove
 * @param {string} db - Database name
 */
const UnAssignIdToCollections = async (MongoWraper, collection, field, id, db) => {
  const oid = safeObjectId(id);
  if (oid === null) return;

  await MongoWraper.UpdateMongoManyPullIDToCollectionPull(
    { [field + "_id"]: oid },
    collection,
    db,
  );
};

module.exports = { Assign, UnAssign, UnAssignIdToCollections };
