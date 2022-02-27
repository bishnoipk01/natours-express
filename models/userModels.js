const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required for a user']
  },
  email: {
    type: String,
    required: [true, 'email is required for a user'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide valid email']
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'guide', 'lead-guide'],
    default: 'user'
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  changedPasswordAt: Date,
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: [6, 'password must have atleast 6 character'],
    select: false
  },
  passwordMatch: {
    type: String,
    required: [true, 'please match the password'],
    validate: {
      validator: function(value) {
        return value === this.password;
      },
      message: 'password does not match'
    }
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: { type: Boolean, default: true, select: false }
});

userSchema.methods.checkPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPassword = function(tokenDate) {
  if (this.changedPasswordAt) {
    const date = parseInt(this.changedPasswordAt.getTime(), 10) / 1000;
    // return true if changed password date is greater than token issued date
    return tokenDate < date;
  }
  return false;
};

userSchema.methods.resetPasswordToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordMatch = undefined;
  next();
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.changedPasswordAt = Date.now();
  next();
});

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
