const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// A test route to check if backend is working
app.get('/', (req, res) => {
  res.send('TBF Management System Backend is Running!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});