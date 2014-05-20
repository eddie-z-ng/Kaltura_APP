'use strict';

window.currentVideoTime = 0;

function jumpToTime(timesec)
{
	// kdp.sendNotification('doPlay', null); // Null parameters are optional
  window.kdp.sendNotification("doPlay");
	// Moves to a specific point, defined in seconds from the start of the video
  window.kdp.sendNotification("doSeek", timesec);
}

function playerDurationHandler(data) {
  console.log("Duration!", data.newValue);
	// if (allComments.length) {
	// 	window.allCommentsMap = [];
	// 	for (var i = 0; i < data.newValue; i++) {

	// 		if (allCommentsHash.hasOwnProperty(i)) {
	// 			window.allCommentsMap[i] = allCommentsHash[i];
	// 		}
	// 		else {
	// 			window.allCommentsMap[i] = 0;
	// 		}
	// 	}
	// }
	// console.log("MAP is now", allCommentsMap);
}

function playerUpdateThrottler(limit) {
	var counter = 0;
	var beginTime = 0;

	return function(data) {
		var endTime = Math.floor(data);

		// Moved to the past, remove future entries
		if (endTime < beginTime) {
			for (var ind = endTime; ind <= beginTime; ind++) {
				$('#new_comment_container').find('[data-commenttime="'+ind+'"]').fadeOut();

				if (displayedCommentsHash.hasOwnProperty(ind) && displayedCommentsHash[ind] === true) {
					displayedCommentsHash[ind] = false;
				}
			}
		}

		if (counter % limit === 0) {
			for (var i = beginTime; i <= endTime; i++) {
				var key = i + "";
				if (displayedCommentsHash.hasOwnProperty(key)) {
					if (displayedCommentsHash[key] === false) {
	    			$('#new_comment_container').find('[data-commenttime="'+key+'"]').fadeIn();
						displayedCommentsHash[key] = true;
					}
				}
			}
			beginTime = endTime;
			counter = 0;
		}
		counter += 1;

		window.currentVideoTime = data;

	};
}
var playerUpdatePlayheadHandler = playerUpdateThrottler(5); // every 5 counts