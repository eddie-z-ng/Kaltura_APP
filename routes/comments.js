var express = require('express');
var router = express.Router();
var models = require('../models/');

var Video = models.Video;
var Comment = models.Comment;

// Add a comment -- also emit the comment
router.post('/add', function(req, res) {
  var userName = req.body.userName;
  var content = req.body.content;
  var date = Date.now();
  var playerId = req.body.playerId;
  var videoTime = req.body.videoTime;

  // Given a Kaltura player ID, find the video ID 
  Video.findOne({playerId: playerId}, function(err, video) {
    if (err) {
      console.log("Error finding video for playerId:", playerId);
    }
    else {

      if (!video) {
        console.log("No video found...");
        return;
      }

      var videoId = video._id;
      var comment = new Comment({ userName: userName, 
        content: content, 
        videoId: videoId, 
        date: date, 
        videoTime: videoTime});

      comment.save(function(err) {
        if(err){
          res.send(console.log("whoops, this is all messed up. Here's your error, yo: " + err));
        } else {
          io.sockets.emit("new_comment", comment);
        }
      });
    }
  });
});

// Find a video given the player ID
router.get('/:player_id', function(req, res) {
  var time = new Date();
  var playerId = req.params.player_id;

  Video.findOne({playerId: playerId}, function(err, video) {
    if (err) {
      console.log("Error finding video ", videoId);
    }
    else {
      if (!video) {
        console.log("No video found for the given player");
        return;
      }
      var videoId = video._id;
      var query = Comment.find({ videoId: videoId});

      console.log(videoId);
      query.where('videoTime').exec(function(err, comments) {

        // if (comments.length) {
          console.log("Comments found:", comments);
          res.json(comments);
        // }
        // else {
        //   console.log("No comments found");
        // }
      });

    }
  });
});

module.exports = router;