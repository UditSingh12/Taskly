import { createApp } from './app';
import { connectDB } from './config/db';

let appInstance: any;

export default async (req: any, res: any) => {
  if (!appInstance) {
    await connectDB();
    appInstance = createApp();
  }
  return appInstance(req, res);
};
