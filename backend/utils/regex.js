const SENSITIVE_PATTERNS = {
    PAN_CARD: /[A-Z]{5}[0-9]{4}[A-Z]{1}/,
    SSN: /\d{3}-\d{2}-\d{4}/,
    MEDICAL_RECORD: /\b\d{8,10}\b/,
    CREDIT_CARD: /\b(?:\d{4}[-\s]?){3}\d{4}\b/,
    HEALTH_INSURANCE: /\b[A-Z]{2}\d{10}\b/
  };
  
  const getCategoryForType = (type) => {
    switch(type) {
      case 'PAN_CARD': return 'PII';
      case 'SSN': return 'PII';
      case 'MEDICAL_RECORD': return 'PHI';
      case 'HEALTH_INSURANCE': return 'PHI';
      case 'CREDIT_CARD': return 'PCI';
      default: return 'Unknown';
    }
  };
  
  module.exports = {
    SENSITIVE_PATTERNS,
    getCategoryForType
  };