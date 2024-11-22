const multer = require('multer');

const storage = multer.memoryStorage(); // Use memory storage for temporary file storage
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

const uploadHandler = (req, res, next) => {
  const multerUpload = upload.single('file');
  multerUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

module.exports = uploadHandler;
