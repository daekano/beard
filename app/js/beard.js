/* 
 * Beard Functionality
 * Matthew Evans, Autumn 2013
 * No License
 *
 */
;(function($){

	var Beard = {

		// Initialize the player
		init: function (elm) {

			// Cache the element as a jQuery object
			var $elm = $(elm);

			// Cache other DOM elements
			Beard.elements             = {};
			Beard.elements.$player     = $elm;
			Beard.elements.$text       = $elm.find('.text');
			Beard.elements.$time       = $elm.find('.time');
			Beard.elements.$progress   = $elm.find('.progress');
			Beard.elements.$seek       = $elm.find('.seek');
			Beard.elements.$seekCursor = $elm.find('.seek .cursor');
			Beard.elements.$play       = $elm.find('.play');

			// Instantiate a new Audio object
			Beard.audio = new Audio();

			// Set the source of the audio object if the data-source attribute exists
			if($elm.attr('data-source')) {
				Beard.setSource($elm.attr('data-source'));
			}

			// Bind Audio events
			$(Beard.audio).on('timeupdate', Beard.displayTime);
			$(Beard.audio).on('timeupdate', Beard.displayProgress);
			$(Beard.audio).on('canplay', Beard.displayTime);

			// Bind DOM events
			Beard.elements.$player.on('click', '.play', Beard.play);
			Beard.elements.$seek.on('mousemove', Beard.placeSeekCursor);
			Beard.elements.$seek.on('click', 'a', Beard.seek);

		},
		load: function (options) {

			// Must have a valid source
			if(!Beard.parseValidAudioFormat(options.url)) {
				Beard.error('Invalid audio url.');
				return;
			}

			// Stop audio
			Beard.pause();

			// Set the values
			Beard.displayText(options.text);
			Beard.setSource(options.url);

		},
		error: function (message) {

			// Cache current message
			var prevMessage = Beard.elements.$text.text();

			// Display the error message
			Beard.displayText('Error: ' + message);

			// After 3 seconds, return to the previous message
			setInterval(function(){
				Beard.displayText(prevMessage);
			}, 3000)
		
		},
		setSource: function (url) {

			// Set the audio source to the new URL
			Beard.audio.src = url;

		},
		displayProgress: function () {

			// Cache the current and total time
			var currentTime = Math.round(Beard.audio.currentTime);
			var totalTime = Math.round(Beard.audio.duration);

			// Compute the percentage out of 100
			var progressPercent = ( currentTime / totalTime ) * 100;

			// Set the width of the progress bar as a percent value
			Beard.elements.$progress.css('width', progressPercent + '%');

		},
		displayText: function (text) {

			// Inject text into the text display element
			Beard.elements.$text.text(text);

		},
		displayTime: function () {

			// Parse the time properties fromt the audio object
			var currentTime = Beard.parseSecondsToReadableFormat(Beard.audio.currentTime);
			var duration = '';
			if(Beard.audio.duration) {
				duration = ' of ' + Beard.parseSecondsToReadableFormat(Beard.audio.duration);		
			} else {
				currentTime = 'loading...';
			}


			// Create a time string
			var timeString = currentTime + duration;

			// Update the view
			Beard.elements.$time.text(timeString);

		},
		parseSecondsToReadableFormat: function (seconds) {

			// Trim the decimals from the time
			var trimmedSeconds = Math.round(seconds);

			// If it's less than one minute
			if(trimmedSeconds < 60) { return '0:' + ( '0' + trimmedSeconds).slice(-2) };

			// If it is a multiple of one minute
			if(trimmedSeconds % 60 == 0) { return  ( trimmedSeconds / 60 ) + ':00'; }

			// If it is more than one minute
			return Math.round(seconds/60) + ':' + ('0' + Math.round(seconds % 60)).slice(-2);


		},
		parseValidAudioFormat: function (url) {

			// Allowable audio formats
			var whitelist = ['mp3', 'ogg', 'mp4'];

			// Valid is false by default
			var valid = false;

			// With the url...
			if(url) {
				// Check to make sure that the format exists in the whitelist
				var splitUrl = url.split('.');
				var ext = splitUrl[splitUrl.length - 1];
				if( $.inArray(ext, whitelist) >= 0 ) {
					// If it exists, it's valid
					valid = true;
				}
			}

			return valid;

		},
		computeMouseOffsetX: function (e) {

			var parentOffset = $(e.target).parent().offset();
			return e.pageX - parentOffset.left;

		},
		play: function () {

			// We use the same buton for play and pause
			if(Beard.playing) {

				return Beard.pause();

			}

			// Start audio
			Beard.audio.play();

			// Set a playing property
			Beard.playing = true;

			// Set the DOM element to playing
			Beard.elements.$player.addClass('playing');

			// Set the text
			Beard.elements.$play.text('Pause');

		},
		pause: function () {

			// Pause audio
			Beard.audio.pause();

			// Unset the playing property
			Beard.playing = false;

			// Unset the DOM playing class
			Beard.elements.$player.removeClass('playing');

			// Set the text
			Beard.elements.$play.text('Play');

		},
		seek: function (e) {

			console.log(e);

			// Divide the width of the player by the positon of the cursor.
			// Use that percentage to place the currentTime of the track.
			var beardWidth = Beard.elements.$player.width();
			var mouseX = Beard.computeMouseOffsetX(e);

			var seekPercentage = ( mouseX / beardWidth );
			var duration = Beard.audio.duration;
			var seekTime = duration * seekPercentage;

			Beard.audio.currentTime = seekTime;

		},
		placeSeekCursor: function (e) {

			// Place the seek cursor directly on the mouse cursor when hovered.
			var mouseX = Beard.computeMouseOffsetX(e);
			Beard.elements.$seekCursor.css('left', mouseX);

		}
	};

	// Expose the functions as collection methods.
	$.extend($.fn, {

		// This method initializes values from attributes and binds events.
		beard: function (options) {

			// We only support one player element (for now)
			Beard.init(this[0]);

			// If this is for testing purposes we return the Beard object instead.
			if(options && options.internals === true) {
				return Beard;
			}

			// Otherwise we return the jQuery object for chainability.
			return this;

		},
		// Load a new source URL
		load: function (options) {

			Beard.load(options);
			return this;
			
		}

	});

})(jQuery);