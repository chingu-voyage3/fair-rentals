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

/*
* STATIC ROUTE TO SERVE FRONT-END REACT APP
*/
app.use(express.static(path.join(__dirname, '../client/build')));

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
  } catch (err) {
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
const find_existing_reviewer = (db, client, data) =>
  db.collection('reviewers').findOne({ auth_id: data });

function add_new_reviewer(db, client, data) {
  const addition = db
    .collection('reviewers')
    .insertOne(data) // can i get away with this? identical objects
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

app.post('/add-reviewer', async (req, res) => {
  const { auth_id, name, avatar } = req.body;
  console.log(req.body);
  const avatarToSave = avatar || 'http://voice4thought.org/wp-content/uploads/2016/08/default1.jpg';
  const newUser = {
    auth_id,
    name,
    avatar: avatarToSave,
    registered: new Date(),
    reviews: [],
  };
  try {
    let db;
    let super_client;
    await MongoClient.connect(mongo_url).then((client) => {
      db = client.db('bears13');
      super_client = client;
    });
    const user = await add_new_reviewer(db, super_client, newUser);
    // fn above this line doesn't actually return the new user. `user` is undef
    return res.send(newUser);
  } catch (err) {
    return res.send({ message: `Error adding profile: ${err}` });
  }
});

app.get('/profile', async (req, res) => {
  try {
    let db;
    let super_client;
    await MongoClient.connect(mongo_url).then((client) => {
      db = client.db('bears13');
      super_client = client;
    });
    const user = await find_existing_reviewer(db, super_client, req.query.sub);
    return res.send({ user });
  } catch (err) {
    return res.send({ message: `Error getting profile: ${err}` });
  }
});

// I think we could just use a url as the avatar and then use that later
// to load the image.
// The avatars could be on our server or from a friendly CDN.

/**
 * TURNING TESTS OFF (but not deleting yet)
 *
 */
// const add_starter_data_to_db = async () => {
//   const sample_location = {
//     location_name: 'Taco Bell',
//     geo: { type: 'Point', coordinates: [-73.97, 40.77] },
//     reviews: [1], // array will contain _ids from review in db.collection('reviews')
//   };

//   const sample_reviewer = {
//     auth_id: 'google-oauth2|999999999999999999999',
//     name: 'John Smith',
//     reviews: [1], // array will contain _ids from review in db.collection('reviews')
//     avatar: 'https://i.ytimg.com/vi/oHg5SJYRHA0/hqdefault.jpg',
//     registered: 'Tue Dec 12 2017 21:28:32 GMT-0700 (US Mountain Standard Time)',
//   };

//   const sample_review = {
//     reviewer_id: 1, // in app this will be the _id from db.collection('reviewers')
//     location_id: 1, // in app this will be the _id from db.collection('locations')
//     location_name: 'Taco Bell',
//     text: "I will go there again, even though it's not that great",
//     stars: 4,
//   };

//   let db;
//   let super_client;
//   await MongoClient.connect(mongo_url).then((client) => {
//     db = client.db('bears13');
//     super_client = client;
//   });
//   await add_new_location(db, super_client, sample_location);
//   await add_new_reviewer(db, super_client, sample_reviewer);
//   await add_new_review(db, super_client, sample_review);
//   /*
//   await db.collection('locations').find().forEach((location) => {
//     console.log(location);
//   });
//   */
//   await super_client.close();
// };

// add_starter_data_to_db().then(() => {
//   console.log('Starter data added.');
// });
