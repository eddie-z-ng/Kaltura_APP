'use strict';

// List of all the commments
var allComments = [];

// Indexed set of comments where
// key = "videoTime", value = comment object
var allCommentsHash = {};

// Indexed set of comments that are currently displayed
// key = "videoTime", value = whether displayed or not (true/false)
var displayedCommentsHash = {};

function createCommentDOM(commentObj) {
  var minutes = Math.floor(commentObj.videoTime/60);
  var seconds = commentObj.videoTime - minutes * 60;
  var timeString = seconds < 10 ? minutes + ":0" + seconds : minutes + ":" + seconds;
  var userNameString = commentObj.userName || "(Anonymous)";

  // TODO: Edit the style of the added content and better yet
  // use swig templating!
  var userNameHeader = $('<p></p>').text(userNameString).addClass("pull-left comment_title");
  var commentContent = $('<p></p>').text(commentObj.content).addClass("comment_content");
  var miscContent = $('<a></a>').text(timeString).addClass('jumpVideo pull-right').attr("data-time-s", commentObj.videoTime);
  var clear = $("<p class='clear'></p>");
  var commentEntry = $('<div class="comment" data-commenttime=' + commentObj.videoTime + '></div>');

  commentEntry.append(commentContent).append("<hr>");
  commentEntry.append(userNameHeader);
  commentEntry.append(miscContent).append(clear);

  return commentEntry;
}

function hashComments(comments) {
  var commentsHash = {};
  comments.forEach(function(comment) {
    var key = comment.videoTime;
    if (!commentsHash.hasOwnProperty(key)) {
      commentsHash[key] = [];
      window.displayedCommentsHash[key] = false;
    }
    commentsHash[key].push(comment);
  });
  return commentsHash;
}

function createAndHideCommentDOMs(commentsHash) {
  var keys = Object.keys(commentsHash);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var timeComments = commentsHash[key];
    for (var k = 0; k < timeComments.length; k++) {
      var commentEntry = createCommentDOM(timeComments[k]).hide();
      $('#new_comment_container').prepend(commentEntry);
    }
  }
}


$(document).ready(function() {
  var kdpPlayerId;
  $('#submission_container').hide();
  $('#show_form').click(function(event){
    event.preventDefault();
    toggleCommentForm();
  });
  function toggleCommentForm (){
    $('#submission_container').fadeToggle("fast");
  }

  kWidget.embed({
      "targetId": "kaltura_player_1400024212",
      "wid": "_1742331",
      "uiconf_id": 24203511,
      "flashvars": {},
      "cache_st": 1400597984,
      "entry_id": "1_cx4pvw69",
    readyCallback: function( playerId ){
      console.log( 'Player:' + playerId + ' is ready ');
      window.kdp = document.getElementById(playerId);
      kdpPlayerId = playerId;
      var request = '/comments/' + playerId;

      $.ajax({
        url: request,
        timeout:5000,
        tryCount : 0,
        retryLimit : 10,
         error : function(xhr, textStatus, errorThrown ) {
          console.log("status code: ", xhr.status);
          console.log("text status ", textStatus);
          console.log("error thrown ", errorThrown);
          console.log("try count: ", this.tryCount);
          this.tryCount++;
          if (this.tryCount <= this.retryLimit) {
            (console.log("ajax is about to retry..."));
            $.ajax(this);
            return;
          } else {
            $('#new_comment_container').prepend('<div class="comment error">Error Loading Comments. Please refresh the page...</div>');

          }
        },
        success: function(response) {
          window.kdp.addJsListener("playerUpdatePlayhead", "playerUpdatePlayheadHandler");
          window.kdp.addJsListener("durationChange", "playerDurationHandler");

          window.allComments = response;
          window.allCommentsHash = hashComments(window.allComments);

          console.log("All comments:", window.allComments, window.allCommentsHash);

          createAndHideCommentDOMs(window.allCommentsHash);
        }
      });
    }
  });


  $('#commentForm').submit(function(event) {
     // Stop form from submitting normally
      event.preventDefault();

      var $form = $(this),
        url = $form.attr("action"),
        userName = $form.find("input[name='username']").val(),
        content = $form.find("textarea").val(),
        videoTime = Math.floor(window.currentVideoTime);

      var data = {
          videoTime: videoTime,
          content: content,
          userName: userName,
          playerId: kdpPlayerId
      };

      // Clear out submit form
      $form.find("input[name='username']").val("");
      $form.find("textarea").val("");

      $.ajax({
        type: "POST",
        url: url,
        data: data,
        success: function(){console.log("yay");}
      });

  });


  $("#new_comment_container").on("click", ".comment a.jumpVideo", function(e) {
    var timesec = parseInt($(this).attr("data-time-s"));
    window.jumpToTime(timesec);
  });

});
