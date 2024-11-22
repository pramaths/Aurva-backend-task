const { GoogleGenerativeAI } = require("@google/generative-ai");
const { isValidImageType } = require("./fileUtils");
const fs = require("fs");
const path = require("path");
const os = require("os");

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

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash",  systemInstruction: `Always generate an output in JSON formate only, with the following structure:
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
    }
      if you feel like there are other sensitive information, please include them in the output.
      eg:{
      "PII": {
        "name": "John Doe",
        "email": " [email protected]"},
        "PHI": {
  },
  "PCI": {
        }
  }, Guideline: Always generate an output in JSON format only.`, });

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
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const fileManager = new GoogleAIFileManager(process.env.API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", 
    systemInstruction: `Always generate an output in JSON format only, with the following structure:
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
    }
      if you feel like there are other sensitive information, please include them in the output.
      eg:{
      "PII": {
        "name": "John Doe",
        "email": " [email protected]"},
        "PHI": {
  },
  "PCI": {
        }
  }, Guideline: Always generate an output in JSON format only.`,
  });

  try {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-scan-'));
    
    const tempFilePath = path.join(tempDir, file.originalname);
    
    fs.writeFileSync(tempFilePath, file.buffer);

    const uploadResponse = await fileManager.uploadFile(tempFilePath, {
      mimeType: file.mimetype,
      displayName: file.originalname,
    });

    // Generate content from the uploaded file
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      {
        text: `file may contain PII (Personally Identifiable Information), PHI (Protected Health Information), or PCI (Payment Card Information). 
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
      },
    ]);

    fs.rmSync(tempDir, { recursive: true, force: true });

    return result.response.text();
  } catch (error) {
    console.error("Error during PDF scanning with Gemini:", error);
    throw new Error("Error scanning PDF with Gemini: " + error.message);
  }
};


module.exports = { scanImageWithGemini, scanPDFWithGemini };
