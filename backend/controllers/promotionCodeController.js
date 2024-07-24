const PromotionCode = require('../mongo/models/PromotionCode');
const Joi = require('joi');

const promotionCodeSchema = Joi.object({
  code: Joi.string().required(),
  reduction: Joi.number().required().min(1).max(100),
  start_at: Joi.date().optional(),
  end_at: Joi.date().optional()
});

const getAllPromotionCodes = async (req, res, next) => {
  try {
    const { code } = req.query;

    let queryOptions = {};

    if (code) {
      queryOptions = { code: code };
    }

    const codes = await PromotionCode.find(queryOptions);
    res.status(200).json(codes);
  } catch (e) {
    console.error('Error fetching promotion codes:', e);
    next(e);
  }
};

const getPromotionCodeById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const promotionCode = await PromotionCode.findById(id);
    if (promotionCode) {
      res.status(200).json(promotionCode);
    } else {
      res.status(404).json({ message: 'Promotion code not found' });
    }
  } catch (e) {
    console.error('Error fetching promotion code by ID:', e);
    next(e);
  }
};

const createPromotionCode = async (req, res, next) => {
  try {
    const { error } = promotionCodeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const code = new PromotionCode(req.body);
    await code.save();
    res.status(201).json(code);
  } catch (e) {
    console.error('Error creating promotion code:', e);
    next(e);
  }
};

const updatePromotionCode = async (req, res, next) => {
  try {
    const { error } = promotionCodeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const promotionCode = await PromotionCode.findById(req.params.id);
    if (promotionCode) {
      Object.assign(promotionCode, req.body);
      await promotionCode.save();
      res.status(200).json(promotionCode);
    } else {
      res.status(404).json({ message: 'Promotion code not found' });
    }
  } catch (e) {
    console.error('Error updating promotion code:', e);
    next(e);
  }
};

const deletePromotionCode = async (req, res, next) => {
  try {
    const code = await PromotionCode.findById(req.params.id);
    if (code) {
      await code.remove();
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Promotion code not found' });
    }
  } catch (e) {
    console.error('Error deleting promotion code:', e);
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
