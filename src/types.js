import createType from 'mongoose-schema-to-graphql';
import mongoose from 'mongoose';
const graphql = require("graphql");
require('dotenv').config();
const mongo_url = process.env.MONGO_URL;

import {ReviewSchema} from './schemas';
import {UserSchema} from './schemas';
import {LocationSchema} from './schemas';
import {GeoSchema} from './schemas';

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

const geo_config = {
  name: 'geoType',
  description: 'geo-location schema',
  class: 'GraphQLInputObjectType', //Note the Input, very important
  schema: GeoSchema
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
function getProjection (fieldASTs) {
  return fieldASTs.fieldNodes[0].selectionSet.selections.reduce((projections, selection) => {
    projections[selection.name.value] = true;
    return projections;
  }, {});
};


const queryUserField = {
  type: userType, //What type of data to send
  args: { //The arguments the client can send as part of the request
    id: { //so for now, they can only search by id
      name: 'id',
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt) //non-null makes it required
    }
  },
  resolve: async function(_, {id}, source, fieldASTs) { //This is the function that is called
    let found_user;                                     //when a request is received.
    var projections = getProjection(fieldASTs);
    let finder = async function (id) {
      try {
        await mongoose.connect(mongo_url, {
          useMongoClient: true
        });
        await USER.findOne({
          'id': id
        }, projections)
        .then((result) => { //This might not be necessary in mongoose, but if we need to change
          found_user = result;//the data it is helpful
        });
      }
      catch (err) { //also, I don't really understand try/catch haha
        console.log(err);
      }
    };
    await finder(id);
    return found_user;
  }
};

const queryLocationField = {
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
};

const queryReviewField = {
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
    review: queryReviewField
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
  }
});

const addUserField = {
  type: userType,
  args: {
    id: {
      name: 'id',
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
    },
    username: {
      name: 'user name',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString)
    },
    avatar: {
      name: 'avatar url',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString)
    }
  },
  resolve: async function(_, {id, username, avatar}) {
    await mongoose.connect(mongo_url, {
      useMongoClient: true
    });
    let new_user = new USER({
      id: id,
      username: username,
      avatar: avatar,
      reviews: [],
      registered: Date()
    });
    return new_user.save((err) => {
      if (err) {
        return console.log('Unable to add new reviewer ', err);
      }
    });
  }
};

const addLocationField = {
  type: locationType,
  args: {
    id: {
      name: 'id',
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
    },
    name: {
      name: 'location name',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString)
    },
    avatar: {
      name: 'avatar url',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString)
    },
    geo: {
      name: 'Geo coordinates',
      type: new graphql.GraphQLNonNull(geoType), //note the custom input type
    }
  },
  resolve: async function(_, {id, name, avatar, geo}) {
    await mongoose.connect(mongo_url, {
      useMongoClient: true
    });
    let new_location = new LOCATION({
      id: id,
      name: name,
      avatar: avatar,
      geo: JSON.stringify(geo),
      reviews: []
    });
    return new_location.save((err, doc) => {
      if (err) {
        return console.log('Unable to add new location', err);
      }
    });
  }
};

const addReviewField = {
  type: reviewType,
  args: {
    id: {
      name: 'id',
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
    },
    location_id: {
      name: 'location ID',
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
    },
    user_id: {
      name: 'user ID',
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
    },
    text: {
      name: 'review text contents',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString)
    },
    score: {
      name: 'review score',
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
    }
  },
  resolve: async function(_, {id, location_id, user_id, text, score}) {
    try {
      await mongoose.connect(mongo_url, {
        useMongoClient: true
      });

      await USER.findOneAndUpdate({
        'id': user_id
      },
      {
        $push: {
          "reviews": id
        }
      },
      (err) => {
        if (err) {
          return console.log('Could not update location reviews', err);
        }
      });

      await LOCATION.findOneAndUpdate({
        'id': location_id
      },
      {
        $push: {
          "reviews": id
        }
      },
      (err) => {
        if (err) {
          return console.log('Could not update location reviews', err);
        }
      });

      let new_review = new REVIEW({
        'id': id,
        'user_id': user_id,
        'location_id': location_id,
        'score': score,
        'text': text,
        'posted': Date()
      });

      return new_review.save((err) => {
        if (err) {
          return console.log('Could not add new review', err);
        }
      });
    }
    catch (err) {
      return console.log(err);
    }

  }
};

const mutation = new graphql.GraphQLObjectType({
  name: 'Mutation',
  fields: {
    add_user: addUserField,
    add_location: addLocationField,
    add_review: addReviewField
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
  }
});

export const schema = new graphql.GraphQLSchema({query: query, mutation: mutation});
