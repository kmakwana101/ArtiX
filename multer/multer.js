const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../frontend/public/image'); // Specify the folder where files will be saved
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4(); // Generate a unique identifier using uuid
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
module.exports = upload;