const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const client = new MongoClient(MONGO_URI);

async function connectDB() {
    await client.connect();
    console.log("Connected to MongoDB");
}

connectDB();

const db = client.db("eventDB");
const eventsCollection = db.collection("events");

module.exports = { db, eventsCollection };
