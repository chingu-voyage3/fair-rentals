import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

export const UserSchema = new Schema({
  name: String,
  reviews: [Number],
  avatar: String,
  registered: Date
});

export const LocationSchema = new Schema({
  name: String,
  geo: Object,
  avatar: String
});

export const ReviewSchema = new Schema({
  user_id: Number,
  location_id: Number,
  text: String,
  score: Number
});
