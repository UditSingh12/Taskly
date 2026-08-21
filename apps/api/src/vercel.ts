import { createApp } from '../src/app';
import { connectDB } from '../src/config/db';

let appInstance: any;

export default async (req: any, res: any) => {
  if (!appInstance) {
    await connectDB();
    appInstance = createApp();
  }
  return appInstance(req, res);
};
