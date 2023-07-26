const express = require('express');
const User=require('../model/user')
const UserController = require('../controller/usercontroller');
const authMiddleware = require('../middleware/auth');
const upload= require('../middleware/multer')
const profile= require('../middleware/profilemulter')

const files=require('../middleware/multerfiles')
const router= express.Router()

router.post('/user_register',profile.single("image"),UserController.user_register)

router.post('/update_profile',profile.single("image"),UserController.update_profile)

router.post('/user_login',UserController.user_login)

router.post('/logout',UserController.logout)

router.post('/imageupload',upload.single("image"),UserController.imageupload)

router.post('/dataupload',files.single("files"),UserController.filesupload)

module.exports=router;
