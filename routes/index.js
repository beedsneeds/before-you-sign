import { Router } from 'express';
import adminRoutes from './admin.js';

const router = Router();

//route for admin added for preliminary structure, change and add rest as needed
const constructorMethod = (app) => {
  app.use('/admin', adminRoutes);

  // mount router (needed for building route to work)
  app.use('/', router);

  app.use((req, res) => {
    res.status(404).render('error', { title: 'Error', error: 'Page not found' });
  });
};

// building route
router.get('/building/:id', async (req, res) => {
  // get the id
  const id = req.params.id;

  // fake data
  const building = {
    BuildingID: id,
    Address: 'TEMP ADDRESS',
    AvgRating: 0,
    ReviewsCount: 0,
  };

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
