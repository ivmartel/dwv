/* global module */
module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'tests/**/*.js', 'viewers/mobile/src/*.js', '!src/utils/modernizr.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        qunit: {
            all: ['tests/index.html'],
            options: {
                '--web-security': 'no',
                coverage: {
                    disposeCollector: true,
                    src: [ "src/**/*.js" ],
                    instrumentedFiles: "/tmp/ivmartel/dwv",
                    htmlReport: "build/report/coverage",
                    lcovReport: "build/report/lcov",
                    linesThresholdPct: 0
                }
            }
        },
        coveralls: {
            options: {
                // don't fail if coveralls fails
                force: true
            },
            main_target: {
                src: "build/report/lcov/lcov.info"
            }
        },
        concat: {
            dist: {
                src: ['resources/module/intro.js', 'src/**/*.js', 'resources/module/outro.js'],
                dest: 'build/dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'build/dist/<%= pkg.name %>-<%= pkg.version %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        jsdoc: {
            dist : {
                src: ['src/**/*.js', 'tests/**/*.js', 'resources/doc/readme-doc.md'],
                options: {
                    destination: 'build/doc',
                    template: 'node_modules/ink-docstrap/template',
                    configure: 'resources/doc/jsdoc.conf.json'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-qunit-istanbul');
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jsdoc');

    // Task to run tests
    grunt.registerTask('publish', ['jshint', 'qunit', 'coveralls', 'concat', 'uglify', 'jsdoc']);
};
