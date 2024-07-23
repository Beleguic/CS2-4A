const { PromotionCode } = require('../models');
const Joi = require('joi');

// PromotionCode schema validation
const promotionCodeSchema = Joi.object({
  code: Joi.string().required(),
  reduction: Joi.number().required().min(1).max(100),
  start_at: Joi.date().allow(null),
  end_at: Joi.date().allow(null),
});

const getAllPromotionCodes = async (req, res, next) => {
  try {
    const { code } = req.query;

    let queryOptions = {};

    if (code) {
      queryOptions.where = { code: code };
    }

    const codes = await PromotionCode.findAll(queryOptions);

    res.json(codes);
  } catch (e) {
    next(e);
  }
};

const getPromotionCodeById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const promotionCode = await PromotionCode.findByPk(id);
    if (promotionCode) {
      res.json(promotionCode);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    next(e);
  }
};

const createPromotionCode = async (req, res, next) => {
  try {
    const { error } = promotionCodeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const promotionCode = await PromotionCode.create(req.body);
    res.status(201).json(promotionCode);
  } catch (e) {
    next(e);
  }
};

const updatePromotionCode = async (req, res, next) => {
  try {
    const { error } = promotionCodeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const promotionCode = await PromotionCode.findByPk(req.params.id);

    if (promotionCode) {
      await promotionCode.update(req.body);
      res.json(promotionCode);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    next(e);
  }
};

const deletePromotionCode = async (req, res, next) => {
  try {
    const nbDeleted = await PromotionCode.destroy({
      where: {
        id: req.params.id,
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
};

module.exports = {
  getAllPromotionCodes,
  getPromotionCodeById,
  createPromotionCode,
  updatePromotionCode,
  deletePromotionCode,
};
