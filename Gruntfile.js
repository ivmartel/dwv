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
            all: ['tests/tests.html'],
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
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: 'src/',
                    outdir: 'dist/doc/'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-qunit-istanbul');
    
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    
    // Task to run tests
    grunt.registerTask('publish', ['jshint', 'qunit', 'concat', 'uglify', 'yuidoc']);
};

