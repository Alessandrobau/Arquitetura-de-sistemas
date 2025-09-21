require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`User microservice is running on port ${PORT}`);
  console.log(`Access it at http://localhost:${PORT}`);
});