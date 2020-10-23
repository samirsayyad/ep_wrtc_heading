const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const mode = require('gulp-mode')();
const sourcemaps = require('gulp-sourcemaps');

const jsfiles = [

		"./static/js/libraries/getUserMediaPolyfill.js",

	"./static/js/libraries/lib/RTCMultiConnection.min.js",
	"./static/js/libraries/adapter.js",
	// "./static/js/libraries/lib/adapter.js",
	"./static/js/libraries/lib/getHTMLMediaElement.js",
	// "./static/js/libraries/lib/tinyqueue.min.js",

	"./static/js/libraries/CodecsHandler.js",
	"./static/js/libraries/getStats.min.js",
	"./static/js/libraries/BandwidthHandler.js",

	
	"./static/js/libraries/copyPasteEvents.js",


	

	"./static/js/libraries/jquery.tmpl.min.js",
	
	"./static/js/libraries/clientShare.js",
	"./static/js/libraries/textChat.js",
	"./static/js/libraries/videoChat.js",
	"./static/js/libraries/webrtcRoom.js",

	"./static/js/libraries/webrtc.js",



]

//gulp --production
const gulpifyJs = function () {    
	return gulp.src(jsfiles)
		.pipe(mode.production(sourcemaps.init()))
		.pipe(mode.production(uglify(/* options */)))
		.pipe(concat('wrtc.heading.mini.js'))
		.pipe(mode.production(sourcemaps.write('.')))
		.pipe(gulp.dest('static/js'));
}

gulp.task('js', gulpifyJs);

gulp.task('watch', function() {
	gulp.watch(jsfiles, gulp.series(['js']));
})