const ScanResult = require('../models/ScanResult');
const logger = require('../utils/logger');

exports.getScanResults = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch results with pagination, sorting by timestamp
    const [results, totalResults] = await Promise.all([
      ScanResult.find()
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .select('-rawFile'), // Exclude raw file data (which we don't need)
      ScanResult.countDocuments() 
    ]);

    res.json({
      results,
      currentPage: page,
      totalPages: Math.ceil(totalResults / limit),
      totalResults
    });
  } catch (error) {
    logger.error('Error fetching scan results', { error });
    next(error);
  }
};

exports.deleteScanResult = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await ScanResult.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: 'Scan result not found' });
    }

    logger.info(`Scan result deleted: ${id}`);

    res.status(200).json({ message: 'Scan result deleted successfully' });
  } catch (error) {
    logger.error('Error deleting scan result', {
      error,
      id: req.params.id
    });
    next(error); 
  }
};
