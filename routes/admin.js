var express = require('express');
var router = express.Router();
//const multer = require('multer');
var shopsSchema = require('../models/shop.model');
var adminSchema = require('../models/admin.model');
const tokenMiddleware = require('../middleware/token.middleware');
const jwt = require('jsonwebtoken');
const { status } = require('express/lib/response');


//เสร้จ
//get all shops
router.get('/api/v1/admin/shop', [tokenMiddleware], async function (req, res) {


    try {

        let token = req.headers.authorization;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const admin = await adminSchema.findById(decoded.id);

        if (!admin) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบ Admin"
            });
        }

        const shops = await shopsSchema.find({});
        res.status(200).json({
            status: 200,
            message: "สําเร็จ",
            data: shops
        });


    } catch (error) {
        if (error.name === "TokenExpired") {
            return res.status(401).json({ error: "TokenExpired" });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(404).json({ error: "Invalid token" });
        } else {
            console.error("Server Error:", error.message);
            res.status(500).json({ error: "Server error" });
        }
    }

});

//up date status shop
router.put('/api/v1/admin/shop/:id', [tokenMiddleware], async function (req, res) {

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
                message: "ต้องเป็น Admin ในการอนุมัติเท่านั้น"
            });
        }

        //check user ที่จะอัพเดท
        const shop = await shopsSchema.findById(id);

        console.log('chk user', shop)

        if (!shop) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบข้อมูล User ที่จะอัพเดทสถานะ"
            });
        }

        const newStatus = shop.status === "0" ? "1" : "0";

        shop.status = newStatus;
        await shop.save();

        res.status(200).json({
            status: 200,
            message: `อัพเดทสถานะสำเร็จ สถานะใหม่คือ ${newStatus}`,
            shop
        });

    } catch (error) {
        if (error.name === "TokenExpired") {
            return res.status(401).json({ error: "TokenExpired" });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        } else {
            console.error("Server Error:", error.message);
            res.status(500).json({ error: "Server error" });
        }
    }

});

//delete shop
router.delete('/api/v1/admin/shop/:id', [tokenMiddleware], async function (req, res) {

    try {

        let token = req.headers.authorization;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const admin = await adminSchema.findById(decoded.id);

        if (!admin) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบ Admin"
            });
        }

        //--------------------------------

        let { id } = req.params;
        let shopToDelete = await productsSchema.findById(id);

        if (!shopToDelete) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบข้อมูล Shop"
            });
        }

        let removeShop = await shopsSchema.findByIdAndDelete(id);

        if (!removeShop) {
            return res.status(500).json({
                status: 500,
                message: "เกิดข้อผิดพลาดระหว่างการลบข้อมูล"
            });
        }

        res.status(200).json({
            status: 200,
            message: "ลบข้อมูล Shop สําเร็จ",
            Shop: removeShop
        });

    } catch (error) {
        if (error.name === "TokenExpired") {
            return res.status(401).json({ error: "TokenExpired" });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        } else {
            console.error("Server Error:", error.message);
            res.status(500).json({ error: "Server error" });
        }
    }
});

//get shop by id
router.get('/api/v1/admin/shop/:id', [tokenMiddleware], async function (req, res) {

    try {

        let token = req.headers.authorization;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const admin = await adminSchema.findById(decoded.id);

        if (!admin) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบ Admin"
            });
        }

        //--------------------------------
        let { id } = req.params;
        let getShopById = await shopsSchema.findById(id);

        if (!getShopById) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบข้อมูล Shop"
            });
        }

        res.status(200).send({
            status: 200,
            message: "ดูข้อมูล Shop สําเร็จ",
            Shop: getShopById
        });

    } catch (error) {
        if (error.name === "TokenExpired") {
            return res.status(401).json({ error: "TokenExpired" });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        } else {
            console.error("Server Error:", error.message);
            res.status(500).json({ error: "Server error" });
        }
    }
});

module.exports = router;
