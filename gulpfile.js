import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import rename from 'gulp-rename';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import {deleteAsync} from 'del';


// Styles

export const styles = (done) => {
  gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
    done()
}

export const html = (done) => {
   gulp.src('source/*.html')
  .pipe(gulp.dest('build'));
  done()
}

const script = (done ) => {
   gulp.src('source/js/*.js')
  .pipe(terser())
  .pipe(gulp.dest('build/js'));
  done()
}

const svg = (done) =>{
gulp.src(['source/img/*.svg', '!source/img/icons/*.svg'])
.pipe(svgo())
.pipe(gulp.dest('build/img'));
done()
}
const sprite =(done) =>{
gulp.src('source/img/icons/*.svg')
.pipe(svgo())
.pipe(svgstore({
  inlineSvg:true
}))
.pipe(rename('sprite.svg'))
.pipe(gulp.dest('build/img'));
done()
}

const optimzeImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(gulp.dest('build/img'));
}

const copyImages =(done) => {
  gulp.src('source/img/**/*.{jpg,png}')
  .pipe(gulp.dest('build/img'));
  done()
}

export const createWebp =(done) => {
  gulp.src('source/img/**/*.{jpg,png}')
  .pipe(squoosh({
    webp: {}
  }))
  .pipe(gulp.dest('build/img'));
  done()
}

const copy =(done => {
  gulp.src([
    'source/fonts/*.{woff2,woff}',
    'source/*.ico',
  ], {
    base:'source'
  })
  .pipe(gulp.dest('build'));
  done()
})

const clean = (done) =>{
  deleteAsync('build');
  done()
}

// Server

const server = async (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Watcher

const watcher = async () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/js/**/*.js', gulp.series(script));
  gulp.watch('source/*.html', gulp.series(html));
}


export const build =gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    script,
    svg,
    sprite,
    createWebp
  ),
);

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    script,
    svg,
    sprite,
    createWebp
  ),
  gulp.parallel(
  server,
   watcher
  )
);

