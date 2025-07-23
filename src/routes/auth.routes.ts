import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller';

const router = Router();

router.get('/signup', AuthController.showSignup);
router.get('/', AuthController.showLogin);
router.get('/forgot', AuthController.showForgot);

router.post('/signup', AuthController.handleSignup);
router.post('/login', AuthController.handleLogin);
router.post('/forgot', AuthController.handleForgot);

router.get('/reset-password/:token', AuthController.showReset);
router.post('/reset-password/:token', AuthController.handleReset);


export default router;
