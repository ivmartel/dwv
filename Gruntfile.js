/* global module */
module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'viewers/**/*.js', 'tests/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        qunit: {
            all: ['tests/index.html'],
            options: {
                coverage: {
                    src: [ "src/**/*.js" ],
                    instrumentedFiles: "temp/",
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
            options: {
                separator: ';'
            },
            dist: {
                src: ['src/**/*.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>-<%= pkg.version %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        jsdoc: {
            dist : {
                src: ['src/**/*.js', 'tests/**/*.js', 'resources/readme-doc.md'],
                options: {
                    destination: 'dist/doc',
                    template: 'node_modules/ink-docstrap/template',
                    configure: 'resources/jsdoc.conf.json'
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
