
/* eslint-disable camelcase, no-console */

import createType from 'mongoose-schema-to-graphql';
import mongoose from 'mongoose';

import { ReviewSchema, UserSchema, LocationSchema, GeoSchema } from './schemas';

const graphql = require('graphql');
require('dotenv').config();

const mongo_url = process.env.MONGO_URL;

const review_config = {
  name: 'reviewType',
  description: 'Review schema',
  class: 'GraphQLObjectType',
  schema: ReviewSchema,
};

const user_config = {
  name: 'userType',
  description: 'User schema',
  class: 'GraphQLObjectType',
  schema: UserSchema,
  extend: { //extend adds additional fields to the type
    review_contents: { //so review_contents can  also accept arguments
      type: graphql.GraphQLList(graphql.GraphQLString),
      args: {
        latest: {
          name: "Latest",
          description: "Number of reviews to return, sorted by most recently posted.",
          type: graphql.GraphQLInt,
        }
      },
      async resolve (_, { latest }, source, fieldASTs) {
        let review_ids = [];
        let review_contents = [];
        for (let item in _._doc.review_ids) {
          item = _._doc.review_ids[item];
          item = parseInt(item);
          if (!isNaN(item)) {
            review_ids.push(item);
          }
        }
        await REVIEW.find(
          {
            "id":
            {
              $in: review_ids
            }
          }, 'text id posted', //projections can just be strings
        )
        .then((docs) => {
          let reviews = [];
          for (let doc in docs) {
            reviews.push(docs[doc]);
          }

          reviews.sort((a,b) => {
            return Date.parse(reviews[b].posted) - Date.parse(reviews[a].posted);
          });

          if (latest !== undefined) {
            for (let i = 0; i < latest; i++) {
              if (reviews[i] !== undefined) {
                review_contents.push(`${reviews[i].id}: ${reviews[i].text}`);
              }
            }
          }
          else {
            for (let doc in docs) {
              review_contents.push(`${docs[doc].id}: ${docs[doc].text}`);
            }
          }
        });

        return review_contents; //needs to be an array of strings
      },
    },
  },
};

const location_config = {
  name: 'locationType',
  description: 'Location schema',
  class: 'GraphQLObjectType',
  schema: LocationSchema,
};

const geo_config = {
  name: 'geoType',
  description: 'geo-location schema',
  class: 'GraphQLInputObjectType', // Note the Input, very important
  schema: GeoSchema,
};

/*
Basically the GraphQL types determine how the data is sent
and received, and then the Mongoose models determine how the data
interacts with the database.
*/
const reviewType = createType(review_config);
const userType = createType(user_config);
const locationType = createType(location_config);
const geoType = createType(geo_config);

const USER = mongoose.model('users', UserSchema);
const LOCATION = mongoose.model('locations', LocationSchema);
const REVIEW = mongoose.model('reviews', ReviewSchema);

/**
 * generate projection object for mongoose
 * @param  {Object} fieldASTs
 * @return {Project}
 */

/*
The fieldASTS are used by mongoose to determine which parts of the model need
to be sent, and are provided by the client in the request (names, ids, etc.)
*/
function getProjection(fieldASTs) {
  return fieldASTs.fieldNodes[0].selectionSet.selections.reduce((projections, selection) => {
    projections[selection.name.value] = true;
    return projections;
  }, {});
}

const queryUserField = {
  type: userType,
  args: {
    auth_id: { // switched to auth_id, a unique string coming back from Auth0 service
      name: 'auth_id',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString), // now a string, not Int
    },
  },
  async resolve(_, { auth_id }, source, fieldASTs) {
    let found_user;
    let dont_return_ids = false;
    const projections = getProjection(fieldASTs);

    if (projections.review_contents) {
      if (!(projections.review_ids)) {
        dont_return_ids = true;
        projections.review_ids = true;
      }
    }

    const finder = async function (string) {
      try {
        await mongoose.connect(mongo_url, {
          useMongoClient: true,
        });
        await USER.findOne({
          auth_id: string,
        }, projections)
          .then((result) => { // This might not be necessary in mongoose, but if we need to change
            found_user = result;// the data it is helpful
          });
      } catch (err) { // also, I don't really understand try/catch haha
        console.log(err);
      }
    };

    await finder(auth_id); // send auth_id in, instead of previous 'id'

    return found_user;
  },
};

