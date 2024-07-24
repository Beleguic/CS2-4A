const { Category, Product, User } = require('../models');
const Joi = require('joi');

const categorySchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  url: Joi.string().regex(/^[a-zA-Z0-9-]+$/).required(),
  description: Joi.string().optional(),
  image: Joi.string().optional(),
  is_active: Joi.boolean().optional()
});

const isAdmin = (user) => user.role === 'admin';

const getAllCategoriesForSelection = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name']
    });
    return res.status(200).json(categories);
  } catch (e) {
    return res.sendStatus(500);
  }
};

const getAllCategories = async (req, res, next) => {
  const isFrontend = req.query.frontend === 'true';
  const isSorting = req.query.sorting === 'true';
  const url = req.query.url;
  
  let whereCondition = {};

  if (isFrontend) {
    whereCondition.is_active = true;
    if (url) {
      whereCondition.url = url;
    }
  }

  const attributesCondition = isFrontend && isSorting ? ['name'] : undefined;

  try {
    const categories = await Category.findAll({
      where: {
        ...whereCondition
      },
      attributes: attributesCondition,
      include: isFrontend ? [
        {
          model: Product,
          as: 'products',
          through: { attributes: [] }
        }
      ] : []
    });

    if (categories.length <= 0) {
      return res.sendStatus(404);
    }

    return res.status(200).json(categories);
  } catch (e) {
    return res.sendStatus(500);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const isFrontend = req.query.frontend === 'true';
    const whereCondition = isFrontend
      ? { is_active: true, name: id }
      : { id: id };

    const category = await Category.findOne({
      where: whereCondition,
    });

    if (category) {
      return res.status(200).json(category);
    } else {
      return res.sendStatus(404);
    }
  } catch (e) {
    return res.sendStatus(500);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const requestingUser = await User.findByPk(req.userData.userId);

    if (!isAdmin(requestingUser)){
      return res.sendStatus(404);
    }

    const { error } = categorySchema.validate(req.body);
    if (error) {
      return res.sendStatus(404).json({ error: error.details[0].message });
    }

    await Category.create(req.body);
    return res.sendStatus(201);
  } catch (e) {
    return res.sendStatus(500);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const requestingUser = await User.findByPk(req.userData.userId);

    if(!isAdmin(requestingUser)){
      return res.sendStatus(404);
    }

    const { error } = categorySchema.validate(req.body);
    if (error) {
      return res.status(404);
    }

    const category = await Category.findByPk(req.params.id);

    console.log("category", category);

    if (category) {
      const awaitCategory = await category.update(req.body);
      return res.status(200).json(awaitCategory);
    } else {
      return res.sendStatus(404);
    }
  } catch (e) {
    return res.sendStatus(500);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const requestingUser = await User.findByPk(req.userData.userId);

    if(!isAdmin(requestingUser)){
      return res.sendStatus(404);
    }

    const nbDeleted = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (nbDeleted === 1) {
      return res.sendStatus(204);
    } else {
      return res.sendStatus(404);
    }
  } catch (e) {
    return res.status(500);
  }
};

module.exports = {
  getAllCategoriesForSelection,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
