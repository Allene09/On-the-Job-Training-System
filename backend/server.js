require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 OJTrack Backend Service Running on Port ${PORT}`);
  console.log(`🗄️  Mode: MySQL Database (${process.env.DB_NAME}@${process.env.DB_HOST})`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`====================================================`);
});
