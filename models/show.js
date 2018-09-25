
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');



var showSchema = mongoose.Schema({
  banner: String,
  firstAired: String,
  id: 0,
  network: String,
  overview: String,
  seriesName: String,
  slug: String,
  status: String

});





// var showSchema = mongoose.Schema({
//   _id: Number,
//   name: String,
//   airsTime: String,
//   firstAired: Date,
//   genre: [String],
//   network: String,
//   overview: String,
//   rating: Number,
//   ratingCount: Number,
//   status: String,
//   poster: String,
//   subscribers: [{
//     type: mongoose.Schema.Types.ObjectId, ref: 'User'
//   }],
//   episodes: [{
//     season: Number,
//     episodeNumber: Number,
//     episodeName: String,
//     firstAired: Date,
//     overview: String
//   }]
// });

module.exports = mongoose.model('Show', showSchema);
