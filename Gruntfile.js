module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        qunit: {
            files: ['tests/tests.html']
        }
    });

    // Task to run tests
    grunt.registerTask('test', 'qunit');
};

