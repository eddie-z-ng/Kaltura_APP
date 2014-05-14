// List of all the commments
var allComments = [];

// Indexed set of comments where
// key = "videoTime", value = comment object
var allCommentsHash = {};

// Indexed set of comments that are currently displayed
// key = "videoTime", value = whether displayed or not (true/false)
var displayedCommentsHash = {};


$(document).ready(function(){
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
    "cache_st": 1400024212,
    "entry_id": "1_fthk65hm",
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

          allComments = response;
          console.log("All comments:", allComments);

          allComments.forEach(function(comment) {
            var key = comment.videoTime;

            if (!allCommentsHash.hasOwnProperty(key)) {
              allCommentsHash[key] = [];
              displayedCommentsHash[key] = false;
            }
            allCommentsHash[key].push(comment);
          });
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
