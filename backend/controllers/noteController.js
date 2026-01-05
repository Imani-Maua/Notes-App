import { validationResult } from 'express-validator';
import Note from '../models/Note.js';

// @desc    Get all notes for a user
// @route   GET /api/notes
// @access  Private
export const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
export const createNote = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, content } = req.body;

        const note = await Note.create({
            title,
            content,
            user: req.user._id
        });

        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Check if user owns the note
        if (note.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this note' });
        }

        const { title, content } = req.body;
        note.title = title;
        note.content = content;

        const updatedNote = await note.save();
        res.json(updatedNote);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Check if user owns the note
        if (note.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this note' });
        }

        await note.deleteOne();
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Search notes by title
// @route   GET /api/notes/search?q=searchterm
// @access  Private
export const searchNotes = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        // Search by title (case-insensitive)
        const notes = await Note.find({
            user: req.user._id,
            title: { $regex: q, $options: 'i' }
        }).sort({ createdAt: -1 });

        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
