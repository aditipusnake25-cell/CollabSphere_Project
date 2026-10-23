import Note from '../models/Note.js'
import Project from '../models/Project.js'

const createNote = async (req, res) => {
    try {
        const { title, content } = req.body
        const { id } = req.params
        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Note title is required!"
            })
        }
        const project = await Project.findById(id)
        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            })
        }
       const note = await Note.create({
  title: title.trim(),
  content: content || "",
  project: id,
  createdBy: req.user.id
});
        return res.status(201).json({
            message: "Note created successfullyy",
            note
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to create note!",
            error: error.message
        })

    }

}

const getProjectNotes = async (req, res) => {
    try {
        const { id } = req.params
        const project = await Project.findById(id)

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            })
        }
        const notes = await Note.find({ project: id })
            .populate("author", "name email")
            .sort({ createdAt: -1 })
        return res.status(200).json({
            count: notes.length,
            notes
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to retrive notes",
            error: error.message
        })
    }

}

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          message: "Note title cannot be empty"
        });
      }

      note.title = title.trim();
    }

    if (content !== undefined) {
      note.content = content;
    }

    await note.save();

    return res.status(200).json({
      message: "Note updated successfully",
      note
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update note",
      error: error.message
    });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findByIdAndDelete(id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    return res.status(200).json({
      message: "Note deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete note",
      error: error.message
    });
  }
};

export {createNote , getProjectNotes ,updateNote,deleteNote}