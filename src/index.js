/* eslint-disable no-console */

import { MongoClient, ObjectId } from 'mongodb';
import express from 'express';
import path from 'path';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';

require('dotenv').config();

const PORT = process.env.PORT || 3333;
const { MONGO_URL } = process.env;

const prepare = (o) => {
  o._id = o._id.toString(); // eslint-disable-line
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
        locationName(placename: String): Location
        review(_id: String): Review
        getRecents(num: String): [Review]
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
      }

      type Mutation {
        createUser(auth_id: String!, username: String!, avatar: String): User
        createLocation(placename: String!): Location
        createReview(user_id: String!, location_id: String!, text: String!, stars: String!): Review
      }

      schema {
        query: Query
        mutation: Mutation
      }
    `,
    ];

    const resolvers = {
      Query: {
        user: async (root, { _id }) => prepare(await Users.findOne(ObjectId(_id))),
        authUser: async (root, { auth_id }) => prepare(await Users.findOne({ auth_id })), // string
        location: async (root, { _id }) => prepare(await Locations.findOne(ObjectId(_id))),
        locationName: async (root, { placename }) =>
          prepare(await Locations.findOne({ placename })), // string
        review: async (root, { _id }) => prepare(await Reviews.findOne(ObjectId(_id))),
        getRecents: async (root, { num }) =>
          Reviews.find({})
            .sort({"posted": -1})
            .limit(parseInt(num, 10))
            .toArray(), // no validation on num
      },
      User: {
        reviews: async ({ _id }) => (await Reviews.find({ user_id: _id }).toArray()).map(prepare),
        latest_reviews: async ({ _id }, recent) => (await Reviews.find({ user_id: _id }).sort({"posted": -1}).limit(parseInt(recent["num"])).toArray()).map(prepare),
      },
      Location: {
        reviews: async ({ _id }, args) => {

          if (args["sort"] && args["latest"]) {
            switch (args["sort"]) {
              case "best":
                return (await Reviews.find({ location_id: _id}).sort({"stars": -1, "posted": -1}).limit(args["latest"]).toArray()).map(prepare);
                break;
              case "worst":
                return (await Reviews.find({ location_id: _id}).sort({"stars": 1, "posted": -1}).limit(args["latest"]).toArray()).map(prepare);
                break;
            }
          }

          if (args["sort"]) {
            switch (args["sort"]) {
              case "best":
                return (await Reviews.find({ location_id: _id}).sort({"stars": -1}).toArray()).map(prepare);
                break;
              case "worst":
                return (await Reviews.find({ location_id: _id}).sort({"stars": 1}).toArray()).map(prepare);
                break;
            }
          }

          if (args["latest"]) {
            return (await Reviews.find({ location_id: _id}).sort({"posted": -1}).limit(args["latest"]).toArray()).map(prepare);
          }

          return (await Reviews.find({ location_id: _id}).toArray()).map(prepare);

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
      },
      // borrowed date handling from https://github.com/graphql/graphql-js/issues/497
      Date: {
        __parseValue(value) {
          return new Date(value); // value from the client
        },
        __serialize(value) {
          return value.getTime(); // value sent to the client
        },
        __parseLiteral(ast) {
          if (ast.kind === Kind.INT) {
            // eslint-disable-line
            return parseInt(ast.value, 10); // ast value is always in string format
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

    app.use('/graphql', express.json(), graphqlExpress({ schema }));
    app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

    app.use(express.static(path.join(__dirname, '../client/build')));

    app.listen(PORT, () => console.log(`listening on ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();
