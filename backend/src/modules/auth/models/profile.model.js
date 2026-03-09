const mongoose = require("mongoose");
const { Schema } = mongoose;

const profileSchema = new Schema(
    {
        account_id: {
            type: Schema.Types.ObjectId,
            ref: "Account",
            required: false,
            unique: true,
            sparse: true,   // cho phép nhiều document có account_id = null
            index: true
        },

        full_name: {
            type: String,
            required: true
        },
        dob: {
            type: Date
        },
        gender: {
            type: String,
            enum: ["MALE", "FEMALE", "OTHER"]
        },
        address: {
            type: String
        },
        phone: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        avatar_url: {
            type: String,
            default: "https://as2.ftcdn.net/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg"
        },
    },
    { timestamps: true, collection: "profiles" }
);

module.exports = mongoose.model("Profile", profileSchema);