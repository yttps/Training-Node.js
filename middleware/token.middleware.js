const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {

    try {

        let token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({
                status: 401,
                message: 'โปรดกรอก Token ที่ Header'
            });
        }

        req.auth = token
        next()

    } catch (error) {
        res.send(error.message);
    }
}