/* eslint-disable camelcase, no-console, no-sequences */

import express from 'express';
import path from 'path';
import MongoClient from 'mongodb';

require('dotenv').config(); // makes a variable in .env file available at `process.env.VARIABLE`

const port = process.env.PORT;
const mongo_url = process.env.MONGO_URL;
const app = express();

/* express methods to access req.body */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/add-review', (req, res) => {
  /*
  * to secure this route, I suspect we'll have to use some sort of authentication code;
  * probably a JSONWebToken that an authenticated client sends back in `req.header`. But T.B.D.
  */
  MongoClient.connect(mongo_url, (err, client) => {
    const db = client.db('bears13');
    if (err) {
      return console.log(err);
    }
    db.collection('reviews').insertOne(req.body.review);
    db.collection('reviewers').updateOne(
      { id: req.body.review.user_id },
      {
        $push: {
          reviews: req.body.review.id,
        },
      },
    );
    db.collection('locations').updateOne(
      { id: req.body.review.location_id },
      {
        $push: {
          reviews: req.body.review.id,
        },
      },
    );
    return client.close();
  });
  res.send('Review added successfully');
  return console.log('Added a new review for User ID ', req.body.review.user_id);
});

/*
* STATIC ROUTE TO SERVE FRONT-END REACT APP
*/
app.use(express.static(path.join(__dirname, '../client/build')));

/**
 * START SERVER
 */
app.listen(port, () => console.log(`server listening on ${port}`));

// test

function add_new_review(db, client, data) {
  const addition = db
    .collection('reviews')
    .insertOne({
      id: data.id,
      user_id: data.user_id,
      text: data.text,
      score: data.score,
      location_id: data.location_id,
    })
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
    .insertOne({
      id: data.id,
      geo: data.geo,
      name: data.name,
      avatar: data.avatar,
      reviews: [],
    })
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
/*
  The add_new_location/reviewer function is also compatible with promises.
  I just wanted a function to add locations without having to rewrite everything
  every time.
  I'm not sure how well this will work once posts get involved, but it works fine
  for testing.

*/

function add_new_reviewer(db, client, data) {
  const addition = db
    .collection('reviewers')
    .insertOne({
      id: data.id,
      name: data.name,
      reviews: [],
      avatar: data.avatar,
      registered: data.registered,
    })
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
}

// I think we could just use a url as the avatar and then use that later
// to load the image.
// The avatars could be on our server or from a friendly CDN.

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
  /*
  await db.collection('locations').find().forEach((location) => {
    console.log(location);
  });
  */
  await super_client.close();
};

add_starter_data_to_db().then(() => {
  console.log('Starter data added.');
});
