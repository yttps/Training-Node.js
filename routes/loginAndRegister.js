var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
const tokenMiddleware = require('../middleware/token.middleware');
var userSchema = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { status } = require('express/lib/response');
const { token } = require('morgan');
const jwtSecret = process.env.JWT_SECRET;

//logout
router.post('/api/v1/logout', async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;


    const user = await userSchema.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 404,
        error: 'ไม่พบผู้ใช้งาน'
      });
    }

    user.token = null;
    await user.save();

    res.status(200).json({
      status: 200,
      message: 'Logout สำเร็จ'
    });

  } catch (error) {
    console.error('Error ในการ Logout:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

router.post('/api/v1/login', async function (req, res) {
  try {
    const { username, password } = req.body;
    const userLogin = await userSchema.findOne({ username });

    if (!userLogin) {
      return res.status(400).json({
        status: 400,
        message: 'ไม่พบ User ในระบบ'
      });
    }

    const checkPasswordMatch = await bcrypt.compare(password, userLogin.password);
    if (!checkPasswordMatch) {
      return res.status(400).json({
        status: 400,
        message: 'รหัสผ่านไม่ถูกต้อง'
      });
    }

    if (userLogin.role === '1') {
      if (userLogin.status === '0') {
        return res.status(403).json({
          status: 403,
          message: 'สิทธิ์ยังไม่ได้รับการอนุมัติ'
        });
      }
    }

    // สร้าง Token ใหม่เสมอ
    const newToken = jwt.sign(
      { id: userLogin._id, role: userLogin.role, status: userLogin.status },
      jwtSecret,
      { expiresIn: '30m' }
    );

    // บันทึก Token ใหม่
    userLogin.token = newToken;
    await userLogin.save();

    res.status(200).json({
      status: 200,
      message: 'ล็อกอินสําเร็จ',
      data: [
        {
          id: userLogin._id,
          username: userLogin.username,
          password: userLogin.password,
          role: userLogin.role,
          status: userLogin.status,
          token : newToken
        }
      ]
    });
  } catch (error) {
    console.error('Error ในการ Login:', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});


//login 
// router.post('/api/v1/login', async function (req, res) {

//   try {

//     const { username, password } = req.body;
//     let token = req.headers.authorization;

//     const userLogin = await userSchema.findOne({ username });
//     if (!userLogin) {
//       return res.status(400).json({ error: "ไม่พบ User ในระบบ" });
//     }

//     const checkPasswordMatch = await bcrypt.compare(password, userLogin.password);
//     if (!checkPasswordMatch) {
//       return res.status(400).json({ error: "รหัสผ่านไม่ถูกต้อง" });
//     }

//     if (userLogin.role === "1") {

//       if (userLogin.status === "0") {
//         return res.status(403).json({ error: "สิทธิ์ยังไม่ได้รับการอนุมัติ" });
//       }

//       if (userLogin.token) {
//         try {

//           const decoded = jwt.verify(userLogin.token, jwtSecret);
//           console.log(decoded);

//           return res.status(403).json({ error: "Token ยังไม่หมดอายุ" });
//         } catch (error) {
//           if (error.name === "TokenExpiredError") {
//             console.log("Token หมดอายุ");
//           } else {
//             console.error("Error ตรวจสอบ token:", error);
//             return res.status(401).json({ error: "เกิดข้อผิดพลาดตรวจสอบ Token" });
//           }
//         }
//       }

//       const newToken = jwt.sign(
//         { id: userLogin._id, role: userLogin.role, status: userLogin.status },
//         jwtSecret,
//         { expiresIn: '1d' } 
//       );

//       console.log(newToken);

//       userLogin.token = newToken;
//       await userLogin.save();

//       return res.status(200).json({
//         message: "Login successfully as Shop!",
//         role: "1",
//         token: newToken,
//       });
//     }

//     if (userLogin.role === "2") {

//       if (userLogin.token) {
//         try {

//           const decoded = jwt.verify(userLogin.token, jwtSecret);
//           console.log(decoded);

//           return res.status(403).json({ error: "เข้าสู่ระบบซ้ำ, Token ยังไม่หมดอายุ" });
//         } catch (error) {
//           if (error.name === "TokenExpiredError") {
//             console.log("Token หมดอายุ");
//           } else {
//             console.error("Error ตรวจสอบ token:", error);
//             return res.status(401).json({ error: "เกิดข้อผิดพลาดตรวจสอบ Token" });
//           }
//         }
//       }

//       // Token ใหม่หากไม่มี Token หรือ Token หมดอายุ
//       const newToken = jwt.sign(
//         { id: userLogin._id, role: userLogin.role, status: userLogin.status },
//         jwtSecret,
//         { expiresIn: '1d' } // Token มีอายุ 3 นาที
//       );

//       // Update token ใน Database
//       userLogin.token = newToken;
//       await userLogin.save();

//       return res.status(200).json({
//         message: "Login successfully as Admin!",
//         role: "2",
//         token: newToken,
//       });
//     }

//     return res.status(403).json({ error: "สิทธิ์การเข้าถึงไม่ถูกต้อง" });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ error: "Server Error" });
//   }
// });

//register
router.post('/api/v1/register', async function (req, res) {

  try {

    let { username, password, role } = req.body;

    console.log(username, password, role);

    let exitingUser = await userSchema.findOne({
      username: username
    });

    if (exitingUser) {
      return res.status(400).json({
        status: 400,
        message: "Username มีอยู่ในระบบแล้ว"
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    //add shop in database
    if (role === '1') {

      console.log("role 1");
      const newUser = new userSchema({
        username,
        password: hashedPassword,
        role: '1',
        token: '',
        status: '0'
      });

      await newUser.save();
      res.status(201).json({
        status: 201,
        message: "สมัครข้อมูลร้านค้าสำเร็จ",
        data: newUser
      });
    }

    //add admin in database
    else if (role === '2') {
      console.log("role 2");
      const newUser = new userSchema({
        username,
        password: hashedPassword,
        role: '2',
        token: ''
      });

      await newUser.save();
      res.status(201).json({
        status: 201,
        message: "สมัครข้อมูล Admin สำเร็จ",
        data: newUser
      });
    }

    //add customer in database
    else if (role === '3') {
      console.log('role 3');
      const newUser = new userSchema({
        username,
        password: hashedPassword,
        role: '3',
        token: ''
      });

      await newUser.save();
      res.status(201).json({
        status: 201,
        message: "สมัครข้อมูล Customer สำเร็จ",
        data: newUser
      });
    } else {
      res.status(400).json({
        status: 400,
        message: "เลือกสิทธิ์ไม่ถูกต้อง",
      });
    }

  } catch (error) {
    res.send(error);
  }
});


//approve
router.put('/api/v1/users/:id/approve', [tokenMiddleware], async function (req, res) {

  try {

    let { id } = req.params;
    let token = req.headers.authorization;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const roleAdmin = decoded.role;

    //check admin
    console.log("decoded " + roleAdmin);

    if (roleAdmin !== "2") {
      return res.status(404).json({
        status: 404,
        message: "ต้องเป็น Admin ในการอนุมัติ Shop เท่านั้น"
      });
    }

    //check user ที่จะอัพเดท
    const user = await userSchema.findById(id);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "ไม่พบข้อมูล User ที่จะอัพเดทสถานะ"
      });
    }

    const newStatus = user.status === "0" ? "1" : "0";
    console.log(`Old status: ${user.status}, New status: ${newStatus}`);

    user.status = newStatus;
    await user.save();

    res.status(200).json({
      status: 200,
      message: `อัพเดทสถานะสำเร็จ สถานะใหม่คือ ${newStatus}`,
      user
    });

  } catch (error) {
    res.send(error.message);
  }
});



module.exports = router;
