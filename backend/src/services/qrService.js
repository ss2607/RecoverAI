const QRCode = require('../models/QRCode');
const crypto = require('crypto');

exports.generateQRLink = async (itemId) => {
  const uniqueCode = crypto.randomBytes(8).toString('hex');
  const qrCode = new QRCode({
    item: itemId,
    uniqueCode
  });
  await qrCode.save();
  
  // Return a link that the frontend will handle
  return `/qr/scan/${uniqueCode}`;
};

exports.getItemByQRCode = async (uniqueCode) => {
  const qrCode = await QRCode.findOne({ uniqueCode, isActive: true }).populate('item');
  if (!qrCode) throw new Error('Invalid or inactive QR code');
  return qrCode.item;
};
