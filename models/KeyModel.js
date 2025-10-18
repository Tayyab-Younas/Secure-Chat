import mongoose from "mongoose";

const keySchema = new mongoose.Schema({
  version: { type: Number, required: true, unique: true },
  key: { type: String, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Key", keySchema);
