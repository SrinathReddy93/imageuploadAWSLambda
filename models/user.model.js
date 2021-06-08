const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
      email: {
        type: String,
        required: true,
        unique: true,
        trim: true
      },
      password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        private: true
      },
      imageUrl: {
        type: String,
        required: false
      }
    },
    {
      timestamps: true,
    }
);

module.exports = mongoose.model('User', userSchema);