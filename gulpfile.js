"use strict";

const gulp = require('gulp'),
      less = require('gulp-less'),
      join = require('path').join,
      writeFileSync = require('fs').writeFileSync,
      forOwn = require('lodash').forOwn,
      packageJson = require('./package'),
      jshint = require('gulp-jshint'),
      Karma = require('karma').Server;

let jshintConfig = {};

require.extensions['.json'](jshintConfig, './.jshintrc');

var lessPath = './assets/**/sty*.less';
var srcPath = './application.js';
var distPath = './dist';

jshintConfig = jshintConfig.exports;

jshint.bound = jshint.bind(null, jshintConfig);

function buildTestTask() {
  let framework = arguments[0];
  let args = [].slice.call(arguments, 1).join(' ');
  return `node node_modules/${framework}/bin/${framework} ${args}`;
}
function buildStartTask() {
  return `node server`;
}

gulp.task('default', ['build', 'jshint']);

gulp.task("build", ['build:styles']);

const reserved = [];

gulp.task('build:tasks', function () {
  packageJson.scripts = {};
  forOwn(gulp.tasks, function (value, key, obj) {
    if (~reserved.indexOf(key)) return;
    packageJson.scripts[key] = `node ${join('node_modules', 'gulp', 'bin', 'gulp')} ${key}`;
    packageJson.scripts.start = buildStartTask();
  });
  writeFileSync('./package.json', JSON.stringify(packageJson, null, 1));
});

gulp.task('test', function (done) {
  if (!process.env.DISPLAY) process.env.DISPLAY = ':0';
  new Karma({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('build:styles', function () {
  return gulp.src(lessPath)
    .pipe(less())
    .pipe(gulp.dest(distPath));
});

gulp.task('jshint', function () {
  return gulp.src(srcPath)
    .pipe(jshint.bound())
    .pipe(jshint.reporter('jshint-stylish'));
});
