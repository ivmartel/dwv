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
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> */\n'
            },
            dist: {
                src: ['resources/module/intro.js', 'src/**/*.js', 'resources/module/outro.js'],
                dest: 'build/dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> */\n'
            },
            dist: {
                files: {
                    'build/dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
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
        },
        copy: {
            main: {
                files: [
                    {
                        src: 'build/dist/<%= pkg.name %>.js',
                        dest: '../dwv-jqmobile/node_modules/dwv/dist/<%= pkg.name %>.js'
                    },
                    {
                        src: 'build/dist/<%= pkg.name %>.min.js',
                        dest: '../dwv-jqmobile/node_modules/dwv/dist/<%= pkg.name %>.min.js'
                    }
                ]
            }
        },
        watch: {
            scripts: {
                files: ['**/*.js', '!**/node_modules/**'],
                tasks: ['concat', 'copy'],
                options: {
                    spawn: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-qunit-istanbul');

    // tasks
    grunt.registerTask('test', ['jshint', 'qunit']);
    grunt.registerTask('build', ['concat', 'uglify']);
    grunt.registerTask('doc', ['jsdoc']);
};
