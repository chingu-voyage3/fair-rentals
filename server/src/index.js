import express from 'express';
import path from 'path';

const port = process.env.PORT || 3333;
const app = express();

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
