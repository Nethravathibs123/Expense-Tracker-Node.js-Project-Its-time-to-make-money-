const Sequelize=require('sequelize');
const sequelize=require('../util/database')

const Order = sequelize.define('orders', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    paymentId: {
        type: Sequelize.STRING,
        allowNull: true
    },
    orderId: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isIn: [['created', 'completed', 'failed', 'pending','CREATED', 'COMPLETED', 'FAILED', 'PENDING']] // Optional: restrict to specific values
        }
    }
});


module.exports=Order;