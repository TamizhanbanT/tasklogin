import { Request, Response } from 'express';
import * as AuthService from '../services/auth.service';
import { signupSchema, loginSchema, forgotSchema } from '../validators/auth.schema';
import { transporter } from '../config/mailer';

export const showSignup = (req: Request, res: Response) => res.render('signup');
export const showLogin = (req: Request, res: Response) => res.render('login', { error: null });
export const showForgot = (req: Request, res: Response) => res.render('forgot');

export const handleSignup = async (req: Request, res: Response) => {
  try {
    const data = signupSchema.parse(req.body);
    await AuthService.registerUser(data);
    res.render('success', { message: 'Signup successful! Please login.' });
  } catch (err) {
    res.status(400).send(err);
  }
};

export const handleLogin = async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await AuthService.loginUser(data.email, data.password);
    if (user) {
      res.render('success', { message: `Welcome ${user.name}` });
    } else {
      res.render('login', { error: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(400).send(err);
  }
};

export const handleForgot = async (req: Request, res: Response) => {
  try {
    const { email } = forgotSchema.parse(req.body);
    const tokenData = await AuthService.generateResetToken(email);
    if (!tokenData) return res.send('User not found');

    const resetLink = `http://localhost:3000/reset-password/${tokenData.token}`;
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Reset Password',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link valid for 15 minutes.</p>`,
    });

    res.render('success', { message: 'Password reset link sent!' });
  } catch (err) {
    res.status(400).send(err);
  }
};

export const showReset = (req: Request, res: Response) => {
  const { token } = req.params;
  res.render('reset-password', { token });
};

export const handleReset = async (req: Request, res: Response) => {
  const { password, confirmPassword } = req.body;
  const token = req.params.token;

  if (password !== confirmPassword) {
    return res.send('Passwords do not match');
  }

  try {
    const resetResult = await AuthService.resetPasswordWithToken(token, password);
    if (!resetResult) {
      return res.send('Invalid or expired token');
    }
    res.render('success', { message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    res.status(400).send(err);
  }
};
