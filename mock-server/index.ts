import express from 'express';

const app = express();

const port = process.argv[2] || 8888;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
