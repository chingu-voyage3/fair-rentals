import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: String,
  reviews: [Number],
  avatar: String,
  registered: Date
});
