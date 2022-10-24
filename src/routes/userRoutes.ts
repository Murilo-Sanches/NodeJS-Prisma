import Router from 'express';

import userController from '../controllers/userController';

const router = Router();

router
  .get('/get-all', userController.getAllUsers)
  .get('/search-user/:id', userController.getUserById);
router.post('/signup', userController.addUser);
router.put('/update/:id', userController.updateUserALL);
router.patch('/update/:id', userController.updateUserFEW);

export default router;
