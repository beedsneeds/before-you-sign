import { Router } from 'express';
import { addFavBuilding, removeFavBuilding, getFavBuildings } from '../data/favorites.js';

const router = Router();

//viewing the favorites page
router.get('/favorites', async (req, res) => {
  try {
    const user = (req.session as any).user;

    if (!user) {
      return res.redirect('/signin');
    }

    const buildings = await getFavBuildings(user.userId);

    return res.render('favorites', {
      title: 'My Favorite Buildings',
      buildings,
    });
  } catch (e) {
    return res.status(500).render('error', {
      title: 'Error',
      error: e,
    });
  }
});

//adding a building to favorites
router.post('/favorites/:bin', async (req, res) => {
  try {
    const user = (req.session as any).user;

    if (!user) {
      return res.redirect('/signin');
    }

    const bin = req.params.bin;
    const result = await addFavBuilding(user.userId, bin);

    if (result.alreadyFavorited) {
      return res.redirect(req.get('Referrer') + '?favoriteExists=true');
    }

    return res.redirect('/favorites');
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Error',
      error: e,
    });
  }
});

//removing a building from favorites
router.post('/favorites/:bin/remove', async (req, res) => {
  try {
    const user = (req.session as any).user;

    if (!user) {
      return res.redirect('/signin');
    }

    const bin = req.params.bin;

    await removeFavBuilding(user.userId, bin);

    return res.redirect('/favorites');
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Error',
      error: e,
    });
  }
});

export default router;
