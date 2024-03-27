const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('fileFromUser'); // 'fileFromUser' est le nom de la clé dans la requête

const uploadFile = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, error: err.message });
    } else if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    next();
  });
};

module.exports = 
{uploadFile};