const { sendEmail } = require('./mailService');
const Alert = require('../mongo/models/Alert');
const AlertType = require('../mongo/models/AlertType');
const User = require('../mongo/models/User');
const Product = require('../mongo/models/Product');

const sendNewProductAlerts = async (categoryProduct) => {
  try {
    const alertType = await AlertType.findOne({ type: 'nouveau produit dans la catégorie' });
    if (!alertType) {
      throw new Error('Type d\'alerte pour nouveau produit dans la catégorie introuvable');
    }

    const alerts = await Alert.find({ category_id: categoryProduct.category_id, alert_type_id: alertType._id })
      .populate('user')
      .populate('alertType');

    for (const alert of alerts) {
      const user = alert.user;
      const emailContent = `
        <p>Bonjour ${user.username},</p>
        <p>Un nouveau produit a été ajouté dans la catégorie que vous suivez.</p>
      `;

      await sendEmail(user.email, 'Nouveau produit dans la catégorie', emailContent);
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications par email:', error);
  }
};

const sendRestockAlerts = async (stock) => {
  try {
    const alertType = await AlertType.findOne({ type: 'restock' });
    if (!alertType) {
      throw new Error('Type d\'alerte pour restock introuvable');
    }

    const alerts = await Alert.find({ product_id: stock.product_id, alert_type_id: alertType._id })
      .populate('user')
      .populate('product');

    for (const alert of alerts) {
      const user = alert.user;
      const product = alert.product;
      const emailContent = `
        <p>Bonjour ${user.username},</p>
        <p>Le produit <strong>${product.name}</strong> a été réapprovisionné.</p>
      `;

      await sendEmail(user.email, 'Notification de réapprovisionnement', emailContent);
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications de réapprovisionnement par email:', error);
  }
};

const sendPromotionAlerts = async (productPromotion) => {
  try {
    const alertType = await AlertType.findOne({ type: 'promotion' });
    if (!alertType) {
      throw new Error('Type d\'alerte pour promotion introuvable');
    }

    const alerts = await Alert.find({ product_id: productPromotion.product_id, alert_type_id: alertType._id })
      .populate('user')
      .populate('product');

    for (const alert of alerts) {
      const user = alert.user;
      const product = alert.product;
      const emailContent = `
        <p>Bonjour ${user.username},</p>
        <p>Le produit <strong>${product.name}</strong> est actuellement en promotion.</p>
      `;

      await sendEmail(user.email, 'Notification de promotion', emailContent);
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications de promotion par email:', error);
  }
};
const sendPriceChangeAlerts = async (product) => {
  try {
    const alertType = await AlertType.findOne({ type: 'changement de prix' });
    if (!alertType) {
      throw new Error('Type d\'alerte pour changement de prix introuvable');
    }

    const alerts = await Alert.find({ product_id: product._id, alert_type_id: alertType._id })
      .populate('user');

    for (const alert of alerts) {
      const user = alert.user;
      const emailContent = `
        <p>Bonjour ${user.username},</p>
        <p>Le prix du produit <strong>${product.name}</strong> a changé.</p>
      `;

      await sendEmail(user.email, 'Notification de changement de prix', emailContent);
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications de changement de prix par email:', error);
  }
};

module.exports = {
    sendNewProductAlerts,
    sendRestockAlerts,
    sendPromotionAlerts,
    sendPriceChangeAlerts,
};
