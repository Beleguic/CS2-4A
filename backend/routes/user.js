const express = require('express');
const router = express.Router();
const { User } = require('../models');
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


//register non securisé
router.post('/', async (req, res, next) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (e) {
        next(e)
    }
})

//search user
router.get('/:id', async (req, res, next) => {
    //parseInt car c'est un id (int) pas besoin si UUID
    const user = await User.findByPk(parseInt(req.param.id, 10));
    if (user) res.json(user);
    else res.sendStatus(404);
})

//delete user
router.delete('/:id', async (req, res, next) => {
    const nbDeleted = await User.destroy({
        where: {
            id: parseInt(req.params.id, 10),
        },
    });
    if (nbDeleted === 1) res.sendStatus(204);
    else {
        res.sendStatus(404)
    }
})

//upsert 
router.put("/:id", async (req, res, next) => {
  try {
    const nbDeleted = await User.destroy({
      where: {
        id: parseInt(req.params.id),
      },
    });
    const user = await User.create(req.body);
    res.status(nbDeleted ? 200 : 201).json(user);
  } catch (e) {
    next(e);
  }
});

//path
router.patch("/:id", async (req, res, next) => {
  try {
    const [nbUpdated, users] = await User.update(req.body, {
      where: {
        id: parseInt(req.params.id),
      },
        returning: true,
        individualHooks: true,
    });
    if (nbUpdated === 1) {
      res.json(users[0]);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    next(e);
  }
});


module.exports = router;