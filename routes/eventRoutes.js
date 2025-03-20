const express = require('express');
const upload = require('../middleware/upload');
const {
    createEvent,
    getEventById,
    getEvents,
    updateEvent,
    deleteEvent
} = require('../controllers/eventController');

const router = express.Router();

router.post('/events', upload.array('files', 5), createEvent);
router.get('/event', getEventById);
router.get('/events', getEvents);
router.put('/events/:id', upload.array('files', 5), updateEvent);
router.delete('/events/:id', deleteEvent);

module.exports = router;
