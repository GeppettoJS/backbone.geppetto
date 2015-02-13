module.exports = function( grunt ){
    require( 'jit-grunt' )( grunt, {
        mochacli : "grunt-mocha-cli"
    } );

    var pkgConfig = grunt.file.readJSON( 'package.json' );
    pkgConfig.version = grunt.file.readJSON( 'version.json' ).version;
    grunt.initConfig( {

        pkg    : pkgConfig,
        mochacli          : {
            options : {
                reporter : "spec",
                bail     : true
            },
            all     : [
                "specs/events.specs.js",
                //"specs/API-helpers.specs.js", "specs/API-wiring.specs.js", "specs/API-providing.specs.js",
                //"specs/provider-singleton.specs.js", "specs/provider-multiton.specs.js",
                //"specs/provider-value.specs.js", "specs/provider-unresolved.specs.js",
                //"specs/provider-producer.specs.js", "specs/provider-constructor.specs.js"
            ]
        }
    } );

    grunt.registerTask( 'travis', [ 'test' ] );
    grunt.registerTask( 'test', [ 'mochacli' ] );
    grunt.registerTask( 'default', [ 'test' ] );
};
