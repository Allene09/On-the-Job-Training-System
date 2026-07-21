const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 OJTrack Backend Service Running on Port ${PORT}`);
  console.log(`📊 Mode: Static Mock Database (14 Tables & 9 Stored Procedures)`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`====================================================`);
});
