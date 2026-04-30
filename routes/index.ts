import { Router, Express, Request, Response } from 'express';
import adminRoutes from './admin.js';
import authRoutes from './authRoutes.js';
import { getBuildingById } from '../data/buildings.js';

const router = Router();

//route for admin added for preliminary structure, change and add rest as needed
const constructorMethod = (app: Express) => {
  app.use('/admin', adminRoutes);
  app.use('/auth', authRoutes);

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

// building route
router.get('/building/:id', async (req, res) => {
  // get the id
  const id = req.params.id;

  const building = await getBuildingById(id);

  //////////////////////////////////////////////////////////////////
  //TEMP: reviews,violations, comments HARDCODED RN
  const reviews = [
    { ReviewText: 'Well maintained', Rating: 4 },
    { ReviewText: 'Bad management', Rating: 1 },
  ];

  const violations = [{ NOVDescription: 'Bedbugs', ViolationStatus: 'Open' }];

  const comments = [{ CommentText: 'I had the same experience' }];

  res.render('building', {
    building,
    reviews,
    violations,
    comments,
  });
});

export default constructorMethod;
