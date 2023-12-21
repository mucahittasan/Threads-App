import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    id: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    image: String,
    bio: String,
    threads: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Thread"
        }
    ],
    onboarded: {
        type: Boolean,
        default: false
    },
    communities: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Community"
        }
    ]
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;