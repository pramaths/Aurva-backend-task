const fs = require('fs');
const tesseract = require('tesseract.js');
const { SENSITIVE_PATTERNS, getCategoryForType } = require('./regex');
const logger = require('./logger');

const scanFileContent = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const sensitiveFields = [];

    for (const [type, regex] of Object.entries(SENSITIVE_PATTERNS)) {
      const matches = content.match(new RegExp(regex, 'g')) || [];
      if (matches.length > 0) {
        sensitiveFields.push({
          type,
          category: getCategoryForType(type),
          count: matches.length
        });
      }
    }

    return sensitiveFields;
  } catch (error) {
    logger.error('Error scanning file content', { error, filePath });
    return [];
  }
};

const performOCRScan = async (filePath) => {
  try {
    const { data: { text } } = await tesseract.recognize(filePath);
    console.log(text);
    
    const sensitiveFields = [];
    for (const [type, regex] of Object.entries(SENSITIVE_PATTERNS)) {
      const matches = text.match(new RegExp(regex, 'g')) || [];
      if (matches.length > 0) {
        sensitiveFields.push({
          type,
          category: getCategoryForType(type),
          count: matches.length
        });
      }
    }

    return sensitiveFields;
  } catch (error) {
    logger.error('OCR scanning error', { error, filePath });
    return [];
  }
};

const mergeResults = (...resultArrays) => {
  const mergedResults = {};
  
  resultArrays.forEach(results => {
    results.forEach(result => {
      if (!mergedResults[result.type]) {
        mergedResults[result.type] = result;
      } else {
        mergedResults[result.type].count += result.count;
      }
    });
  });

  return Object.values(mergedResults);
};

module.exports = {
  scanFileContent,
  performOCRScan,
  mergeResults
};