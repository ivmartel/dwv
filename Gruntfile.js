module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        qunit: {
            files: ['tests/tests.html']
        },
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'tests/**/*.js']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    
    // Task to run tests
    grunt.registerTask('test', ['jshint', 'qunit']);
};

