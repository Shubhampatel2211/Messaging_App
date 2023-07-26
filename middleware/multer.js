// const multer = require('multer')
// const storage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		return cb(null, "./uploads")
// 	},
// 	filename: (req, file, cb) => {
// 		cb(null, Date.now() + "-" + file.originalname)
// 	},
// })

// const upload = multer({
// 	storage: storage,
// 	fileFilter: (req, file, cb) => {
// 		var allowedMimes = ['image/jpg', 'image/jpeg', 'image/png'];
// 		if (allowedMimes.includes(file.mimetype)) {
// 			cb(null, true);
// 		} else {
// 			cb({
// 				success: false,
// 				message: 'Invalid file type. Only jpg, png ,jpeg image files are allowed.'
// 			}, false);
// 		}
// 		console.log("file.mimetype============>", file.mimetype)
// 	}
// });





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
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' ) {
            return callback(new Error('Only images are allowed'));
        }
        // I want next function to validate real ext of files here. 
        callback(null, true); 
      },
    
});


module.exports = upload