import { Router, type Request, type Response, type NextFunction } from 'express';
import { getNotificationsForUser, clearNotificationsForUser } from '../data/notifications.js';

const router = Router();

const requireLogin = (req: Request, res: Response, next: NextFunction) => {
  const sessionInfo = req.session as any;
  if (!sessionInfo?.user) return res.redirect('/signin');
  next();
};

router.get('/', requireLogin, async (req, res) => {
  try {
    const sessionInfo = req.session as any;
    const notifications = await getNotificationsForUser(sessionInfo.user.userId);
    return res.render('notifications', {
      title: 'Notifications',
      notifications,
    });
  } catch (e) {
    return res.status(500).render('error', { title: 'Error', error: e });
  }
});

router.post('/clear', requireLogin, async (req, res) => {
  try {
    const sessionInfo = req.session as any;
    await clearNotificationsForUser(sessionInfo.user.userId);
    return res.redirect('/notifications');
  } catch (e) {
    return res.status(400).render('error', { title: 'Error', error: e });
  }
});

export default router;
