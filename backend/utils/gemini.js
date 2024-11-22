const { GoogleGenerativeAI } = require("@google/generative-ai"); 
const { isValidImageType } = require('./fileUtils'); 
const scanImageWithGemini = async (file) => {
  if (!isValidImageType(file.mimetype)) {
    throw new Error('Unsupported image type. Supported formats: JPG, PNG, WEBP, HEIC, HEIF');
  }

  const image = {
    inlineData: {
      data: file.buffer.toString('base64'), 
      mimeType: file.mimetype,             
    },
  };

  const genAI = new GoogleGenerativeAI(process.env.API_KEY);

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent([
    `Image may contain PII (Personally Identifiable Information), PHI (Protected Health Information), or PCI (Payment Card Information). 
    Extract the details properly and return the result in JSON format only:
    {
      "PII": {
        structured output
      },
      "PHI": {
        structured output
      },
      "PCI": {
        structured output
      }
    }`,
    image,
  ]);

  return result.response.text();
};

module.exports = { scanImageWithGemini };
