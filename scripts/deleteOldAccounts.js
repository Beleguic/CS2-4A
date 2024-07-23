const { User } = require('../models');
const { Op } = require('sequelize');

const deleteOldAccounts = async () => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);

  try {
    const usersToDelete = await User.findAll({
      where: {
        deletion_requested_at: {
          [Op.lt]: cutoffDate
        }
      }
    });

    for (const user of usersToDelete) {
      await user.destroy();
      console.log(`Deleted user with ID: ${user.id}`);
    }
  } catch (error) {
    console.error('Error deleting old accounts:', error);
  }
};


deleteOldAccounts();
