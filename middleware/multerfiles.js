const multer = require('multer');
const path = require('path');
var maxSize = 1 * 100000000 * 100000000;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("===>",file)
        return cb(null,"./uploads")
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})
const upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: async function (req, file, callback) {
        var ext = path.extname(file.originalname);
        // if(ext !== '.pdf' && ext !== '.doc' && ext !== '.xml' && ext !== '.txt' ) {
        //     return callback(new Error('Only pdf are allowed'));
        // }
        //I want next function to validate real ext of files here. 
        callback(null, true); 
      },
    
});

module.exports = upload