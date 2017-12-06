import express from 'express';

const port = process.env.PORT || 3333;
const app = express();

app.get('/test-route', (req, res) => {
  res.json({ message: '/test-route is responding' });
});

app.listen(port, () => console.log(`server listening on ${port}`));
