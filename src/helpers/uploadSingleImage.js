let multer  = require('multer');
const path = require('path');
let storage = multer.diskStorage({

    destination:async function (req, file, cb) {
      cb(null, path.join(__dirname, '../../public'));
    },
    filename: async function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
});
module.exports=multer({ storage: storage,dest: path.join(__dirname, '../../public')});