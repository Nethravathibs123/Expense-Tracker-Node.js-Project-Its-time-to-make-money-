
const express = require('express');

const purchaseController = require('../controllers/purchase');
const userauthenticate = require('../middleware/auth');

const router = express.Router();

router.get('/premiummembership', userauthenticate, purchaseController.purchasePremium);

router.post('/updatetransactionstatus',userauthenticate, purchaseController.updateTransactionStatus);

router.post('/updateMembership', userauthenticate, purchaseController.updateMembership);

module.exports = router;
