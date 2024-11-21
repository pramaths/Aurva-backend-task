const validImageTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
  ];
  
  
  const isValidImageType = (mimeType) => {
    return validImageTypes.includes(mimeType);
  };
  
  module.exports = { isValidImageType };