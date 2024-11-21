const mongoose = require('mongoose');

const ScanResultSchema = new mongoose.Schema({
  fileName: { 
    type: String, 
    required: true 
  },
  sensitiveData: {  // Store the raw JSON result (PII, PHI, PCI)
    type: Object,
    required: true,
  },
  base64Image: {  // Store the Base64-encoded image
    type: String,
    required: true,
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('ScanResult', ScanResultSchema);
