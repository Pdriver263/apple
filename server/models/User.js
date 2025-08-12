const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['guest', 'host', 'admin'], default: 'guest' },
    profile: {
        name: String,
        phone: String,
        avatar: String,
        bio: String
    },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// Password hashing
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Password verification method
userSchema.methods.correctPassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);