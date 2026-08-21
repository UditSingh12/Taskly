import { createApp } from '../src/app.js';
import { connectDB } from '../src/config/db.js';

let appInstance: any;

export default async (req: any, res: any) => {
  if (!appInstance) {
    await connectDB();
    appInstance = createApp();
  }
  return appInstance(req, res);
};
