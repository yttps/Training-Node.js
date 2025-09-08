const mongoose = require("mongoose");
require('dotenv').config();

main().catch((err) => console.log(err));

async function main() {

    const dbHost = process.env.DB_HOST;
    const dbPort = process.env.DB_PORT;
    const dbName = process.env.DB_NAME;

    const mongoURI = `mongodb://${dbHost}:${dbPort}/${dbName}`;

    await mongoose.connect(mongoURI);
    console.log('Connected MongoDB successfully!')
}