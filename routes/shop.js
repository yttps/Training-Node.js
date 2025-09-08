var express = require('express');
var router = express.Router();
var productsSchema = require('../models/products.model');
var userSchema = require('../models/user.model');
const tokenMiddleware = require('../middleware/token.middleware');
const jwt = require('jsonwebtoken');
const { status } = require('express/lib/response');

//get all shops
router.get('/api/v1/shops', [tokenMiddleware], async function (req, res, next) {


    try {

        let token = req.headers.authorization;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userSchema.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบ Shop"
            });
        }

        if (user.status !== "1") {
            return res.status(401).json({
                status: 401,
                message: "ต้องอนุมัติสิทธิ์ร้านค้าก่อน"
            });
        }

        let products = await productsSchema.find({ shopId: user._id });

        console.log(products);

        res.status(200).json({
            status: 200,
            message: "ดึงข้อมูลสินค้าสําเร็จ",
            data: products
        });


    } catch (error) {
        if (error.name === "TokenExpired") {
            return res.status(401).json({ error: "TokenExpired" });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(404).json({ error: "Invalid token" });
        } else {
            console.error("Server Error:", error);
            res.status(500).json({ error: "Server error" });
        }
    }

});

//add product
router.post('/api/v1/products', [tokenMiddleware], async function (req, res) {

    try {

        let token = req.headers.authorization;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userSchema.findById(decoded.id);
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบ User"
            });
        }

        console.log("id shop " + user._id);

        //one to many rela // shops -> products
        let { nameProduct, price, stock, image } = req.body;

        const checkShop = await userSchema.findById(user._id);

        if (!checkShop) {
            return res.status(400).json({
                status: 400,
                message: "ไม่พบร้านค้าในระบบ"
            });
        }

        if (checkShop.status !== "1") {
            return res.status(401).json({
                status: 401,
                message: "ต้องอนุมัติสิทธิ์ร้านค้าก่อน"
            });
        }

        if (!nameProduct || nameProduct.trim() === "") {
            return res.status(400).json({
                status: 400,
                message: "กำหนดชื่อสินค้า"
            });
        }

        if (price <= 0 && stock <= 0) {
            return res.status(400).json({
                status: 400,
                message: "กำหนดราคาและจำนวนสินค้าให้มากกว่า 0"
            });
        }

        const productData = {
            shopId: user._id,
            nameProduct,
            price,
            stock,
            image: image || null
        }

        const product = new productsSchema(productData);
        await product.save();

        res.status(201).json({
            message: "เพิ่มข้อมูลสินค้าสำเร็จ",
            product
        });

    } catch (error) {
        if (error.name === "TokenExpired") {
            return res.status(401).json({ error: "TokenExpired" });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        } else {
            console.error("Server Error:", error);
            res.status(500).json({ error: "Server error" });
        }
    }
});

router.put('/api/v1/products/:id', [tokenMiddleware], async function (req, res, next) {

    try {

        let token = req.headers.authorization;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userSchema.findById(decoded.id);
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบ User ร้านค้า"
            });
        }

        console.log('status shop ' + user.status);

        if (user.status !== "1") {
            return res.status(401).json({
                status: 401,
                message: "ต้องอนุมัติสิทธิ์ร้านค้าก่อน"
            });
        }

        //--------------------------------------------------------------

        let { nameProduct, price, stock, image } = req.body;
        let { id } = req.params;

        let productToUpdate = await productsSchema.findById(id);

        if (!productToUpdate) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบข้อมูล Product"
            });
        }

        if (productToUpdate.shopId.toString() !== user._id.toString()) {
            return res.status(401).json({
                status: 401,
                message: "คุณไม่มีสิทธิ์อัปเดตข้อมูล Product นี้"
            });
        }

        let updatedProduct = await productsSchema.findByIdAndUpdate(
            id,
            { nameProduct, price, stock, image },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(500).json({
                status: 500,
                message: "เกิดข้อผิดพลาดระหว่างการอัปเดตข้อมูล"
            });
        }

        res.status(200).json({
            status: 200,
            message: "อัพเดทข้อมูลสินค้าสําเร็จ",
            product: updatedProduct
        });

    } catch (error) {
        if (error.name === "TokenExpired") {
            return res.status(401).json({ error: "TokenExpired" });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        } else {
            console.error("Server Error:", error);
            res.status(500).json({ error: "Server error" });
        }
    }
});

//delete product
router.delete('/api/v1/products/:id', [tokenMiddleware], async function (req, res, next) {

    try {

        let token = req.headers.authorization;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userSchema.findById(decoded.id);
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบ User ร้านค้า"
            });
        }

        console.log('status shop ' + user.status);

        if (user.status !== "1") {
            return res.status(400).json({
                status: 400,
                message: "ต้องอนุมัติสิทธิ์ร้านค้าก่อน"
            });
        }

        //--------------------------------

        let { id } = req.params;
        let productToDelete = await productsSchema.findById(id);

        if (!productToDelete) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบข้อมูล Product"
            });
        }

        if (productToDelete.shopId.toString() !== user._id.toString()) {
            return res.status(401).json({
                status: 401,
                message: "คุณไม่มีสิทธิ์ลบข้อมูล Product"
            });
        }

        let removeProduct = await productsSchema.findByIdAndDelete(id);

        if (!removeProduct) {
            return res.status(500).json({
                status: 500,
                message: "เกิดข้อผิดพลาดระหว่างการลบข้อมูล"
            });
        }

        res.status(200).json({
            status: 200,
            message: "ลบข้อมูลสินค้าสําเร็จ",
            product: removeProduct
        });

    } catch (error) {
        if (error.name === "TokenExpired") {
            return res.status(401).json({ error: "TokenExpired" });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        } else {
            console.error("Server Error:", error);
            res.status(500).json({ error: "Server error" });
        }
    }
});

//get product by id
router.get('/api/v1/products/:id', [tokenMiddleware], async function (req, res, next) {

    try {

        let token = req.headers.authorization;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userSchema.findById(decoded.id);
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบ User ร้านค้า"
            });
        }

        console.log('shop id' + user._id);

        if (user.status !== "1") {
            return res.status(401).json({
                status: 401,
                message: "ต้องอนุมัติสิทธิ์ร้านค้าก่อน"
            });
        }

        //--------------------------------
        // add find product by shopId product
        let { id } = req.params;
        let getProductById = await productsSchema.findById(id);

        // ตรวจสอบว่าข้อมูล Product มีอยู่ และ shopId ตรงกับ user._id หรือไม่
        if (!getProductById) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบข้อมูล Product"
            });
        }

        if (getProductById.shopId.toString() !== user._id.toString()) {
            return res.status(401).json({
                status: 401,
                message: "คุณไม่มีสิทธิ์เข้าถึงข้อมูล Product"
            });
        }

        res.status(200).send(getProductById);

    } catch (error) {
        if (error.name === "TokenExpired") {
            return res.status(401).json({ error: "TokenExpired" });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        } else {
            console.error("Server Error:", error);
            res.status(500).json({ error: "Server error" });
        }
    }
});

module.exports = router;
