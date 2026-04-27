import { Router } from 'express';
// import { ObjectId } from 'mongodb';
import { getAllBuildings } from '../data/buildings.js';

const router = Router();

//landing page code
router.get('/', async (req, res) => {
  res.render('home', { title: 'Before You Sign' });
});

//search results page code
router.get('/search', async (req, res) => {});

export default router;
