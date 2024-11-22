const fs = require('fs');
const { scanImageWithGemini } = require('../utils/gemini');
const ScanResult = require('../models/ScanResult');
const logger = require('../utils/logger');

exports.scanFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check if the uploaded file is an image
    if (req.file.mimetype.startsWith('image/')) {
      const scanResult = await handleImageScan(req.file);
      return res.status(201).json(scanResult);
    } else {
      return res.status(400).json({ message: 'Invalid file type. Please upload an image.' });
    }
  } catch (error) {
    logger.error('File scanning error', {
      error: error.message,
      fileName: req.file?.originalname,
    });

    next(error);
  }
};


const handleImageScan = async (file) => {
  try {
    const geminiResult = await scanImageWithGemini(file); // Pass file directly if scanImageWithGemini supports buffer
    console.log('lol', geminiResult);

    const base64Image = convertBufferToBase64(file.buffer);
    const parsedGeminiResult = parseStringToJSON(geminiResult);

    const scanResult = new ScanResult({
      fileName: file.originalname,
      sensitiveData: parsedGeminiResult, // Save the raw JSON result (PII, PHI, PCI)
      base64Image,                      // Save the Base64 encoded image
    });

    console.log(scanResult);
    await scanResult.save();

    logger.info(`Image scanned successfully with Gemini: ${file.originalname}`, {
      geminiContent: parsedGeminiResult,
    });

    return scanResult; 
  } catch (error) {
    throw new Error('Error scanning image with Gemini: ' + error.message);
  }
};

const convertBufferToBase64 = (buffer) => {
  try {
    return buffer.toString('base64');
  } catch (error) {
    throw new Error('Error converting buffer to Base64: ' + error.message);
  }
};



function parseStringToJSON(inputString) {
  const cleanedString = inputString.replace(/^```json\n/, '').replace(/```$/, '').trim();
  const normalizedString = cleanedString.replace(/\s+/g, ' ');
  
  try {
    const jsonObject = JSON.parse(normalizedString);
    return jsonObject;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null; 
  }
}