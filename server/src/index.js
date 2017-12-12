/* eslint-disable camelcase, no-console */

import express from 'express';
import path from 'path';
import MongoClient from 'mongodb';

const port = process.env.PORT || 3333;
const app = express();
const mongo_url = 'mongodb://localhost:27017/bears13'; // to be switched at production

/* express methods to access req.body */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * A TEST 'get' ROUTE
 */
app.get('/test-route', (req, res) => res.json({ message: '/test-route is responding' }));

/**
 * A TEST 'post' ROUTE
 * from command line, try: `curl -X POST http://localhost:3333/test-route?test=HELLO!`
 */
app.post('/test-route', (req, res) => {
  const { test } = req.query;
  return res.send(`you set 'test' equal to '${test}' in the URL string`);
});

app.post('/add-review', (req, res) => {
  /*
   *Here's a question:
   *If I use res.setHeader('Access-Control-Allow-Origin', '/route-from-which-one-can-add-reviews');
   *Will that serve as sort of a bodyguard from rouge posts to this address?
   *Or can this only be called outside of this app.post function?
  */
  MongoClient.connect(mongo_url, (err, client) => {
    const db = client.db('bears13'); // new in v3.0 of driver
    if (err) {
      return console.log(err);
    }

    /*
     *I'm thinking we send the review here with the ID
     *like you guys were talking about
     *as well as the actual review's content
     *and an id for the location itself?
     *Then, we could have a collection of users and another for
     *locations. I'm not sure how we're
     *gonna be splitting this up, but this much should
     *work in case we add a Google Maps interface or something later.
     *
     *As for filtering out reviews, I was thinking maybe we could just
     *make an array of common swear words and then we can just parse
     *the review's text as a string and see whether it has any of those
     *words in it. We could do this server side by posting to a seperate
     *route to check for bad words, returning the result to the client and if
     *it passes, the review will then be posted to this 'add-review' route.
     *We could still have the back-end check for any missed reviews, since
     *this would be easier to abuse, but I think it would work for most cases.
    */

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

    // So basically a new review object is created
    // And the user who made it and the location
    // the review is about will both receive references to the review

    client.close();
  });
  // TODO: we can get more into this later, but the problem here is that we get a success message
  // even if it fails. we need to look at doing the 3 db calls differently... if they
  // are promise-based, maybe there's something in Promises we can do? To ponder futher...
  res.send('Review added successfully');
  return console.log('Added a new review for User ID ', req.body.review.user_id);
});

/*
* STATIC ROUTE TO SERVE FRONT-END REACT APP (ONCE ITS BUILT)
*
* (this line could be shorter, but using `path.join` and `__dirname`
* ensures that code will work on Windows, and *nixes/OSX)
*/
app.use(express.static(path.join(__dirname, '../../client/build')));

/**
 * START SERVER
 */
app.listen(port, () => console.log(`server listening on ${port}`));

// test

function add_review(data) {
  let super_mongo;
  return MongoClient.connect(mongo_url).then((client) => {
    console.log('Connected to MongoDB successfully');
    super_mongo = client.db('bears13');
    return super_mongo.collection('reviews').insertOne({ location_id: data.location_id, review: data.review_text, id: data.review_id })
      .then(
        () => {
          console.log('First review added succesfully');
          return super_mongo.collection('reviewers').updateOne(
            { id: data.reviewer_id },
            { $push: { reviews: data.review_id } },
          ).then(() => {
            console.log('First update completed succesfully');
            return super_mongo.collection('locations').updateOne(
              { id: data.location_id },
              { $push: { reviews: data.review_id, scores: data.review_score } },
            ).then(() => {
              console.log('Second update completed. Closing connection.');
              return client.close();
            // Res.send('Mission Accomplished');
            }, (err) => {
              client.close();
              // Res.send('Oh no, the last update failed');
              return console.log(err);
            });
          }, (err) => {
            client.close();
            // Res.send('Oh no, the first update failed');
            return console.log(err);
          });
        },
        (err) => {
          client.close();
          // Res.send('Oh no, the insert failed');
          return console.log(err);
        },
      );
  }, (err) => {
    client.close();
    // Res.send('Oh no, the connection failed');
    return console.log(err);
  });
}

function add_new_location(db, data) {
  const addition = db.collection('locations').insertOne({
    id: data.id, address: data.address, name: data.name, reviews: [], scores: [],
  }).then(() => {
    console.log('Location added successfully.');
  }, (err) => {
    client.close();
    return ('Location insertion failed.', err);
  });
  return addition;
}
/*
  The add_new_location/reviewer function is also compatible with promises.
  I just wanted a function to add locations without having to rewrite everything
  every time.
  I'm not sure how well this will work once posts get involved, but it works fine
  for testing.

  These two functions are different from the add review function above becuse they
  have to be used within the callback of a MongoClient.connect method,
  whereas the add_review function creates its own MongoClient connection.
*/

function add_new_reviewer(db, data) {
  const addition = db.collection('reviewers').insertOne({
    id: data.id, name: data.name, reviews: [], avatar: '',
  }).then(() => {
    console.log('Reviewer added successfully.');
  }, (err) => {
    client.close();
    return ('Reviewer insertion failed.', err);
  });
  return addition;
}

// I think we could just use a url as the avatar and then use that later
// to load the image.
// The avatars could be on our server or from a friendly CDN.

function add_starter_data_to_db() {
  const sample_location = {
    id: 1,
    name: 'Taco Bell',
    address: '1234 Main St.',
  };

  const sample_reviewer = {
    id: 1,
    name: 'John Smith',
  };

  MongoClient.connect(mongo_url, (err, client) => {
    if (err) {
      return console.log('Connection failed.', err);
    }
    console.log('Connected to MongoDB');
    const db = client.db('bears13');

    add_new_location(db, sample_location)
      .then(add_new_reviewer(db, sample_reviewer))
      .then(() => {
        console.log('Closing connection.');
        client.close();
      });
  });
}

const sample_data = {
  review_id: 1,
  location_id: 1,
  reviewer_id: 1,
  review_text: 'Very good.',
  review_score: 8,
};

add_starter_data_to_db();
setTimeout(() => {
  add_review(sample_data);
}, 1000);
