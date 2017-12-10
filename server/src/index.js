/* eslint-disable camelcase */

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

//test
function add_starter_data_to_db(){
  let super_mongo;
  return MongoClient.connect(mongo_url).then(client => {
    console.log('Connected to MongoDB successfully.');
    super_mongo = client.db('bears13');
    return super_mongo.collection('reviewers').insertOne(
      {reviewer_id : 1, reviews : []}
    ).then(()=>{
      console.log('Reviewer added successfully.');
      return super_mongo.collection('locations').insertOne(
        {location_id : 1, reviews : [], scores : []}
      ).then(()=>{
        console.log('Location added successfully. Closing connection.');
        return client.close();
      }, (err) => {
        //location insert failed
        console.log('Location insert failed');
        client.close();
        return console.log(err);
      });
    }, (err) => {
      //reviewer insert failed
      console.log('Reviewer insert failed');
      client.close()
      return console.log(err);
    });
  }, (err) => {
    //connection failed
    console.log('Connection failed');
    client.close()
    return console.log(err);
  });
};

function add_review(data) {
  let super_mongo;
  return MongoClient.connect(mongo_url).then(client => {
    console.log('Connected to MongoDB successfully');
    super_mongo = client.db('bears13');
    return super_mongo.collection('reviews').insertOne(
      {location_id: data.location_id, review : data.review_text, id : data.review_id})
      .then(()=>{
        console.log('First review added succesfully');
         return super_mongo.collection('reviewers').updateOne(
          {id : data.reviewer_id},
          { $push: { reviews : data.review_id}}
        ).then(()=>{
          console.log('First update completed succesfully');
          return super_mongo.collection('locations').updateOne(
            {location_id : data.location_id},
            { $push: { reviews : data.review_id, scores : data.review_score}}
          ).then(()=>{
            console.log('Second update completed. Closing connection.')
            return client.close();
            //Res.send('Mission Accomplished');
          }, (err)=>{
            client.close();
            //Res.send('Oh no, the last update failed');
            return console.log(err);
          });
        }, (err)=>{
          client.close();
          //Res.send('Oh no, the first update failed');
          return console.log(err);
        });
      },
      (err)=>{
        client.close();
        //Res.send('Oh no, the insert failed');
        return console.log(err);
      });
  },(err)=>{
    client.close();
    //Res.send('Oh no, the connection failed');
    return console.log(err);
  });
};

let sample_data = {
  review_id : 1,
  location_id : 1,
  reviewer_id : 1,
  review_text : "Very good.",
  review_score : 8
};

add_starter_data_to_db();
setTimeout(()=>{
  add_review(sample_data);
}, 1000);
