const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.resolve(__dirname, '../../uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'text/plain', 
    'application/pdf', 
    'image/jpeg', 
    'image/png', 
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});

const uploadHandler = (req, res, next) => {
  const multerUpload = upload.single('file');
  multerUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Handle Multer errors (e.g., file too large)
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // Handle custom errors
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

module.exports = uploadHandler;
