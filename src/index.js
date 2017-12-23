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
const mongo_url = process.env.MONGO_URL;
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

app.post('/add-review', async (req, res, next) => {
  /*
  * to secure this route, I suspect we'll have to use some sort of authentication code;
  * probably a JSONWebToken that an authenticated client sends back in `req.header`. But T.B.D.
  */
  try {
    let db;
    let super_client;
    await MongoClient.connect(mongo_url).then((client) => {
      db = client.db('bears13');
      super_client = client;
    });
    await add_new_review(db, super_client, req.body);
    await super_client.close();
    res.send('Review added successfully');
    return console.log('Added a new review for User ID ', req.body.user_id);
  }
  catch (err) {
    // next(err)?
    return console.log(err);
  }
});

/**
 * START SERVER
 */
app.listen(port, () => console.log(`server listening on ${port}`));

// test

function add_new_review(db, client, data) {
  const addition = db
    .collection('reviews')
    .insertOne({...data})
    .then(
      db
        .collection('locations')
        .updateOne({ id: data.location_id }, { $push: { reviews: data.id } }),
      (err) => {
        client.close();
        return 'Review insert failed.', err;
      },
    )
    .then(
      db.collection('reviewers').updateOne({ id: data.user_id }, { $push: { reviews: data.id } }),
      (err) => {
        client.close();
        return 'Location update failed.', err;
      },
    )
    .then(
      () => {
        console.log('Review added successfully.');
      },
      (err) => {
        client.close();
        return 'Reviewer update failed.', err;
      },
    );
  return addition;
}

function add_new_location(db, client, data) {
  const addition = db
    .collection('locations')
    .insertOne({...data})
    .then(
      () => {
        console.log('Location added successfully.');
      },
      (err) => {
        client.close();
        return 'Location insertion failed.', err;
      },
    );
  return addition;
}

function add_new_reviewer(db, client, data) {
  const addition = db
    .collection('reviewers')
    .insertOne({...data})
    .then(
      () => {
        console.log('Reviewer added successfully.');
      },
      (err) => {
        client.close();
        return 'Reviewer insertion failed.', err;
      },
    );
  return addition;
};


const add_starter_data_to_db = async () => {
  const sample_location = {
    id: 1,
    name: 'Taco Bell',
    geo: { type: 'Point', coordinates: [-73.97, 40.77] },
    avatar: 'http://cdn.freshome.com/wp-content/uploads/2007/10/tetris-apartments2.jpg',
  };

  const sample_reviewer = {
    id: 1,
    name: 'John Smith',
    reviews: [],
    avatar: 'https://i.ytimg.com/vi/oHg5SJYRHA0/hqdefault.jpg',
    registered: 'Tue Dec 12 2017 21:28:32 GMT-0700 (US Mountain Standard Time)',
  };

  const sample_review = {
    id: 1,
    user_id: 1,
    location_id: 1,
    text: "I will go there again, even though it's not that great",
    score: 4,
  };

  let db;
  let super_client;
  await MongoClient.connect(mongo_url).then((client) => {
    db = client.db('bears13');
    super_client = client;
  });
  await add_new_location(db, super_client, sample_location);
  await add_new_reviewer(db, super_client, sample_reviewer);
  await add_new_review(db, super_client, sample_review);
  await super_client.close();
};

add_starter_data_to_db().then(() => {
  console.log('Starter data added.');
});
