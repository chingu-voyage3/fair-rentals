/* eslint-disable no-console, no-undef, no-param-reassign */

import { MongoClient, ObjectId } from 'mongodb';
import express from 'express';
import path from 'path';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';

require('dotenv').config();

const PORT = process.env.PORT || 3466;
const { MONGO_URL } = process.env;
const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOG_KEY,
  Promise,
});

const prepare = (o) => {
  if (!o) return null;
  o._id = o._id.toString();
  return o;
};

// note for later: geo with `input`
//  input GeoInput {
//   type: String! (will always be 'point')
//   coordinates: [lon, lat] // array
// }

const start = async () => {
  try {
    const client = await MongoClient.connect(MONGO_URL);
    const db = await client.db('bears13');
    const Users = await db.collection('users');
    const Reviews = await db.collection('reviews');
    const Locations = await db.collection('locations');

    const typeDefs = [
      `
      scalar Date

      type Query {
        user(_id: String): User
        authUser(auth_id: String): User
        location(_id: String): Location
        locationGoogle(place_id: String): Location
        review(_id: String): Review
        getRecents(num: Int): [Review]
      }

      type User {
        _id: String!
        auth_id: String!
        username: String!
        avatar: String
        registered: Date!
        reviews: [Review]
        latest_reviews(num: Int): [Review]
      }

      type Location {
        _id: String!
        placename: String!
        reviews(latest: Int, sort: String): [Review]
        place_id: String!
      }

      type Review {
        _id: String!
        text: String!
        stars: Int!
        posted: Date!
        user_id: String!
        location_id: String!
        user: User!
        location: Location!
        last_edited: Date!
      }

      input EditReviewInput {
        review_id: String!
        stars: Int!
        text: String!
      }

      type Mutation {
        createUser(auth_id: String!, username: String!, avatar: String): User
        createLocation(placename: String!, place_id: String!): Location
        createReview(user_id: String!, location_id: String!, text: String!, stars: String!): Review
        editReview(input: EditReviewInput!): Review
        deleteReview(review_id: String!): Review
      }

      schema {
        query: Query
        mutation: Mutation
      }
    `,
    ];
    //Apparently doing input: {} is better for the front end because you only have to send one object?
    //https://dev-blog.apollodata.com/designing-graphql-mutations-e09de826ed97

    const resolvers = {
      Query: {
        user: async (root, { _id }) => prepare(await Users.findOne(ObjectId(_id))),
        authUser: async (root, { auth_id }) => prepare(await Users.findOne({ auth_id })),
        location: async (root, { _id }) => prepare(await Locations.findOne(ObjectId(_id))),
        locationGoogle: async (root, { place_id }) =>
          prepare(await Locations.findOne({ place_id })),
        review: async (root, { _id }) => prepare(await Reviews.findOne(ObjectId(_id))),
        getRecents: async (root, { num }) =>
          Reviews.find({})
            .sort({ posted: -1 })
            .limit(num)
            .toArray(),
      },
      User: {
        reviews: async ({ _id }) => (await Reviews.find({ user_id: _id }).toArray()).map(prepare),
        latest_reviews: async ({ _id }, recent) =>
          (await Reviews.find({ user_id: _id })
            .sort({ posted: -1 })
            .limit(parseInt(recent.num, 10))
            .toArray()).map(prepare),
      },
      Location: {
        reviews: async ({ _id }, args) => {
          if (args.sort && args.latest) {
            switch (args.sort) {
              case 'best':
                return (await Reviews.find({ location_id: _id })
                  .sort({ stars: -1, posted: -1 })
                  .limit(args.latest)
                  .toArray()).map(prepare);
              case 'worst':
                return (await Reviews.find({ location_id: _id })
                  .sort({ stars: 1, posted: -1 })
                  .limit(args.latest)
                  .toArray()).map(prepare);
              default:
                console.log('Invalid sort term');
                break;
            }
          }

          if (args.sort && !args.latest) {
            switch (args.sort) {
              case 'best':
                return (await Reviews.find({ location_id: _id })
                  .sort({ stars: -1 })
                  .toArray()).map(prepare);
              case 'worst':
                return (await Reviews.find({ location_id: _id })
                  .sort({ stars: 1 })
                  .toArray()).map(prepare);
              case 'latest':
                return (await Reviews.find({ location_id: _id })
                  .sort({ posted: -1 })
                  .toArray()).map(prepare);
              default:
                console.log('Invalid sort term');
                break;
            }
          }

          if (args.latest) {
            return (await Reviews.find({ location_id: _id })
              .sort({ posted: -1 })
              .limit(args.latest)
              .toArray()).map(prepare);
          }

          return (await Reviews.find({ location_id: _id }).toArray()).map(prepare);
        },
      },
      Review: {
        user: async ({ user_id }) => prepare(await Users.findOne({ _id: ObjectId(user_id) })),
        location: async ({ location_id }) =>
          prepare(await Locations.findOne({ _id: ObjectId(location_id) })),
      },
      Mutation: {
        createUser: async (root, args) => {
          const res = await Users.insert({ ...args, registered: new Date() });
          return prepare(await Users.findOne({ _id: res.insertedIds[0] }));
        },
        createLocation: async (root, args) => {
          const res = await Locations.insert(args);
          return prepare(await Locations.findOne({ _id: res.insertedIds[0] }));
        },
        createReview: async (root, args) => {
          const res = await Reviews.insert({ ...args, posted: new Date() });
          return prepare(await Reviews.findOne({ _id: res.insertedIds[0] }));
        },
        editReview: async (root, args) => {
          try {
            const res = await Reviews.findOneAndUpdate(
              {
                _id: ObjectId(args.input.review_id)
              },
              {
                $set:  {
                  text: args.input.text,
                  stars: args.input.stars,
                  last_edited: new Date()
                }
              },
              {
                returnOriginal: false
              });
            return res.value;
          }
          catch (err) {
            return console.log(err);
          }
        },
        deleteReview: async (root, args) => {
          try {
            const deletedDoc = prepare(await Reviews.findOne({ _id: ObjectId(args.review_id )}));
            await Reviews.deleteOne({ _id: ObjectId(args.review_id )});
            return deletedDoc;
          }
          catch (err) {
            return console.log(err);
          }
        }
      },
      // borrowed date handling from https://github.com/graphql/graphql-js/issues/497
      Date: {
        __parseValue(value) {
          return new Date(value);
        },
        __serialize(value) {
          return value.getTime();
        },
        __parseLiteral(ast) {
          if (ast.kind === Kind.INT) {
            return parseInt(ast.value, 10);
          }
          return null;
        },
      },
    };

    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    const app = express();

    /*
    * google places API
    */
    app.use(express.json());

    app.post('/autocomplete', (req, res) => {
      const {
        input, radius, latitude, longitude,
      } = req.body.data;
      googleMapsClient
        .placesAutoComplete({
          types: 'establishment',
          location: { latitude, longitude },
          input,
          radius,
        })
        .asPromise()
        .then((response) => {
          if (response.status === 200) {
            return res.send(response);
          }
          return res.send({ message: 'Not found.' });
        });
    });
    /*
    * end google API
    */

    app.use('/graphql', express.json(), graphqlExpress({ schema }));
    app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

    app.use(express.static(path.join(__dirname, '../client/build')));
    //Okay I had to add an extra line
    // next line basically just to get /callback route to react-router on front-end
    // (static method above doesn't do the trick)
    app.get('*', (req, res) => res.sendFile('index.html', { root: './client/build' }));

    app.listen(PORT, () => console.log(`listening on ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();
