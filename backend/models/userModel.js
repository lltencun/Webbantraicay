import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {    
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: false },
    address: { type: Object, default: {} },
    cartData: { type: Object, default: {} },
    isLocked: { type: Boolean, default: false },
  },{ minimize: false }
);
const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
