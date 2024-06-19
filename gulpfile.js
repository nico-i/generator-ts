/* eslint-disable @typescript-eslint/no-var-requires */
const gulp = require("gulp");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

gulp.task("transpile", () =>
	tsProject.src().pipe(tsProject()).js.pipe(gulp.dest(".")),
);

gulp.task("copy", () =>
	gulp.src("src/generators/**/templates").pipe(gulp.dest(`./generators`)),
);

gulp.task("build", gulp.series("transpile", "copy"));

gulp.task("watch", () => {
	gulp.watch("src/**/*.ts", gulp.series("build"));
	gulp.watch("src/generators/**/templates/**/*", gulp.series("copy"));
});

gulp.task("default", gulp.series("build"));
