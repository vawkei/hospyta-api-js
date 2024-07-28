const mongoose = require("mongoose");
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please enter a name"],
      minlength: [3, "Name length shouldn't be < 3"],
      maxlength: [10, "Name length shouldn't be  > 10"],
    },
    email: {
      type: String,
      trim: true,
      required: [true],
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please Provide a valid email",
      ],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Please enter password"],
      minlength: [6, "Password characters should be more than 6"],
    },
    isRegistered:{
      type:Boolean,
      default:false
    }
  },
  { timestamp: true }
  // should be { timestamps: true } will change it later
);

module.exports = mongoose.model("User", userSchema);
