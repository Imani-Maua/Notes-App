import express from 'express';
import { body } from 'express-validator';
import {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
    searchNotes
} from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const noteValidation = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required')
];

// All routes are protected
router.use(protect);

// Routes
router.get('/', getNotes);
router.get('/search', searchNotes);
router.post('/', noteValidation, createNote);
router.put('/:id', noteValidation, updateNote);
router.delete('/:id', deleteNote);

export default router;
