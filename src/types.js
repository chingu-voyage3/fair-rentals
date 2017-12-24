import createType from 'mongoose-schema-to-graphql';
import mongoose from 'mongoose';
const graphql = require("graphql");
require('dotenv').config();
const mongo_url = process.env.MONGO_URL;

import {ReviewSchema} from './schemas';
import {UserSchema} from './schemas';
import {LocationSchema} from './schemas';

const review_config = {
  name: 'reviewType',
  description: 'Review schema',
  class: 'GraphQLObjectType',
  schema: ReviewSchema
};

const user_config = {
  name: 'userType',
  description: 'User schema',
  class: 'GraphQLObjectType',
  schema: UserSchema,
};

const location_config = {
  name: 'locationType',
  description: 'Location schema',
  class: 'GraphQLObjectType',
  schema: LocationSchema,
};

const reviewType = createType(review_config);
const userType = createType(user_config);
const locationType = createType(location_config);

const USER = mongoose.model('reviewers', UserSchema);
const LOCATION = mongoose.model('locations', LocationSchema);
const REVIEW = mongoose.model('reviews', ReviewSchema);

/**
 * generate projection object for mongoose
 * @param  {Object} fieldASTs
 * @return {Project}
 */

function getProjection (fieldASTs) {
  return fieldASTs.fieldNodes[0].selectionSet.selections.reduce((projections, selection) => {
    projections[selection.name.value] = true;
    return projections;
  }, {});
};

const query = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: {
    user: {
      type: userType,
      args: {
        id: {
          name: 'id',
          type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
        }
      },
      resolve: async function(_, {id}, source, fieldASTs) {
        let found_user;
        var projections = getProjection(fieldASTs);
        let finder = async function (id) {
          try {
            await mongoose.connect(mongo_url, {
              useMongoClient: true
            });
            await USER.findOne({
              'id': id
            }, projections)
            .then((result) => {
              found_user = result;
            });
          }
          catch (err) {
            console.log(err);
          }
        };
        await finder(id);
        return found_user;
      }
    },
    location: {
      type: locationType,
      args: {
        id: {
          name: 'id',
          type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
        }
      },
      resolve: async function(_, {id}, source, fieldASTs) {
        let found_location;
        var projections = getProjection(fieldASTs);
        let finder = async function (id) {
          try {
            await mongoose.connect(mongo_url, {
              useMongoClient: true
            });
            await LOCATION.findOne({
              'id': id
            }, projections)
            .then((result) => {
              found_location = result;
            });
          }
          catch (err) {
            console.log(err);
          }
        };
        await finder(id)
        .then(()=>{
          if (found_location.geo) {
            found_location.geo = JSON.stringify(found_location.geo);
          }
        });
        return found_location;
      }
    },
    review: {
      type: reviewType,
      args: {
        id: {
          name: 'id',
          type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
        }
      },
      resolve: async function(_, {id}, source, fieldASTs) {
        let found_review;
        var projections = getProjection(fieldASTs);
        let finder = async function (id) {
          try {
            await mongoose.connect(mongo_url, {
              useMongoClient: true
            });
            await REVIEW.findOne({
              'id': id
            }, projections)
            .then((result) => {
              found_review = result;
            });
          }
          catch (err) {
            console.log(err);
          }
        };
        await finder(id);
        return found_review;
      }
    }
  }
});

export const schema = new graphql.GraphQLSchema({query: query});
