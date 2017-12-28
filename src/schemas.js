import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

export const UserSchema = new Schema({
  username: String,
  reviews: [Number],
  avatar: String,
  registered: Date,
  auth_id: String,
});

export const LocationSchema = new Schema({
  name: String,
  geo: Schema.Types.Mixed,
  avatar: String,
  reviews: [Number],
  id: Number,
});

export const ReviewSchema = new Schema({
  user_id: Number,
  location_id: Number,
  text: String,
  score: Number,
  id: Number,
  posted: Date,
});

export const GeoSchema = new Schema({
  type: String,
  coordinates: [Number],
});
