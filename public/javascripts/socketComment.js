var socket = io.connect(); // TIP: .connect with no args does auto-discovery

socket.on('new_comment', function (new_comment) {
  var newKey = new_comment.videoTime;
  console.log(new_comment, newKey);

  // Add the comment and hide it
  var commentEntry = createCommentDOM(new_comment).hide();

  var keys = Object.keys(window.allCommentsHash);
  var tempKey = -1;
  for (var i = 0; i < keys.length; i++) {
    var vidTime = parseInt(keys[i]);
    if (newKey < vidTime) {
      break;
    }
    else {
      tempKey = vidTime;
    }
  }

  if(tempKey === -1) { // No comments, add it
    console.log("No comments - APPENDING", commentEntry);
    $('#new_comment_container').append(commentEntry);
  }
  else {
    console.log("Adding comment before time: ", tempKey, commentEntry);
    var before = $('#new_comment_container').find('[data-commenttime="'+tempKey+'"]')[0];
    $(before).before(commentEntry);
  }

  // Fade it in if it should be displayed
  if (newKey <= currentVideoTime) {
    console.log("\t new comment should be displayed!");
    var disp = $('#new_comment_container').find('[data-commenttime="'+newKey+'"]')[0];
    $(disp).fadeIn();

    displayedCommentsHash[newKey] = true;
  }

  // Finally, add the new comment to the hash
  window.allComments.push(new_comment);
  if (window.allCommentsHash.hasOwnProperty(newKey)) {
    window.allCommentsHash[newKey].push(new_comment);
  }
  else {
    window.allCommentsHash[newKey] = [];
  }

});