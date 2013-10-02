/* 
 * Player Functionality
 * Matthew Evans, Autumn 2013
 * No License
 *
 * Dependent on Zepto, though jQuery should work in a pinch. 
 * They have similar APIs, and native JS is used where feasible.
 * Eventually I will test against both dependencies.
 */
;(function($){

	var Player = {
		// Initialize the player
		init: function (elm) {

			// Cache the element as a Zepto object
			var $elm = $(elm);

			// Cache other DOM elements
			Player.elements = {};
			Player.elements.$player = $elm;
			Player.elements.$text = $elm.find('.text');
			Player.elements.$time = $elm.find('.time');

			// Instantiate a new Audio object
			Player.audio = new Audio();

			// Set the source of the audio object if the data-source attribute exists
			if($elm.attr('data-source')) {
				Player.setSource($elm.attr('data-source'));
			}

			// Set the display text if the data-default attribute exists
			if(Player.elements.$text.attr('data-default')) {
				Player.displayText(Player.elements.$text.attr('data-default'));
			}

			// Bind Audio events
			$(Player.audio).on('timeupdate', Player.displayTime);
			$(Player.audio).on('canplay', Player.displayTime);

			// Bind DOM events
			$elm.on('click', '.play', this.play);

		},
		load: function (options) {

			// Must have a valid source
			if(!Player.parseValidAudioFormat(options.url)) {
				Player.error('Invalid audio url.');
				return;
			}

			// Stop audio
			Player.pause();

			// Set the values
			Player.displayText(options.text);
			Player.setSource(options.url);

		},
		error: function (message) {
			// Cache current message
			var prevMessage = Player.elements.$text.text();

			// Display the error message
			Player.displayText('Error: ' + message);

			// After 3 seconds, return to the previous message
			setInterval(function(){
				Player.displayText(prevMessage);
			}, 3000)
		},
		setSource: function (url) {

			// Set the audio source to the new URL
			Player.audio.src = url;

		},
		displayText: function (text) {

			Player.elements.$text.text(text);

		},
		displayTime: function () {

			// Parse the time properties fromt the audio object
			var currentTime = Player.parseSecondsToReadableFormat(Player.audio.currentTime);
			var duration = '';
			if(Player.audio.duration) {
				duration = ' of ' + Player.parseSecondsToReadableFormat(Player.audio.duration);		
			} else {
				currentTime = 'loading...';
			}


			// Create a time string
			var timeString = currentTime + duration;

			// Update the view
			Player.elements.$time.text(timeString);

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
				if( $.inArray(ext, whitelist) > -1 ) {
					// If it exists, it's valid
					valid = true;
				}
			}

			return valid;

		},
		play: function () {

			// We use the same buton for play and pause
			if(Player.playing) {

				return Player.pause();

			}

			// Start audio
			Player.audio.play();

			// Set a playing property
			Player.playing = true;

			// Set the DOM element to playing
			Player.elements.$player.addClass('playing');

		},
		pause: function () {

			// Pause audio
			Player.audio.pause();

			// Unset the playing property
			Player.playing = false;

			// Unset the DOM playing class
			Player.elements.$player.removeClass('playing');

		}
	};

	// Expose the functions as collection methods.
	$.extend($.fn, {
		// This method initializes values from attributes and binds events.
		player: function () {
			// We only support one player element (for now)
			Player.init(this[0]);
			return this;
		},
		// Play Method
		play: function () {
			Player.play();
			return this;
		},
		// Pause Method
		pause: function () {
			Player.pause();
			return this;
		},
		// Load a new source URL
		load: function (options) {
			Player.load(options);
			return this;
		}
	});

})(Zepto || jQuery);