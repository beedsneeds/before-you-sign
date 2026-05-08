import { Router, Express, Request, Response } from 'express';
import adminRoutes from './admin.js';
import authRoutes from './authRoutes.js';
import buildingRoutes from './buildings.js';

const router = Router();

//route for admin added for preliminary structure, change and add rest as needed
const constructorMethod = (app: Express) => {
  app.use('/admin', adminRoutes);
  app.use('/', authRoutes);
  app.use('/', buildingRoutes);

  // mount router (needed for building route to work)
  app.use('/', router);

  app.use((req: Request, res: Response) => {
    res.status(404).render('error', { title: 'Error', error: 'Page not found' });
  });
};

//home
router.get('/', async (req, res) => {
  res.render('home', { title: 'Home' });
});

export default constructorMethod;