import { startServer } from './server.js';
import { initMongoConnection } from '../src/db/initMongoConnection.js';

const runServer = async () => {
  await initMongoConnection();
  startServer();
};
runServer();
