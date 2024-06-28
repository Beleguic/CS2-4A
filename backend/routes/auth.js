const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, PasswordHistory } = require('../models');
const router = express.Router();
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

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Authentication failed', loginAttempts: 0 });
        }

        // Vérifier si le compte est verrouillé
        if (user.lockUntil && user.lockUntil > new Date()) {
            const daysSinceLastChange = (new Date() - user.passwordLastChanged) / (1000 * 60 * 60 * 24);

            // Si le mot de passe doit être changé
            if (daysSinceLastChange > 60) {
                user.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Verrouillage pour 24 heures
                await sendPasswordResetEmail(user);
                return res.status(403).json({
                    message: 'Password needs to be renewed. An email has been sent.',
                    forcePasswordChange: true
                });
            }
            return res.status(401).json({ message: 'Account temporarily locked. Try again later.', loginAttempts: user.loginAttempts });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            if (user.loginAttempts >= 3) {
                user.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // Verrouillage pour 2 heures
                user.loginAttempts = 0;
                await user.save();
                await sendAccountLockedEmail(user);
                return res.status(401).json({
                    message: 'Account temporarily locked. Try again later.',
                    loginAttempts: user.loginAttempts,
                    lockUntil: user.lockUntil
                });
            }
            
            await user.save();
            return res.status(401).json({ message: 'Authentication failed', loginAttempts: user.loginAttempts });
        }

        // Réinitialiser les tentatives de connexion en cas de réussite
        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();

        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token, userId: user.id, role: user.role });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'An error occurred during login.' });
    }
});

async function sendAccountLockedEmail(user) {
    const lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // Calcul de la date de déblocage (2 heures plus tard)
    const formattedLockUntil = lockUntil.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

    const emailContent = `Votre compte a été verrouillé suite à plusieurs tentatives de connexion infructueuses. Vous pourrez réessayer de vous connecter le ${formattedLockUntil}.`;

    await sendEmail(user.email, "Sécurité du Compte", emailContent);
}

async function sendPasswordResetEmail(user) {
    const token = crypto.randomBytes(20).toString('hex');
    const expires = Date.now() + 3600000; // 1 heure

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetLink = `${process.env.FRONT_END_URL}/reset-password?token=${token}`;

    await sendEmail(user.email, 'Réinitialisation du mot de passe', `Vous devez renouveler votre mot de passe. Cliquez sur le lien suivant pour le réinitialiser : ${resetLink}`);
}

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const expires = Date.now() + 3600000; // 1 heure

        user.resetPasswordToken = token;
        user.resetPasswordExpires = expires;
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
});

router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { [Op.gt]: Date.now() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        // Vérifier l'historique des mots de passe
        const previousPasswords = await PasswordHistory.findAll({
            where: { user_id: user.id }
        });

        for (let entry of previousPasswords) {
            if (await bcrypt.compare(password, entry.hashed_password)) {
                const error = new Error('You cannot reuse an old password.');
                error.code = 400;
                throw error;
            }
        }

        user.password = password; // Le hashage sera fait par les hooks du modèle
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        user.passwordLastChanged = new Date();
        user.lockUntil = null;

        await user.save();

        // Enregistrer le nouveau mot de passe dans l'historique
        await PasswordHistory.create({
            user_id: user.id,
            hashed_password: user.password // Le hashage sera fait par les hooks du modèle
        });

        res.status(200).json({ message: 'Password reset successfully.' });
    } catch (error) {
        console.error('Error during password reset:', error);
        const statusCode = error.code || 500;
        res.status(statusCode).json({ message: 'An error occurred during password reset.' });
    }
});

if (!process.env.SMTP_HOST || !process.env.JWT_SECRET) {
    console.error("Missing required environment variables");
    process.exit(1);
}

router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        const newUser = await User.create({
            email,
            password,
            verificationToken,
            passwordLastChanged: new Date(),
            lockUntil: new Date('9999-12-31') // Verrouillage indéfini
        });

        await PasswordHistory.create({
            user_id: newUser.id,
            hashed_password: newUser.password // Le hashage sera fait par les hooks du modèle
        });

        const emailContent = `
            <div>
                <h1>Welcome to Troupicool, ${email}!</h1>
                <p>We're glad to have you with us.</p>
                <p>Please click the link below to verify your account:</p>
                <a href="${process.env.FRONT_END_URL}/verify-account?token=${verificationToken}">Verify my account</a>
                <p>If you did not create an account on our site, please ignore this email.</p>
            </div>
        `;

        try {
            await sendEmail(email, 'Welcome to Troupicool!', emailContent);
            res.status(201).json({
                message: "Account created successfully. Please check your email to activate your account.",
                user: newUser
            });
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).json({
                message: "User created, but email sending failed.",
                emailError: error.message,
                userId: newUser.id,
                token: verificationToken
            });
        }
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'An error occurred while creating the user.' });
    }
});

router.get('/verify/:token', async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { verificationToken: req.params.token } });

        if (!user) {
            return res.status(404).json({ message: 'User not found or invalid token.' });
        }

        user.isVerified = true;
        user.verificationToken = null;
        user.lockUntil = null;

        await user.save();

        res.status(200).json({ message: 'Account verified successfully!' });
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid verification token.' });
        }
        console.error('Error during account verification:', error);
        res.status(500).json({ message: 'An error occurred during account verification.' });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send({ message: 'An error occurred during logout.' });
        }
        res.clearCookie('connect.sid');
        res.status(200).send({ message: 'Logout successful' });
    });
});

router.get('/check-role', async (req, res) => {
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
});

module.exports = router;
