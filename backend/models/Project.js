    import mongoose from "mongoose";

    const projectSchema = mongoose.Schema({
        title: {
            type: String,
            trim: true,
            required: true
        },
        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 10
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        members: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        technologies: {
            type: [String],
            default: []
        },
        repositoryUrl: {
            type: String,
            validate: {
                validator: function (value) {
                    return !value || /^https?:\/\/.+/.test(value);
                },
                message: "Please enter a valid URL"
            }
        },
        isPublic: {
            type: Boolean,
            default: false
        }
    }, { timestamps: true })

    const Project = mongoose.model("Project", projectSchema)

    export default Project;