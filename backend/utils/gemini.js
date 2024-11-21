const { GoogleGenerativeAI } = require("@google/generative-ai");
// Assuming you have this SDK installed
const { isValidImageType } = require('./fileUtils');
const fs = require('fs');

const scanImageWithGemini = async (file) => {
  if (!isValidImageType(file.mimetype)) {
    throw new Error('Unsupported image type. Supported formats: JPG, PNG, WEBP, HEIC, HEIF');
  }

  // Upload the image file to Gemini
  const imageBuffer = fs.readFileSync(file.path);
  
  // Prepare the image data as base64 encoding for the inlineData format
  const image = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: file.mimetype,
    },
  };
  // Use the uploaded file URI for further processing
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent([
    `Image may contain PII (Personally Identifiable Information), PHI (Protected Health Information), or PCI (Payment Card Information).
    extract the detials properly and return the result in json fomate only.
    {
      "PII":{
      structred output
      }
      " PHI":{
      structred output
      }
      "PCI":{
      structred output
      }
    }`,
    image,
  ]);

  // Return the text response from Gemini
  return result.response.text();
};

module.exports = { scanImageWithGemini };
