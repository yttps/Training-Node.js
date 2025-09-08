var express = require('express');
var router = express.Router();
var userSchema = require('../models/user.model');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenMiddleware = require('../middleware/token.middleware');

const storage = multer.diskStorage({
  destination: function (req, file, cd) {
    cd(null, './public/images')
  },
  filename: function (req, file, cd) {
    cd(null, new Date().getTime() + "-" + file.originalname)
  }
});

const upload = multer({ storage: storage })

/* GET users listing. */
// router.get('/', async function (req, res, next) {

//   try {

//     let token = req.headers.authorization;
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await userSchema.findById(decoded.id);

//     if (!user) {
//       return res.status(404).json({ error: "ไม่พบ User Admin" });
//     }

//     let users = await userSchema.find({});
//     res.send(users);

//   } catch (error) {
//     if (error.name === "TokenExpiredError") {
//       return res.status(401).json({ error: "TokenExpired" });
//     } else if (error.name === "JsonWebTokenError") {
//       return res.status(401).json({ error: "Invalid token" });
//     } else {
//       console.error("Server Error:", error);
//       res.status(500).json({ error: "Server error" });
//     }
//   }

// });

//post image
//ไม่ได้ใช้
router.post('/', [tokenMiddleware, upload.single('image')], async function (req, res, next) {

  try {

    let { username, password, role } = req.body;

    let user = new userSchema({
      username: username,
      password: await bcrypt.hash(password, 10),
      role: role
    });

    //use bcrypt.compare 

    let token = await jwt.sign({ foo: "bar" }, "1234")

    console.log(token);
    await user.save();
    res.send(token);

  } catch (error) {
    res.send(error);
  }
});

router.put('/:id', async function (req, res, next) {

  try {

    let { name, age, email, phone } = req.body;
    let { id } = req.params;

    let user = await userSchema.findByIdAndUpdate(id, {
      name,
      age,
      email,
      phone
    }, { new: true });

    res.send(user);
    console.log("Update data successfully!")

  } catch (error) {
    res.send(error);
  }
});

router.delete('/:id', async function (req, res, next) {

  let { id } = req.params;
  let users = await userSchema.findByIdAndDelete(id);
  res.send(users);
});

//---------------------------------shop--------------------------

//get all users
router.get('/', async function (req, res, next) {
  let users = await userSchema.find({});
  res.send(users);
});

module.exports = router;
