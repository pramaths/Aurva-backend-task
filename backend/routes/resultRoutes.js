const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const createRateLimiter = require('../middleware/rateLimiter');

/**
 * Swagger setup for API documentation.
 * @swagger
 * tags:
 *   name: Scan Results
 *   description: Endpoints for managing scan results.
 */

/**
 * Route to get paginated scan results.
 * @swagger
 * /api/scan-results:
 *   get:
 *     summary: Retrieve paginated scan results
 *     description: Fetches scan results with pagination. Excludes the raw file data from the response.
 *     tags: [Scan Results]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page.
 *     responses:
 *       200:
 *         description: Successfully retrieved paginated scan results.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ScanResult'
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 *       500:
 *         description: Server error occurred while fetching scan results.
 */
router.get('/scan-results', createRateLimiter({ max: 10 }), resultController.getScanResults);

/**
 * Route to delete a scan result by ID.
 * @swagger
 * /api/scan-results/{id}:
 *   delete:
 *     summary: Delete a specific scan result
 *     description: Deletes a scan result by its ID.
 *     tags: [Scan Results]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the scan result to delete.
 *     responses:
 *       200:
 *         description: Successfully deleted the scan result.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Scan result deleted successfully
 *       404:
 *         description: Scan result not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Scan result not found
 *       500:
 *         description: Server error occurred while deleting scan result.
 */
router.delete('/scan-results/:id', createRateLimiter({ max: 5 }), resultController.deleteScanResult);

module.exports = router;
