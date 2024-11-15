const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Order = sequelize.define('order', {
  orderId: {
    type: Sequelize.STRING,
    allowNull: false,  
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  paymentId: {
    type: Sequelize.STRING,
    allowNull: true,  
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
        isIn: [['created', 'completed', 'failed', 'pending','CREATED', 'COMPLETED', 'FAILED', 'SUCCESSFUL', 'PENDING']] // Optional: restrict to specific values
    }
}
});


module.exports = Order;