const queryLocationField = {
  type: locationType,
  args: {
    id: {
      name: 'id',
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
    },
  },
  async resolve(_, { id }, source, fieldASTs) {
    let found_location;
    const projections = getProjection(fieldASTs);
    const finder = async function (id) {
      try {
        await mongoose.connect(mongo_url, {
          useMongoClient: true,
        });
        await LOCATION.findOne({
          id,
        }, projections)
          .then((result) => {
            found_location = result;
          });
      } catch (err) {
        console.log(err);
      }
    };
    await finder(id)
      .then(() => {
        if (found_location.geo) {
          found_location.geo = JSON.stringify(found_location.geo);
        }
      });
    return found_location;
  },
};

const queryReviewField = {
  type: reviewType,
  args: {
    id: {
      name: 'id',
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
    },
  },
  async resolve(_, { id }, source, fieldASTs) {
    let found_review;
    const projections = getProjection(fieldASTs);
    const finder = async function (id) {
      try {
        await mongoose.connect(mongo_url, {
          useMongoClient: true,
        });
        await REVIEW.findOne({
          id,
        }, projections)
          .then((result) => {
            found_review = result;
          });
      } catch (err) {
        console.log(err);
      }
    };
    await finder(id);
    return found_review;
  },
};


/*
This variable is used in the schema, which as far as I can tell
only needs query and mutation, but there's a lot more to it I'm sure.
*/
const query = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: {
    user: queryUserField,
    location: queryLocationField,
    review: queryReviewField,
    /*
    so for now we can query using user, location, and review
    like so:
    {
      user (id: 1) {
        any/every property of the 'user' schema
      }
    }

    And now it's time for some mutation fields
    */
  },
});

const addUserField = {
  type: userType,
  args: {
    auth_id: {
      name: 'auth_id',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
    username: {
      name: 'user name',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
    avatar: {
      name: 'avatar url',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
  },
  async resolve(_, { auth_id, username, avatar }) {
    await mongoose.connect(mongo_url, {
      useMongoClient: true,
    });
    const new_user = new USER({
      auth_id,
      username,
      avatar,
      review_ids: [],
      registered: Date(),
    });
    return new_user.save((err) => {
      if (err) {
        return console.log('Unable to add new reviewer ', err);
      }
    });
  },
};

const addLocationField = {
  type: locationType,
  args: {
    id: {
      name: 'id',
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
    },
    name: {
      name: 'location name',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
    avatar: {
      name: 'avatar url',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
    geo: {
      name: 'Geo coordinates',
      type: new graphql.GraphQLNonNull(geoType), // note the custom input type
    },
  },
  async resolve(_, {
    id, name, avatar, geo,
  }) {
    await mongoose.connect(mongo_url, {
      useMongoClient: true,
    });
    const new_location = new LOCATION({
      id,
      name,
      avatar,
      geo: JSON.stringify(geo),
      reviews: [],
    });
    return new_location.save((err, doc) => {
      if (err) {
        return console.log('Unable to add new location', err);
      }
    });
  },
};

const addReviewField = {
  type: reviewType,
  args: {
    id: {
      name: 'id',
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
    },
    location_id: {
      name: 'location ID',
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
    },
    user_id: {
      name: 'user ID',
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
    },
    text: {
      name: 'review text contents',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
    score: {
      name: 'review score',
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
    },
  },
  async resolve(_, {
    id, location_id, user_id, text, score,
  }) {
    try {
      await mongoose.connect(mongo_url, {
        useMongoClient: true,
      });

      await USER.findOneAndUpdate(
        {
          id: user_id,
        },
        {
          $push: {
            reviews: id,
          },
        },
        (err) => {
          if (err) {
            return console.log('Could not update location reviews', err);
          }
        },
      );

      await LOCATION.findOneAndUpdate(
        {
          id: location_id,
        },
        {
          $push: {
            reviews: id,
          },
        },
        (err) => {
          if (err) {
            return console.log('Could not update location reviews', err);
          }
        },
      );

      const new_review = new REVIEW({
        id,
        user_id,
        location_id,
        score,
        text,
        posted: Date(),
      });

      return new_review.save((err) => {
        if (err) {
          return console.log('Could not add new review', err);
        }
      });
    } catch (err) {
      return console.log(err);
    }
  },
};

const mutation = new graphql.GraphQLObjectType({
  name: 'Mutation',
  fields: {
    add_user: addUserField,
    add_location: addLocationField,
    add_review: addReviewField,
    /*
    These are just as easy, but with more required fields
    mutation {
      add_user(
      id: 1
      username: Freddy
      avatar: 'freddys-pic.com'
    ) {
      whatever data you want returned
      }
    }
    */
  },
});

export const schema = new graphql.GraphQLSchema({ query, mutation });
