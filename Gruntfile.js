module.exports = function( grunt ){
    require( 'jit-grunt' )( grunt, {
        mochacli : "grunt-mocha-cli"
    } );
    var browsers = [
        {
            browserName : "firefox",
            version     : "25",
            platform    : "WIN8"
        }, {
            browserName : "firefox",
            version     : "24",
            platform    : "WIN8"
        }, {
            "browserName" : "chrome",
            "platform"    : "OS X 10.9",
            "version"     : "31"
        }, {
            browserName : "chrome",
            version     : "30",
            platform    : "XP"
        }, {
            browserName : 'internet explorer',
            platform    : 'WIN8',
            version     : '10'
        }, {
            browserName : 'internet explorer',
            platform    : 'VISTA',
            version     : '9'
        }, {
            browserName : 'safari',
            platform    : 'Mac 10.8',
            version     : '6'
        }, {
            browserName : 'safari',
            platform    : 'Mac 10.6',
            version     : '5'
        }, {
            browserName : 'iphone',
            platform    : 'Mac 10.8',
            version     : '6'
        }, {
            browserName : 'iphone',
            platform    : 'Mac 10.8',
            version     : '5.1'
        }, {
            browserName : 'ipad',
            platform    : 'Mac 10.8',
            version     : '6'
        }, {
            browserName : 'ipad',
            platform    : 'Mac 10.8',
            version     : '5.1'
        }
    ];

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
