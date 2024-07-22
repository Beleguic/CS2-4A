const { sendEmail } = require('./mailService');

const sendNewProductAlerts = async (categoryProduct) => {
  const { Alert, AlertType, User } = require('../models');
  try {
    const alertType = await AlertType.findOne({ where: { type: 'nouveau produit dans la catégorie' } });
    if (!alertType) {
      throw new Error('Type d\'alerte pour nouveau produit dans la catégorie introuvable');
    }

    const alerts = await Alert.findAll({
      where: {
        category_id: categoryProduct.category_id,
        alert_type_id: alertType.id,
      },
      include: [
        { model: User, as: 'user', attributes: ['email', 'username'] },
        { model: AlertType, as: 'alertType', attributes: ['type'] },
      ],
    });

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
  const { Alert, AlertType, User, Product } = require('../models');
  try {
    const alertType = await AlertType.findOne({ where: { type: 'restock' } });
    if (!alertType) {
      throw new Error('Type d\'alerte pour restock introuvable');
    }

    const alerts = await Alert.findAll({
      where: {
        product_id: stock.product_id,
        alert_type_id: alertType.id,
      },
      include: [
        { model: User, as: 'user', attributes: ['email', 'username'] },
        { model: Product, as: 'product', attributes: ['name'] },
      ],
    });

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
  const { Alert, AlertType, User, Product } = require('../models');
  try {
    const alertType = await AlertType.findOne({ where: { type: 'promotion' } });
    if (!alertType) {
      throw new Error('Type d\'alerte pour promotion introuvable');
    }

    const alerts = await Alert.findAll({
      where: {
        product_id: productPromotion.product_id,
        alert_type_id: alertType.id,
      },
      include: [
        { model: User, as: 'user', attributes: ['email', 'username'] },
        { model: Product, as: 'product', attributes: ['name'] },
      ],
    });

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
  const { Alert, AlertType, User } = require('../models');
  try {
    const alertType = await AlertType.findOne({ where: { type: 'changement de prix' } });
    if (!alertType) {
      throw new Error('Type d\'alerte pour changement de prix introuvable');
    }

    const alerts = await Alert.findAll({
      where: {
        product_id: product.id,
        alert_type_id: alertType.id,
      },
      include: [
        { model: User, as: 'user', attributes: ['email', 'username'] },
      ],
    });

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
