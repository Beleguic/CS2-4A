const express = require('express');
const router = express.Router();
const User = require('../models/user');
const checkAuth = require('../middlewares/checkAuth');



router.get('/:userId', checkAuth, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ email: user.email, id: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
  }
});



// router.post('/logout', (req, res) => {
//   req.session.destroy(err => {
//     if (err) {
//       return res.status(500).send({ message: 'Erreur lors de la déconnexion' });
//     }
//     res.clearCookie('connect.sid'); // Assurez-vous que le nom du cookie est correct
//     res.status(200).send({ message: 'Déconnexion réussie' });
//   });
// });


module.exports = router;