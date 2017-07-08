var gulp = require('gulp');
var path = require('path');
var less = require('gulp-less');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var minify = require('gulp-minify');
var replace = require('gulp-replace');

gulp.task('default', ['less', 'js', 'iconfont', 'sw']);

gulp.task('less', function() {
  return gulp.
    src('less/*.less').
    pipe(less({
      paths: [path.join(__dirname, 'less', 'include')]
    })).
    pipe(cleanCSS()).
    pipe(gulp.dest('bundle'));
});

gulp.task('js', function() {
  return gulp.
    src(['js/vue.js', 'js/boards.js', 'js/sudoku.js']).
    pipe(concat('sudoku.js')).
    pipe(minify()).
    pipe(gulp.dest('bundle'));
});

gulp.task('iconfont', function() {
  return gulp.
    src(['iconfont/*']).
    pipe(gulp.dest('bundle'));
});

gulp.task('sw', function() {
  return gulp
    .src(['sw.js'])
    .pipe(replace(/sudoku_v\d+/, 'sudoku_v' + new Date().getTime()))
    .pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
  gulp.watch('./index.html', ['sw']);
  gulp.watch('./js/*.js', ['js', 'sw']);
  gulp.watch('./less/**/*.less', ['less', 'sw']);
  gulp.watch('./iconfont/*', ['iconfont', 'sw']);
})

