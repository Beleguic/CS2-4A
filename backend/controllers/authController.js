const { User, PasswordHistory } = require('../models');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { sendEmail } = require('../services/mailService');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Authentication failed', loginAttempts: 0 });
    }

    if (!user.is_verified) {
      console.log('Account not verified');
      return res.status(403).json({ message: "Votre compte n'est pas vérifié. Veuillez vérifier votre e-mail pour activer votre compte." });
    }

    if (user.lock_until && user.lock_until > new Date()) {
      const daysSinceLastChange = (new Date() - user.password_last_changed) / (1000 * 60 * 60 * 24);

      if (daysSinceLastChange > 60) {
        user.lock_until = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await sendPasswordResetEmail(user);
        console.log('Password needs to be renewed. Email sent.');
        return res.status(403).json({
          message: 'Password needs to be renewed. An email has been sent.',
          forcePasswordChange: true
        });
      }
      console.log('Account temporarily locked. Try again later.');
      return res.status(401).json({ message: 'Account temporarily locked. Try again later.', loginAttempts: user.login_attempts });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.login_attempts = (user.login_attempts || 0) + 1;

      if (user.login_attempts >= 3) {
        user.lock_until = new Date(Date.now() + 2 * 60 * 60 * 1000);
        user.login_attempts = 0;
        await user.save();
        await sendAccountLockedEmail(user);
        return res.status(401).json({
          loginAttempts: user.login_attempts,
          lockUntil: user.lock_until
        });
      }

      await user.save();
      return res.status(401).json({ message: 'Authentication failed', loginAttempts: user.login_attempts });
    }

    user.login_attempts = 0;
    user.lock_until = null;
    await user.save();

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, isVerified: user.is_verified },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Login successful. Token generated.');
    res.json({ message: 'Login successful', token, userId: user.id, role: user.role, isVerified: user.is_verified });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
};
  
const sendAccountLockedEmail = async (user) => {
    const lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const formattedLockUntil = lockUntil.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

    const emailContent = `Votre compte a été verrouillé suite à plusieurs tentatives de connexion infructueuses. Vous pourrez réessayer de vous connecter le ${formattedLockUntil}.`;

    await sendEmail(user.email, "Sécurité du Compte", emailContent);
};

const sendPasswordResetEmail = async (user) => {
    const token = crypto.randomBytes(20).toString('hex');
    const expires = Date.now() + 3600000;

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetLink = `${process.env.FRONT_END_URL}/reset-password?token=${token}`;

    await sendEmail(user.email, 'Réinitialisation du mot de passe', `Vous devez renouveler votre mot de passe. Cliquez sur le lien suivant pour le réinitialiser : ${resetLink}`);
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const expires = Date.now() + 3600000;

        user.reset_password_token = token;
        user.reset_password_expires = expires;
        await user.save();

        const resetLink = `${process.env.FRONT_END_URL}/reset-password?token=${token}`;

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: user.email,
            subject: 'Password Reset',
            text: `You requested a password reset. Click the link below to reset your password: ${resetLink}`
        });

        res.status(200).json({ message: 'Password reset email sent.' });
    } catch (error) {
        console.error('Error during password reset request:', error);
        res.status(500).json({ message: 'An error occurred during the password reset request.' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        const user = await User.findOne({
            where: {
                reset_password_token: token,
                reset_password_expires: { [Op.gt]: Date.now() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        const previousPasswords = await PasswordHistory.findAll({
            where: { user_id: user.id }
        });

        for (let entry of previousPasswords) {
            if (await bcrypt.compare(password, entry.hashed_password)) {
                return res.status(400).json({ message: 'You cannot reuse an old password.' });
            }
        }

        user.password = password;
        user.reset_password_token = null;
        user.reset_password_expires = null;
        user.password_last_changed = new Date();
        user.lock_until = null;

        await user.save();

        await PasswordHistory.create({
            user_id: user.id,
            hashed_password: user.password
        });

        res.status(200).json({ message: 'Password reset successfully.' });
    } catch (error) {
        console.error('Error during password reset:', error);
        const statusCode = error.code || 500;
        res.status(statusCode).json({ message: 'An error occurred during password reset.' });
    }
};
const register = async (req, res) => {
  const { email, password, lastName, firstName, username, dateOfBirth } = req.body;
  try {
    if (!email || !password || !lastName || !firstName || !username || !dateOfBirth) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const newUser = await User.create({
      email,
      password,
      verification_token: verificationToken,
      password_last_changed: new Date(),
      lock_until: new Date('9999-12-31'),
      lastName,
      firstName,
      username,
      dateOfBirth
    });

    await PasswordHistory.create({
      user_id: newUser.id,
      hashed_password: newUser.password
    });

    const emailContent = `
      <div>
        <h1>Bienvenue sur Troupicool, ${email} !</h1>
        <p>Nous sommes ravis de vous compter parmi nous.</p>
        <p>Veuillez cliquer sur le lien ci-dessous pour vérifier votre compte :</p>
        <a href="${process.env.FRONT_END_URL}/verify-account?token=${verificationToken}">Vérifier mon compte</a>
        <p>Si vous n'avez pas créé de compte sur notre site, veuillez ignorer cet e-mail.</p>
      </div>
    `;

    try {
      await sendEmail(email, 'Bienvenue sur Troupicool!', emailContent);
      res.status(201).json({
        message: "Votre compte a été créé avec succès. Veuillez vérifier votre e-mail pour activer votre compte. Tant que vous n'aurez pas confirmé, votre compte restera bloqué.",
        user: newUser
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
      res.status(500).json({
        message: "Utilisateur créé, mais l'envoi de l'email a échoué.",
        emailError: error.message,
        userId: newUser.id,
        token: verificationToken
      });
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l’utilisateur', error: error.message });
  }
};

const verifyAccount = async (req, res) => {
  try {
      const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
      const user = await User.findOne({ where: { verification_token: req.params.token } });

      if (!user) {
          return res.status(404).json({ message: 'User not found or invalid token.' });
      }

      user.is_verified = true;
      user.verification_token = null;
      user.lock_until = null;

      await user.save();

      res.status(200).json({ message: 'Account verified successfully!' });
  } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
          return res.status(401).json({ message: 'Invalid verification token.' });
      }
      console.error('Error during account verification:', error);
      res.status(500).json({ message: 'An error occurred during account verification.' });
  }
};

const logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send({ message: 'An error occurred during logout.' });
        }
        res.clearCookie('connect.sid');
        res.status(200).send({ message: 'Logout successful' });
    });
};

const checkRole = async (req, res) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ role: user.role });
    } catch (error) {
        console.error('Error during role check:', error);
        res.status(500).json({ message: 'An error occurred during role check.' });
    }
};

module.exports = {
    login,
    forgotPassword,
    resetPassword,
    register,
    verifyAccount,
    logout,
    checkRole,
};
