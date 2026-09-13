const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockoutUntil: {
      type: Date,
      default: null
    },
    failedLoginLogs: [{
      at: {
        type: Date,
        required: true
      },
      ip: {
        type: String,
        required: true
      }
    }],
    refreshTokens: [{
      tokenHash: {
        type: String,
        required: true
      },
      expiresAt: {
        type: Date,
        required: true
      }
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);