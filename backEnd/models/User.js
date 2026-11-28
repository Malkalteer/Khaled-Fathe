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
    // غير مطلوبة لمن يسجل عبر جوجل فقط
    password: {
      type: String,
      required: function passwordRequired() { return !this.googleId; }
    },
    phone: {
      type: String,
      default: ""
    },
    googleId: {
      type: String,
      default: undefined
    },
    avatar: {
      type: String,
      default: ""
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

UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("User", UserSchema);