// services/alertService.js
const { Alert, Product, Category, User, AlertType } = require('../models');
const mailService = require('./mailService');

const checkAndSendAlerts = async () => {
  // Fetch all alerts
  const alerts = await Alert.findAll({
    include: [
      { model: Product, as: 'product' },
      { model: Category, as: 'category' },
      { model: User, as: 'user' },
      { model: AlertType, as: 'alertType' }
    ]
  });

  // Check each alert's condition
  for (const alert of alerts) {
    let sendEmail = false;
    let emailContent = '';

    // Example: Check for restock alert
    if (alert.alertType.type === 'restock' && alert.product && alert.product.stock > 0) {
      sendEmail = true;
      emailContent = `<p>Le produit ${alert.product.name} est de nouveau en stock !</p>`;
    }

    // Example: Check for price change alert
    if (alert.alertType.type === 'priceChange' && alert.product && alert.product.price < alert.product.previousPrice) {
      sendEmail = true;
      emailContent = `<p>Le prix du produit ${alert.product.name} a baissé !</p>`;
    }

    // Example: Check for promotion alert
    if (alert.alertType.type === 'promotion' && alert.product && alert.product.isOnPromotion) {
      sendEmail = true;
      emailContent = `<p>Le produit ${alert.product.name} est en promotion !</p>`;
    }

    // Send email if condition met
    if (sendEmail) {
      await mailService.sendEmail(alert.user.email, 'Notification d\'alerte', emailContent);
    }
  }
};

module.exports = {
  checkAndSendAlerts
};
