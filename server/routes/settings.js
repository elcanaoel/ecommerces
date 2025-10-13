const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Settings = require('../models/Settings');
const { authenticate, isAdmin } = require('../middleware/auth');

// Get settings (public - for wallet addresses)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // Create default settings if none exist
    if (!settings) {
      settings = new Settings({
        walletAddresses: {
          BTC: process.env.BTC_WALLET_ADDRESS || '',
          ETH: process.env.ETH_WALLET_ADDRESS || '',
          USDT: process.env.USDT_WALLET_ADDRESS || ''
        }
      });
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error fetching settings' });
  }
});

// Update settings (admin only)
router.put('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { walletAddresses, siteName, siteDescription } = req.body;

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }

    if (walletAddresses) {
      if (walletAddresses.BTC !== undefined) settings.walletAddresses.BTC = walletAddresses.BTC;
      if (walletAddresses.ETH !== undefined) settings.walletAddresses.ETH = walletAddresses.ETH;
      if (walletAddresses.USDT !== undefined) settings.walletAddresses.USDT = walletAddresses.USDT;
    }

    if (siteName) settings.siteName = siteName;
    if (siteDescription) settings.siteDescription = siteDescription;

    settings.updatedAt = Date.now();
    await settings.save();

    res.json({
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error updating settings' });
  }
});

// Generate QR code for wallet address
router.post('/qrcode', async (req, res) => {
  try {
    const { address, cryptocurrency } = req.body;

    if (!address) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(address, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      qrCode: qrCodeDataURL,
      address,
      cryptocurrency
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({ message: 'Server error generating QR code' });
  }
});

module.exports = router;
