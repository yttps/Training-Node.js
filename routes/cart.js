var express = require('express');
var router = express.Router();
var productsSchema = require('../models/products.model');
var orderSchema = require('../models/orders.models');
var userSchema = require('../models/user.model');
const { default: mongoose } = require('mongoose');
const jwt = require('jsonwebtoken');
const tokenMiddleware = require('../middleware/token.middleware');
const { status } = require('express/lib/response');


//get all order by shop id
router.get('/api/v1/orders', [tokenMiddleware], async function (req, res, next) {

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
        console.log(' shop id ' + user._id);

        if (user.status !== "1") {
            return res.status(400).json({
                status: 400,
                message: "ต้องอนุมัติสิทธิ์ร้านค้าก่อน"
            });
        }

        //--------------------------------

        const orders = await orderSchema
            .find({})
            .populate({
                path: "productId",
                select: "shopId nameProduct price stock image",
                match: { shopId: user._id },
            })
            .exec();

        const filteredOrders = orders.filter(order => order.productId !== null);

        if (filteredOrders.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบออเดอร์ในร้านนี้"
            });
        }

        res.status(200).json({
            status: 200,
            message: "สําเร็จ",
            data: filteredOrders
        });

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "TokenExpired" });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        } else {
            console.error("Server Error:", error);
            res.status(500).json({ error: "Server error" });
        }
    }

});

//add order 
router.post('/api/v1/products/:id/orders', [tokenMiddleware], async function (req, res) {

    try {

        let token = req.headers.authorization;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('decoded ' + JSON.stringify(decoded));
        const user = await userSchema.findById(decoded.id);

        console.log('req ' + user.role);

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบ User"
            });
        }

        if (user.role === '1') {
            if (user.status !== "0") {
                return res.status(400).json({
                    status: 400,
                    message: "ต้องอนุมัติสิทธิ์ร้านค้าก่อน"
                });
            }
        } else if (user.role === '3') {
            //--------------------------------

            //one to many rela // shops -> products
            let { quantity } = req.body;
            let { id } = req.params; // id product

            if (!quantity || quantity <= 0) {
                return res.status(400).json({
                    status: 400,
                    message: "กำหนดจำนวนสินค้าให้มากกว่า 0"
                });
            }

            let getProductById = await productsSchema.findById(id);

            if (!getProductById) {
                return res.status(404).json({
                    status: 404,
                    message: "ไม่พบข้อมูล Product"
                });
            }

            if (getProductById.stock <= 0) {
                return res.status(400).json({
                    status: 400,
                    error: "สินค้าหมด"
                });
            }

            if (getProductById.stock < quantity) {
                return res.status(400).json({
                    status: 400,
                    message: "จำนวนสินค้าไม่เพียงพอ"
                });
            }

            const totalprice = getProductById.price * quantity;
            const orderData = {
                productId: getProductById._id,
                quantity,
                totalprice,
                status: 'unpaid'
            }

            //insert data in order table
            const order = new orderSchema(orderData);
            await order.save();

            //update stock
            getProductById.stock -= quantity;
            await getProductById.save();

            res.status(201).json({
                status: 201,
                message: "เพิ่มข้อมูลออเดอร์สำเร็จ",
                order
            });
            
        } else {
            return res.status(400).json({
                status: 400,
                message: "ไม่พบสิทธิ์ใช้งาน"
            });
        }





    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "TokenExpired" });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        } else {
            console.error("Server Error:", error);
            res.status(500).json({ error: "Server error" });
        }
    }
});
//get all order by product id
router.get('/api/v1/products/:id/orders', [tokenMiddleware], async function (req, res, next) {


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
        console.log(' shop id ' + user._id);

        if (user.status !== "1") {
            return res.status(400).json({
                status: 400,
                message: "ต้องอนุมัติสิทธิ์ร้านค้าก่อน"
            });
        }

        //--------------------------------

        ///search all order by product id
        let { id } = req.params; //product id
        const refId = new mongoose.Types.ObjectId(id);

        let orders = await orderSchema.find({ productId: refId });

        if (!orders) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบข้อมูล Orders"
            });
        }

        res.status(200).json({
            status: 200,
            message: "ดึงข้อมูล Orders สําเร็จ",
            orders
        });

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "TokenExpired" });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        } else {
            console.error("Server Error:", error);
            res.status(500).json({ error: "Server error" });
        }
    }
});

//update status order to status = 'paid'
router.put('/api/v1/products/:id/orders', [tokenMiddleware], async function (req, res) {

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

        if (user.status !== "1") {
            return res.status(400).json({
                status: 400,
                message: "ต้องอนุมัติสิทธิ์ร้านค้าก่อน"
            });
        }

        //--------------------------------

        const updateOrder = await orderSchema.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );

        if (!updateOrder) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบข้อมูล Order"
            });
        }

        res.status(200).json({
            status: 200,
            message: "อัพเดตสถานะ Order สําเร็จ",
            updateOrder
        });

    } catch (error) {
        if (error.name === "TokenExpiredError") {
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