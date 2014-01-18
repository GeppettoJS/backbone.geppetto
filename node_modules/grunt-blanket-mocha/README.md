# grunt-blanket-mocha

> Headless Blanket.js code coverage and Mocha testing via PhantomJS

## Wat?

Other plugins look similar, but are different in that they:

* Only test *server-side* code
* Create *new instrumented copies* of your source code for coverage detection
* Generate coverage reports in HTML or JSON formats requiring a separate step to parse and evaluate coverage
* Do not *enforce* coverage thresholds, but just report on it

This plugin, however:

* Runs *client-side* mocha specs
* Performs code coverage "live" using BlanketJS, without creating separate instrumented copies
* Reports coverage info directly to the Grunt task
* Will fail the build if minimum coverage thresholds are not defined

## Parent Plugin

This plugin is based on [kmiyashiro/grunt-mocha](https://github.com/kmiyashiro/grunt-mocha) and supports all the 
configurations of that plugin.  Please see that repo for more options on configuration.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-blanket-mocha --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-blanket-mocha');
```

## Blanket.js dependency

This plugin requires Blanket.js v1.1.5 which is currently still in development.  Check the blanket.js version in the [dev branch](https://github.com/alex-seville/blanket/blob/development/dist/mocha/blanket.js) in the meantime.  

## The "blanket_mocha" task

### See Also

This plugin is based off of grunt-contrib-mocha.  For general config options and examples, please see that repo.

## Setup

### Gruntfile

In your project's Gruntfile, add a section named `blanket_mocha` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  blanket_mocha: {
    all: [ 'specs/index.html' ],
    options: {
        threshold: 70
    }
  }
})
```

Use the `all` param to specify where your mocha browser spec HTML file lives.  
This works the same way as it does in the base `grunt-mocha` plugin.  

NOTE: Be sure to include the blanketJS script tag in your test html file

### Blanket Adapter

To allow Blanket to communicate with the parent Grunt process, add this snippet in your test HTML, after all the 
other scripts:

```html
<script>
    if (window.PHANTOMJS) {
        blanket.options("reporter", "../node_modules/grunt-blanket-mocha/support/grunt-reporter.js");            
    }
</script>
```

NOTE: The above path is assuming that the specs are being run from a directory one deeper than the root directory.  
Adjust the path accordingly.

NOTE 2: The conditional `if (window.PHANTOMJS)` statement is there because of the hacky way that messages are passed
between an HTML page and the PhantomJS process (using alerts).  Without this condition, you would get bombarded 
with alert messages in your in-browser mocha report.

### BlanketJS HTML Report

If you want to see blanketJS coverage reports in the browser as well (useful for visually scanning which lines have 
coverage and which do not) include this snippet it in your test html blanket and mocha.

```html
<script type="text/javascript" src="../node_modules/grunt-blanket-mocha/support/mocha-blanket.js"></script>
```

NOTE: The above path is assuming that the specs are being run from a directory one deeper than the root directory.  
Adjust the path accordingly.

### Options

#### options.threshold
Type: `Number`
Default value: `60`

The minimum percent coverage per-file.  Any files that have coverage below this threshold will fail the build.  By default, only the failing files will be output in the console.  To show passing files as well, use the grunt `--verbose` option.

#### options.moduleThreshold
Type: `Number`
Default value: undefined

The minimum percent coverage per-module.  Any modules that have coverage below this threshold will fail the build.  Both passing and failing module statistics will be shown in the output.

This option requires that the `modulePattern` property is also set (see below).

#### options.modulePattern
Type: `RegEx`
Default value: undefined

A regular expression defining how to extract a module name from the path of a covered file.  The regular expression should include
a single parenthetical expression which will be matched as the module name.  For example, to define the module name as the text
in between the first two slashes, you could use:

```
modulePattern: "./(.*?)/"
```

#### options.globalThreshold
Type: `Number`
Default value: undefined

The minimum percent coverage overall, averaged for all files.  An average coverage percentage below this 
value will fail the build.Both passing and failing module statistics will be shown in the output.

#### options.excludedFiles
Type: `Array`
Default value: undefined

List filenames that need to be excluded. This will inform the Grunt Task to not mark these files as failed. The result will be printed as,
SKIP: [..%] filename

Example:
`excludedFiles: [
  "./src/my/file1.js",
  "./src/my/project/file2.js"
]` 

### Command Line Options

#### threshold

Override the threshold specified in the Gruntfile.  

For example, if you wanted to test your files using a 90% threshold, and the Gruntfile had a different threshold specified, you could override it like so:

`grunt --threshold=90`

#### moduleThreshold

Override the moduleThreshold specified in the Gruntfile.  

For example, if you wanted to test your files using a 90% module threshold, and the Gruntfile had a different module threshold specified, you could override it like so:

`grunt --moduleThreshold=90`

#### globalThreshold

Override the globalThreshold specified in the Gruntfile.  

For example, if you wanted to test your files using a 90% global threshold, and the Gruntfile had a different global threshold specified, you could override it like so:

`grunt --globalThreshold=90`

#### excludedFiles

List the files to be excluded as an array.  
Example,
`grunt --excludedFiles=["./src/my/file1.js", "./src/my/project/file2.js"]`

#### grep

Only run test specs that match a certain pattern.

For example, if you only wanted to run specs that match the word "login" you could run:

`grunt --grep="login"`

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

### 0.3.1
*Released 6 September 2013*

* Fix keyword listing so the plugin shows up in Grunt plugins repo

### 0.3.0
*Released 25 August 2013*

* Add ability to manually exclude files(shows as 'skipped')

### 0.2.0
*Released 1 August 2013*

* Fix issue where failing mocha test did not fail the build

### 0.1.3
*Released 31 July 2013*

* Initial release
