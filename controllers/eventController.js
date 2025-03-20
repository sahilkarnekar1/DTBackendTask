const { ObjectId } = require('mongodb');
const fs = require('fs');
const { eventsCollection } = require('../config/db');

// Create Event
exports.createEvent = async (req, res) => {
    try {
        const filePaths = req.files.map(file => file.path);
        const event = { 
            ...req.body, 
            images: filePaths, 
            type: "event",
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await eventsCollection.insertOne(event);
        res.status(201).json({ eventId: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: "Failed to create event" });
    }
};

// Get Event by ID
exports.getEventById = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: "Event ID required" });
        const event = await eventsCollection.findOne({ _id: new ObjectId(id) });
        if (!event) return res.status(404).json({ error: "Event not found" });
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve event" });
    }
};

// Get Events (Latest/Old)
exports.getEvents = async (req, res) => {
    try {
        const { type, limit = 5, page = 1 } = req.query;
        if (type !== 'latest' && type !== 'old') {
            return res.status(400).json({ error: "Invalid type. Use 'latest' or 'old'" });
        }

        const sortOrder = type === 'latest' ? -1 : 1;
        const events = await eventsCollection
            .find()
            .sort({ createdAt: sortOrder })
            .skip((page - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .toArray();

        res.json(events);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve events" });
    }
};

// Update Event
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const existingEvent = await eventsCollection.findOne({ _id: new ObjectId(id) });
        if (!existingEvent) return res.status(404).json({ error: "Event not found" });

        // Delete old files if new ones are uploaded
        if (req.files.length > 0 && existingEvent.images) {
            existingEvent.images.forEach(filePath => {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }

        // Prepare update data
        const updateData = { ...req.body, updatedAt: new Date() };
        if (req.files.length > 0) {
            updateData.images = req.files.map(file => file.path);
        }

        const result = await eventsCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
        if (result.modifiedCount === 0) return res.status(404).json({ error: "Event not updated" });

        res.json({ message: "Event updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update event" });
    }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const existingEvent = await eventsCollection.findOne({ _id: new ObjectId(id) });

        if (!existingEvent) return res.status(404).json({ error: "Event not found" });

        // Delete images from server
        if (existingEvent.images) {
            existingEvent.images.forEach(filePath => {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }

        const result = await eventsCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return res.status(404).json({ error: "Event not deleted" });

        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete event" });
    }
};
