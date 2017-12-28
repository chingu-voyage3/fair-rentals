/* eslint-disable camelcase, no-console, no-sequences */

import express from 'express';
import path from 'path';
import MongoClient from 'mongodb';
import graphql from 'graphql';
import graphqlHTTP from 'express-graphql';
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;

import {schema} from './types';

require('dotenv').config(); // makes a variable in .env file available at `process.env.VARIABLE`

const port = process.env.PORT;
const app = express();

/* express methods to access req.body */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
* STATIC ROUTE TO SERVE FRONT-END REACT APP
*/
app.use(express.static(path.join(__dirname, '../client/build')));

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));

/**
 * START SERVER
 */
app.listen(port, () => console.log(`server listening on ${port}`));
