import config from './config/config.ts'; // Your config file with port, etc.
import app from './app.ts'; // Your express app with routes defined

const PORT = config.port || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
