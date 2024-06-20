const { Router } = require("express");
const Category = require("../models/category");
const router = new Router();

router.get("/", async (req, res, next) => {
    const categories = await Category.findAll({
        where: req.query,
    });
    res.json(categories);
});

router.patch("/edit/:id", async (req, res, next) => {
    try {
        const category = await Category.findByPk(req.params.id);

        if (category) {
            res.json(category);
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
        next(e);
    }
});

router.post("/new", async (req, res, next) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (e) {
        next(e);
    }
});

router.delete("/delete/:id", async (req, res, next) => {
    try {
        const nbDeleted = await Category.destroy({
            where: {
                id: parseInt(req.params.id),
            },
        });
        if (nbDeleted === 1) {
            res.sendStatus(204);
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
        next(e);
    }
});

module.exports = router;
