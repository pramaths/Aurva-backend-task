const { GoogleGenerativeAI } = require("@google/generative-ai");
const { isValidImageType } = require("./fileUtils");

const { GoogleAIFileManager } = require("@google/generative-ai/server");

const scanImageWithGemini = async (file) => {
  if (!isValidImageType(file.mimetype)) {
    throw new Error(
      "Unsupported image type. Supported formats: JPG, PNG, WEBP, HEIC, HEIF"
    );
  }

  const image = {
    inlineData: {
      data: file.buffer.toString("base64"),
      mimeType: file.mimetype,
    },
  };

  const genAI = new GoogleGenerativeAI(process.env.API_KEY);

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

const scanPDFWithGemini = async (file) => {
  // Code for scanning PDF files with Gemini

  // Initialize GoogleGenerativeAI with your API_KEY.
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  // Initialize GoogleAIFileManager with your API_KEY.
  const fileManager = new GoogleAIFileManager(process.env.API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",  // Specify the model to use
  });

  try {
    // Upload the file dynamically using the uploaded file's original name
    const uploadResponse = await fileManager.uploadFile(file.originalname, {
      mimeType: file.mimetype,
      displayName: file.originalname,  // Use the uploaded file's name for display
    });

    // Generate content from the uploaded file, request a summary
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      { text: "Can you summarize this document as a bulleted list?" },
    ]);

    // Return the summarized text response
    return result.response.text();
  } catch (error) {
    console.error("Error during PDF scanning with Gemini:", error);
    throw new Error("Error scanning PDF with Gemini: " + error.message);
  }
};


module.exports = { scanImageWithGemini, scanPDFWithGemini };
