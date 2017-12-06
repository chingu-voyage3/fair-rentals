import express from 'express';
import path from 'path';

const port = process.env.PORT || 3333;
const app = express();

/**
 * A TEST 'get' ROUTE
 */
app.get('/test-route', (req, res) => {
  res.json({ message: '/test-route is responding' });
});

/* 
* STATIC ROUTE TO SERVE FRONT-END REACT APP
* 
* (N.B.: you can make this line shorter, but `path.join` and `__dirname`
* ensure that it will work on Windows, Linux, OSX)
*/
app.use(
  express.static(path.join(__dirname, '../client/bears13-frontend/build'))
);

/**
 * START SERVER
 */
app.listen(port, () => console.log(`server listening on ${port}`));
