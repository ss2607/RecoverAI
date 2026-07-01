const qrService = require('../services/qrService');

exports.generateLink = async (req, res) => {
  try {
    const { itemId } = req.body;
    const link = await qrService.generateQRLink(itemId);
    res.status(201).json({ link });
  } catch (error) {
    res.status(500).json({ message: 'Error generating QR link', error: error.message });
  }
};

exports.scanCode = async (req, res) => {
  try {
    const { code } = req.params;
    const item = await qrService.getItemByQRCode(code);
    res.json(item);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
