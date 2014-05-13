var mongoose = require('mongoose');
mongoose.connect('mongodb://fullstack:AcAdEmY1!@novus.modulusmongo.net:27017/ehymY6pa');
//mongoose.connect('mongodb://localhost/kalturaapp');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var Schema = mongoose.Schema;

var commentSchema = new Schema({
  date: {type: Date, default: Date.now},
  videoTime: Number,
  content: String,
  userName: String,
  videoId: Schema.Types.ObjectId
});

var videoSchema = new Schema({
  name: String,
  playerId: String
});

exports.Video = mongoose.model('Video', videoSchema);
exports.Comment = mongoose.model('Comment', commentSchema);