'use strict';

const gulp = require('gulp'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    foreach = require('gulp-flatmap'),
    browserSync = require('browser-sync').create(),
    autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano'),
    changed = require('gulp-changed'),
    merge = require('merge-stream'),
    Fiber = require('fibers'),
    header = require('gulp-header');

sass.compiler = require('sass');

const plugins = [
    autoprefixer,
    cssnano({
        preset: ['default', {
            discardComments: {
                removeAll: true
            }
        }]
    })
];

const paths = {
    styles: {
        src: './assets/scss/style.scss',
        dest: './'
    },
    scripts: {
        src: [
            './assets/js/sources/*.js',
            './node_modules/jquery/dist/jquery.js',
            './node_modules/popper.js/dist/umd/popper.js',
            './node_modules/bootstrap/dist/js/bootstrap.js'
        ],
        dest: './assets/js'
    },
    site: {
        url: 'http://bootstrap.test'
    }
}

const pkg = require('./package.json');

const banner = [
    '/**',
    '* <%= pkg.name %> - <%= pkg.description %>',
    '* @version v<%= pkg.version %>',
    '* @link <%= pkg.repository %>',
    '* @license <%= pkg.license %>',
    '*/',
    ''
].join('\n');

function style() {
    return gulp.src(paths.styles.src)
        .pipe(changed(paths.styles.dest))
        .pipe(sass({fiber: Fiber}).on('error', sass.logError))
        .pipe(concat('style.scss'))
        .pipe(postcss(plugins))
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(rename('style.css'))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.reload({stream: true}))
}

function js() {
    return gulp.src(paths.scripts.src)
        .pipe(changed(paths.scripts.dest))
        .pipe(foreach(function(stream, file){
            return stream
                .pipe(uglify())
                .pipe(rename({suffix: '.min'}))
        }))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(browserSync.reload({stream: true}))
}

function browserSyncServe(done) {
    browserSync.init({
        injectChanges: true,
        proxy: paths.site.url
    })
}

function browserSyncReload(done) {
    browserSync.reload();
    done();
}

function watch() {
    gulp.watch(['./assets/scss/**/*'], style);
    gulp.watch(
    [
        './**/*.php',
        './**/*.html',
        './assets/js/**/*.js',
        './assets/images/**/*'
    ],
    browserSyncReload);
}

gulp.task('default', gulp.parallel(style, js, browserSyncServe, watch));