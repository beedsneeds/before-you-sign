import { Router } from 'express';
import adminRoutes from './admin.js';

const router = Router();

//route for admin added for preliminary structure, change and add rest as needed
const constructorMethod = (app) => {
  app.use('/admin', adminRoutes);

  // mount router (needed for building route to work)
  app.use('/', router);

  app.use('*', (req, res) => {
    res.status(404).render('error', { title: 'Error', error: 'Page not found' });
  });
};

// building route
router.get('/building/:id', async (req, res) => {
  // get the id
  const id = req.params.id;

  // RC fake temp data
  const building = {
    BuildingID: id, // use dynamic id
    Address: '123 Virginia Court, New York, NY',
    AvgRating: 5.0,
    ReviewsCount: 5,
  };

  const reviews = [
    { ReviewText: 'Well maintained', Rating: 4 }, // fixed key
    { ReviewText: 'Bad management', Rating: 1 }, // fixed key
  ];

  const violations = [{ NOVDescription: 'Bedbugs', ViolationStatus: 'Open' }];

  const comments = [{ CommentText: 'I had the same experience' }]; // fixed key

  res.render('building', {
    building,
    reviews,
    violations,
    comments,
  });
});

export default constructorMethod;
