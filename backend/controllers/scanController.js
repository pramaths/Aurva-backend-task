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
    var geminiResult = await scanImageWithGemini(file);
    console.log("lol",geminiResult)

    const base64Image = convertImageToBase64(file.path);
    geminiResult = parseStringToJSON(geminiResult)
    const scanResult = new ScanResult({
      fileName: file.originalname,
      sensitiveData: (geminiResult),  // Save the raw JSON result (PII, PHI, PCI)
      base64Image: base64Image,     // Save the Base64 encoded image
    });

    console.log(scanResult)
    await scanResult.save();

    logger.info(`Image scanned successfully with Gemini: ${file.originalname}`, {
      geminiContent: geminiResult,
    });

    fs.unlinkSync(file.path);

    return scanResult; 
  } catch (error) {
    throw new Error('Error scanning image with Gemini: ' + error.message);
  }
};


const convertImageToBase64 = (filePath) => {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    throw new Error('Error converting image to Base64: ' + error.message);
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