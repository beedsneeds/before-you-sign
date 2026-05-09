import { Router, type Request, type Response, type NextFunction } from 'express';
import { getUserProfileById, updateUserProfile } from '../data/profile.js';

const router = Router();

const requireLogin = (req: Request, res: Response, next: NextFunction) => {
  const sessionInfo = req.session as any;

  if (!sessionInfo?.user) {
    return res.redirect('/signin');
  }

  next();
};

router.get('/', requireLogin, async (req, res) => {
  try {
    const sessionInfo = req.session as any;
    const profile = await getUserProfileById(sessionInfo.user.userId);

    return res.render('profile', {
      title: 'Profile',
      user: profile.user,
      savedBuildings: profile.savedBuildings,
      reviews: profile.reviews,
      comments: profile.comments,
    });
  } catch (e) {
    return res.status(404).render('error', { title: 'Error', error: e });
  }
});

router.get('/edit', requireLogin, async (req, res) => {
  try {
    const sessionInfo = req.session as any;
    const profile = await getUserProfileById(sessionInfo.user.userId);

    return res.render('register', {
      title: 'Edit Profile',
      isEditing: true,
      action: '/profile/edit',
      firstName: profile.user.firstName,
      lastName: profile.user.lastName,
      email: profile.user.email,
    });
  } catch (e) {
    return res.status(404).render('error', { title: 'Error', error: e });
  }
});

router.post('/edit', requireLogin, async (req, res) => {
  const sessionInfo = req.session as any;
  const { firstName, lastName, email, password } = req.body;

  try {
    const updatedUser = await updateUserProfile(
      sessionInfo.user.userId,
      firstName,
      lastName,
      email,
      password,
    );

    sessionInfo.user = {
      userId: updatedUser._id.toString(),
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    };

    return res.redirect('/profile');
  } catch (e) {
    return res.status(400).render('register', {
      title: 'Edit Profile',
      isEditing: true,
      action: '/profile/edit',
      error: e,
      firstName,
      lastName,
      email,
    });
  }
});

export default router;
