var gulp = require('gulp');
var plumber = require('gulp-plumber');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var hbsfy = require('hbsfy');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var bourbon = require("bourbon").includePaths;
var neat = require("bourbon-neat").includePaths;
var browserSync = require("browser-sync");


gulp.task("browserSync", function() {
  browserSync({
    server: {
      baseDir: "./dist"
    }
  })
});

gulp.task('sass', function() {
  gulp.src('src/scss/**/*.scss')
    .pipe(plumber())
    .pipe(sass({
       includePaths: [bourbon, neat]
    }))
    .pipe(sourcemaps.init())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(sass({outputStyle: 'compressed'})
    .on('error', sass.logError))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('html', function() {
   gulp.src('./src/*.html')
   .pipe(gulp.dest('./dist'));
});

gulp.task('js', function () {

  var b = browserify({
    entries: './src/js/main.js',
    debug: true,
    transform: ['hbsfy']
  });

  return b.bundle()
    .on('error', function(err){
      gutil.log(gutil.colors.red(err.toString()));
      gutil.beep();
      this.emit('end');

    })
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .on('error', gutil.log)
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('./dist/js/'));
});

gulp.task('watch', ['build', 'browserSync'], function() {
  gulp.watch('src/**/*', ['build']);
  gulp.watch('dist/**/*').on('change', browserSync.reload);
});

gulp.task('default', ['watch']);

gulp.task('build', ['js', 'sass', 'html']);
