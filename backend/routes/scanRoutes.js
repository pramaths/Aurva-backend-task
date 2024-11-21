const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');
const uploadHandler = require('../config/multer');
const createRateLimiter = require('../middleware/rateLimiter');

// Apply rate limiting to scan route
/**
 * @swagger
 * tags:
 *   name: File Scan
 *   description: Endpoints for file scanning and sensitive field detection.
 */

/**
 * @swagger
 * /api/scan:
 *   post:
 *     summary: Scan an uploaded file for sensitive information
 *     description: Uploads a file, scans it for sensitive fields using OCR and text-based scanning, and saves the result in the database.
 *     tags: [File Scan]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload and scan.
 *     responses:
 *       201:
 *         description: File scanned successfully, and results saved in the database.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID of the saved scan result.
 *                   example: 648a06d5e77b4d1f946c64a1
 *                 fileName:
 *                   type: string
 *                   description: Name of the uploaded file.
 *                   example: document.pdf
 *                 sensitiveFields:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of detected sensitive fields.
 *                   example: ["Credit Card Number", "SSN"]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp of the scan result creation.
 *       400:
 *         description: No file uploaded or invalid file.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No file uploaded
 *       500:
 *         description: Server error occurred while scanning the file.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File scanning error
 */

router.post(
  '/scan', 
  createRateLimiter({ max: 10 }), 
  uploadHandler, 
  scanController.scanFile
);

module.exports = router;