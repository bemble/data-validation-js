var gulp = require('gulp');

//--------------------------------------------------
// Tasks
//--------------------------------------------------
gulp.task('tsd', tsdTask);
gulp.task('test', testTask);
gulp.task('typescript', typescriptTask);
gulp.task('build:clean', buildCleanTask);
gulp.task('build:test', ['typescript'], buildTestTask);
gulp.task('build:lib', buildLibTask);
gulp.task('build:changelog', buildChangelogTask);
gulp.task('build', buildTask);
gulp.task('prepublish:checkEverythingCommitted', prepublishCheckEverythingCommittedTask);
gulp.task('prepublish:checkMasterPushed', prepublishCheckMasterPushedTask);
gulp.task('prepublish', prepublishTask);
require('gulp-release-tasks')(gulp);


//--------------------------------------------------
// Tasks dependencies
//--------------------------------------------------
var tsd = require('gulp-tsd');
var mocha = require('gulp-mocha');
var changed = require('gulp-changed');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var concat = require('gulp-concat-util');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var conventionalChangelog = require('gulp-conventional-changelog');
var rename = require("gulp-rename");
var runSequence = require('run-sequence');
var gutil = require('gulp-util');
var git = require('gulp-git');
var del = require('del');


//--------------------------------------------------
// Tasks implementations
// npm install gulp-cli -g and gulp --tasks
//--------------------------------------------------
tsdTask.description = "Install Typescript description files";
function tsdTask(done) {
  tsd({
    command: 'reinstall',
    config: './tsd.json'
  }, done);
};

testTask.description = "Run unit tests";
function testTask(done) {
  require('source-map-support').install();
  return gulp.src('tests/**/*.spec.js')
  .pipe(mocha({
    reporter: 'dot'
  }))
  .on('error', function() {
    done();
  });
};

typescriptTask.description = "Transpile Typescript files";
var tsProject = ts.createProject('tsconfig.json');
function typescriptTask() {
  var tsProject = ts.createProject('tsconfig.json', {declaration: true});
  return tsProject.src()
  .pipe(changed('.', {extension: '.js'}))
  .pipe(sourcemaps.init())
  .pipe(ts(tsProject)).js
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('./'));
};

/*
* Build tasks
*/
buildCleanTask.description = "Clean build dir";
function buildCleanTask() {
  return del(['./dist']);
};

buildTypescriptTask.description = "Build Typescript files";
function buildTypescriptTask() {
  return gulp.src(['./src/**/*.ts'], {base: './src'})
  .pipe(ts(tsProject))
  .pipe(gulp.dest('./dist'));
};

buildTestTask.description = "Run the tests and stop when fail";
function buildTestTask() {
  return gulp.src('tests/**/*.spec.js')
  .pipe(mocha({
    reporter: 'dot'
  }));
};

buildLibTask.description = "Build the standalone version of the module";
function buildLibTask() {
  var buildVersion = require('./package.json');
  var nodeModuleVersion = require('./node_modules/data-validation/package.json');
  var headerString = '/*\n * data-validation-js v.' + buildVersion.version + ', '+buildVersion.homepage;
  headerString += '\n * data-validation v.' + nodeModuleVersion.version + ', '+nodeModuleVersion.homepage;
  headerString += '\n * Licence ' + buildVersion.license + '\n */\n';

  var b = browserify({
    entries: './src/data-validation.ts'
  })
  .plugin('tsify', tsProject.options);

  return b.bundle()
  .pipe(source('./src/data-validation.ts'))
  .pipe(buffer())
  .on('error', gutil.log)
  .pipe(rename({
    dirname: "./",
    extname: ".js"
  }))
  .pipe(concat.header(headerString))
  .pipe(gulp.dest('./dist'))
  .pipe(uglify())
  .pipe(rename({
    suffix: ".min"
  }))
  .pipe(concat.header(headerString))
  .pipe(gulp.dest('./dist'));
}

buildChangelogTask.description = "Build the changelog";
function buildChangelogTask() {
  return gulp.src('CHANGELOG.md', { buffer: false })
  .pipe(conventionalChangelog({
    preset: 'angular'
  }))
  .pipe(gulp.dest('./'));
};

buildTask.description = "Build the package";
function buildTask(done) {
  runSequence(
    'build:clean', 'build:test', 'build:lib', 'build:changelog',
    function (error) {
      done(error ? new gutil.PluginError('build', error.message, {showStack: false}) : undefined);
    }
  );
};

/*
* Prepublish tasks
*/
prepublishCheckEverythingCommittedTask.description = "Check if everything is committed";
function prepublishCheckEverythingCommittedTask(done) {
  git.status({args: '--porcelain', quiet: true}, function (err, stdout) {
    var message = err || (stdout.length !== 0 && "Some files are not committed");
    done(message ? new gutil.PluginError('prepublish:checkEverythingCommitted', message, {showStack: false}) : undefined);
  });
};

prepublishCheckMasterPushedTask.description = "Check if every commits are pushed on origin";
function prepublishCheckMasterPushedTask(done){
  git.exec({args : 'log origin/master..master', quiet: true}, function (err, stdout) {
    var message = err || (stdout.length !== 0 && "Commits are not pushed");
    done(message ? new gutil.PluginError('prepublish:checkMasterPushed', message, {showStack: false}) : undefined);
  });
}

prepublishTask.description = "Run before publish to check if everyhting is fine before the publication";
function prepublishTask(done) {
  runSequence(
    'build', 'prepublish:checkEverythingCommitted', 'prepublish:checkMasterPushed',
    function (error) {
      done(error ? new gutil.PluginError('prepublish', error.message, {showStack: false}) : undefined);
    }
  );
};
