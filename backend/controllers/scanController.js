const fs = require('fs');
const { scanImageWithGemini, scanPDFWithGemini } = require('../utils/gemini');
const ScanResult = require('../models/ScanResult');
const logger = require('../utils/logger');

const MAX_RETRIES = 3; // Number of retries for Gemini scanning

exports.scanFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (req.file.mimetype.startsWith('image/')) {
      const scanResult = await handleImageScan(req.file);
      return res.status(201).json(scanResult);
    } else if (req.file.mimetype === 'application/pdf') {
      const scanResult = await handlePDFScan(req.file);
      return res.status(201).json(scanResult);
    } else {
      return res.status(400).json({ message: 'Invalid file type. Please upload an image or PDF.' });
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
    return await handleFileScan(file, scanImageWithGemini, 'image');
  } catch (error) {
    throw new Error('Error scanning image with Gemini: ' + error.message);
  }
};

const handlePDFScan = async (file) => {
  try {
    return await handleFileScan(file, scanPDFWithGemini, 'PDF');
  } catch (error) {
    throw new Error('Error scanning PDF with Gemini: ' + error.message);
  }
};

// Generalized function for handling scans with retries
const handleFileScan = async (file, geminiFunction, fileType) => {
  let attempt = 0;
  let geminiResult;
  let parsedGeminiResult;

  while (attempt < MAX_RETRIES) {
    try {
      // Call Gemini API
      geminiResult = await geminiFunction(file);

      // Attempt to parse the result
      parsedGeminiResult = parseStringToJSON(geminiResult);

      if (parsedGeminiResult) {
        break; // Exit loop on successful parsing
      } else {
        logger.warn(`Parsing failed for ${fileType} on attempt ${attempt + 1}, retrying...`);
      }
    } catch (error) {
      logger.error(`Gemini scan failed for ${fileType} on attempt ${attempt + 1}`, {
        error: error.message,
        fileName: file.originalname,
      });
    }

    attempt++;
    if (attempt >= MAX_RETRIES) {
      throw new Error(`Max retry attempts reached for ${fileType} scan`);
    }
  }

  return await processScanResult(file, geminiResult);
};

const processScanResult = async (file, geminiResult) => {
  const base64Content = convertBufferToBase64(file.buffer);
  const parsedGeminiResult = parseStringToJSON(geminiResult);

  const scanResult = new ScanResult({
    fileName: file.originalname,
    sensitiveData: parsedGeminiResult,
    base64Content,
  });

  await scanResult.save();

  logger.info(`File scanned successfully with Gemini: ${file.originalname}`, {
    geminiContent: parsedGeminiResult,
  });

  return scanResult;
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
    return JSON.parse(normalizedString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null; // Return null to indicate parsing failure
  }
}
