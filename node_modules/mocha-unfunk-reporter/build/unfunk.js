var unfunk;
(function (unfunk) {
    (function (error) {
        var splitLine = /[\r\n]+/g;

        error.moduleFilters = ['mocha', 'chai', 'proclaim', 'assert', 'expect', 'should', 'chai-as-promised', 'q', 'mocha-as-promised'];
        error.nodeFilters = ['node.js'];
        error.webFilters = ['mocha.js', 'chai.js', 'assert.js', 'proclaim.js'];

        var assertType = /^AssertionError/;
        var anyLinExp = /^ *(.*) *$/gm;
        var stackLineExp = /^    at (.+)$/;
        var anyLinExp = /^ *(.*) *$/gm;

        var StackElement = (function () {
            function StackElement(text, lineRef) {
                this.text = text;
                this.lineRef = lineRef;
            }
            return StackElement;
        })();
        error.StackElement = StackElement;

        var ParsedError = (function () {
            function ParsedError(error) {
                this.name = '';
                this.message = '<no message>';
                this.stack = [];
                this.isAssertion = false;
                this.error = error;
            }
            ParsedError.prototype.getStandard = function (prepend, indent) {
                if (typeof prepend === "undefined") { prepend = ''; }
                if (typeof indent === "undefined") { indent = ''; }
                var ret = this.getHeader(prepend);
                ret += '\n' + this.getHeadlessStack(prepend, indent);
                return ret;
            };

            ParsedError.prototype.getHeader = function (prepend) {
                if (typeof prepend === "undefined") { prepend = ''; }
                if (this.isAssertion) {
                    return prepend + this.message;
                }
                return prepend + (this.name ? this.name + ': ' : '') + this.message;
            };

            ParsedError.prototype.getHeaderSingle = function (prepend) {
                if (typeof prepend === "undefined") { prepend = ''; }
                if (this.isAssertion) {
                    return prepend + (this.message.match(/^.*$/m)[0]);
                }
                return prepend + (this.name ? this.name + ': ' : '') + (this.message.match(/^.*$/m)[0]);
            };

            ParsedError.prototype.getHeadlessStack = function (prepend, indent) {
                if (typeof prepend === "undefined") { prepend = ''; }
                if (typeof indent === "undefined") { indent = ''; }
                return this.stack.reduce(function (lines, element) {
                    if (element.lineRef) {
                        lines.push(prepend + indent + 'at ' + element.text);
                    } else {
                        lines.push(prepend + element.text);
                    }
                    return lines;
                }, []).join('\n');
            };

            ParsedError.prototype.hasStack = function () {
                return this.stack.length > 0;
            };

            ParsedError.prototype.toString = function () {
                if (this.isAssertion) {
                    return this.message;
                }
                return (this.name ? this.name + ': ' : '<no name>') + this.message;
            };
            return ParsedError;
        })();
        error.ParsedError = ParsedError;

        var StackFilter = (function () {
            function StackFilter(style) {
                this.style = style;
                this.filters = [];
            }
            StackFilter.prototype.parse = function (error, stackFilter) {
                var parsed = new ParsedError(error);
                if (!error) {
                    parsed.name = '<undefined error>';
                    return parsed;
                }
                parsed.name = error.name;
                parsed.isAssertion = assertType.test(parsed.name);
                if (error.message) {
                    parsed.message = error.message;
                } else if (error.operator) {
                    parsed.message = unfunk.toDebug(error.actual, 50) + ' ' + this.style.accent(error.operator) + ' ' + unfunk.toDebug(error.expected, 50) + '';
                }

                if (error.stack) {
                    var stack = error.stack;
                    var seenAt = false;
                    var lineMatch;
                    var stackLineMatch;

                    anyLinExp.lastIndex = 0;

                    while ((lineMatch = anyLinExp.exec(stack))) {
                        anyLinExp.lastIndex = lineMatch.index + (lineMatch[0].length || 1);
                        if (!lineMatch[1]) {
                            continue;
                        }
                        stackLineExp.lastIndex = 0;
                        stackLineMatch = stackLineExp.exec(lineMatch[0]);
                        if (stackLineMatch) {
                            parsed.stack.push(new StackElement(stackLineMatch[1], true));
                            seenAt = true;
                            continue;
                        } else if (seenAt) {
                            parsed.stack.push(new StackElement(lineMatch[1], false));
                        }
                    }
                    if (stackFilter) {
                        parsed.stack = this.filter(parsed.stack);
                    }
                } else {
                    parsed.stack.push(new StackElement('<no error.stack>', false));
                }
                return parsed;
            };

            StackFilter.prototype.addModuleFilters = function (filters) {
                var _this = this;
                filters.forEach(function (filter) {
                    filter = '/node_modules/' + filter + '/';
                    var exp = new RegExp(filter.replace(/\\|\//g, '(\\\\|\\/)'));
                    _this.filters.push(exp);
                }, this);
            };

            StackFilter.prototype.addFilters = function (filters) {
                var _this = this;
                filters.forEach(function (filter) {
                    var exp = new RegExp(filter.replace(/\\|\//g, '(\\\\|\\/)'));
                    _this.filters.push(exp);
                }, this);
            };

            StackFilter.prototype.filter = function (lines) {
                if (lines.length === 0) {
                    return [new StackElement('<no lines in stack>', false)];
                }
                if (this.filters.length === 0) {
                    return lines;
                }
                var cut = -1;
                var i, line;

                for (i = lines.length - 1; i >= 0; i--) {
                    line = lines[i];
                    if (this.filters.some(function (filter) {
                        return filter.test(line.text);
                    })) {
                        cut = i;
                    } else if (cut > -1) {
                        break;
                    }
                }
                if (cut > 0) {
                    lines = lines.splice(0, cut);
                }
                if (lines.length === 0) {
                    return [new StackElement('<no unfiltered calls in stack>', false)];
                }
                return lines;
            };
            return StackFilter;
        })();
        error.StackFilter = StackFilter;
    })(unfunk.error || (unfunk.error = {}));
    var error = unfunk.error;
})(unfunk || (unfunk = {}));

var unfunk;
(function (unfunk) {
    var jsesc = require('jsesc');
    var ministyle = require('ministyle');
    var miniwrite = require('miniwrite');
    var DiffFormatter = require('unfunk-diff').DiffFormatter;

    var Stats = (function () {
        function Stats() {
            this.suites = 0;
            this.tests = 0;
            this.passes = 0;
            this.pending = 0;
            this.failures = 0;
            this.duration = 0;
            this.start = 0;
            this.end = 0;
        }
        return Stats;
    })();
    unfunk.Stats = Stats;

    var expose;
    var options = {
        writer: 'log',
        style: 'ansi',
        stream: null,
        stackFilter: true,
        reportPending: false,
        width: 0
    };

    var tty = require('tty');
    var isatty = (tty.isatty('1') && tty.isatty('2'));

    function getViewWidth() {
        if (options.width > 0) {
            return options.width;
        }
        if (isatty) {
            return Math.min(options.width, process.stdout['getWindowSize'] ? process.stdout['getWindowSize'](1)[0] : tty.getWindowSize()[1]);
        }
        return 80;
    }

    function option(nameOrHash, value) {
        if (arguments.length === 1) {
            if (typeof nameOrHash === 'object') {
                for (var name in nameOrHash) {
                    if (nameOrHash.hasOwnProperty(name)) {
                        options[name] = nameOrHash[name];
                    }
                }
            }
        } else if (arguments.length === 2) {
            if (typeof value !== 'undefined' && typeof nameOrHash === 'string') {
                var propLower = nameOrHash.toLowerCase();
                for (var name in options) {
                    if (options.hasOwnProperty(name)) {
                        var nameLower = name.toLowerCase();
                        if (nameLower === propLower) {
                            options[name] = value;
                        }
                    }
                }
            }
        }
        return expose;
    }

    function importEnv() {
        var pattern = /^mocha[_-]unfunk[_-]([\w]+(?:[\w_-][\w]+)*)$/i;
        var obj;
        if (typeof process !== 'undefined' && process.env) {
            obj = process.env;
        }
        if (obj) {
            for (var name in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, name)) {
                    pattern.lastIndex = 0;
                    var match = pattern.exec(name);
                    if (match && match.length > 1) {
                        var prop = match[1].toLowerCase();
                        option(prop, obj[name]);
                    }
                }
            }
        }
    }

    var escapableExp = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var meta = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"': '\\"',
        '\\': '\\\\'
    };
    var jsonNW = {
        json: true,
        wrap: false,
        quotes: 'double'
    };

    function escape(str) {
        escapableExp.lastIndex = 0;
        if (escapableExp.test(str)) {
            return str.replace(escapableExp, function (a) {
                var c = meta[a];
                if (typeof c === 'string') {
                    return c;
                }

                return jsesc(a, jsonNW);
            });
        }
        return str;
    }
    unfunk.escape = escape;

    function stringTrueish(str) {
        str = ('' + str).toLowerCase();
        return str != '' && str != 'false' && str != '0' && str != 'null' && str != 'undefined';
    }
    unfunk.stringTrueish = stringTrueish;

    function toDebug(value, cutoff) {
        if (typeof cutoff === "undefined") { cutoff = 20; }
        var t = typeof value;
        if (t === 'function') {
            t = '' + t;
        }
        if (t === 'object') {
            var str = '';
            var match = Object.prototype.toString.call(value).match(/^\[object ([\S]*)]$/);
            if (match && match.length > 1 && match[1] !== 'Object') {
                str = match[1];
            }
            value = str + JSON.stringify(value);
            if (value.length > cutoff) {
                value = value.substr(0, cutoff) + '...';
            }
            return value;
        }
        if (t === 'string') {
            if (value.length > cutoff) {
                return '"' + escape(value.substr(0, cutoff)) + '"' + '...';
            }
            return '"' + escape(value) + '"';
        }
        return '' + value;
    }
    unfunk.toDebug = toDebug;

    function padLeft(str, len, char) {
        str = String(str);
        char = String(char).charAt(0);
        while (str.length < len) {
            str = char + str;
        }
        return str;
    }
    unfunk.padLeft = padLeft;

    function padRight(str, len, char) {
        str = String(str);
        char = String(char).charAt(0);
        while (str.length < len) {
            str += char;
        }
        return str;
    }
    unfunk.padRight = padRight;

    function getStyler() {
        switch (options.style) {
            case 'no':
            case 'none':
            case 'plain':
                return ministyle.plain();
            case 'dev':
                return ministyle.dev();
            case 'html':
                return ministyle.html();
            case 'css':
                return ministyle.css();
            case 'ansi':
            default:
                return ministyle.ansi();
        }
    }

    function getWriter() {
        if (options.stream) {
            return miniwrite.chars(miniwrite.stream(options.stream));
        }
        switch (options.writer) {
            case 'stdout':
                return miniwrite.chars(miniwrite.stream(process.stdout));
            case 'null':
                return miniwrite.chars(miniwrite.base());
            case 'log':
            default:
                return miniwrite.chars(miniwrite.log());
        }
    }

    function pluralize(word, amount, plurl) {
        if (typeof plurl === "undefined") { plurl = 's'; }
        return amount + ' ' + (1 == amount ? word : word + plurl);
    }
    unfunk.pluralize = pluralize;

    var Unfunk = (function () {
        function Unfunk(runner) {
            this.init(runner);
        }
        Unfunk.prototype.init = function (runner) {
            importEnv();

            var stats = this.stats = new Stats();
            var out = getWriter();
            var style = getStyler();

            var diffFormat = new DiffFormatter(style, getViewWidth());
            var stackFilter = new unfunk.error.StackFilter(style);
            if (options.stackFilter) {
                stackFilter.addFilters(unfunk.error.nodeFilters);
                stackFilter.addFilters(unfunk.error.webFilters);
                stackFilter.addModuleFilters(unfunk.error.moduleFilters);
            }

            runner.stats = stats;

            var indents = 0;
            var indenter = '   ';
            var failures = this.failures = [];
            var pending = this.pending = [];
            var suiteStack = [];
            var currentSuite;

            var indent = function (add) {
                if (typeof add === "undefined") { add = 0; }
                return Array(indents + add + 1).join(indenter);
            };
            var indentLen = function (amount) {
                if (typeof amount === "undefined") { amount = 1; }
                return amount * indenter.length;
            };
            var start;

            runner.on('start', function () {
                stats.start = new Date().getTime();

                out.writeln(style.plain(''));
            });

            runner.on('suite', function (suite) {
                if (indents === 0) {
                    if (suite.suites) {
                        out.writeln(style.accent('->') + ' running ' + style.accent(pluralize('suite', suite.suites.length)));
                    } else {
                        out.writeln(style.accent('->') + ' running suites');
                    }
                    out.writeln('');
                }
                suite.parent = currentSuite;
                suiteStack.push(suite);
                currentSuite = suite;

                stats.suites++;
                if (!suite.root && suite.title) {
                    out.writeln(indent() + style.accent(suite.title));
                }
                indents++;
            });

            runner.on('suite end', function (suite) {
                indents--;
                suiteStack.pop();
                if (suiteStack.length > 0) {
                    currentSuite = suiteStack[suiteStack.length - 1];
                } else {
                    currentSuite = null;
                }

                if (1 == indents && !suite.root) {
                    out.writeln('');
                }
            });

            runner.on('test', function (test) {
                stats.tests++;
                out.write(indent(0) + style.plain(test.title + '.. '));
            });

            runner.on('pending', function (test) {
                stats.pending++;
                out.writeln(indent(0) + style.plain(test.title + '.. ') + style.warning('pending'));
                pending.push(test);
            });

            runner.on('pass', function (test) {
                stats.passes++;

                var medium = test.slow() / 2;
                test.speed = test.duration > test.slow() ? 'slow' : (test.duration > medium ? 'medium' : 'fast');

                if (test.speed === 'slow') {
                    out.writeln(style.success(test.speed) + style.error(' (' + test.duration + 'ms)'));
                } else if (test.speed === 'medium') {
                    out.writeln(style.success(test.speed) + style.warning(' (' + test.duration + 'ms)'));
                } else {
                    out.writeln(style.success('ok'));
                }
            });

            runner.on('fail', function (test, err) {
                stats.failures++;
                out.writeln(style.error('fail'));

                test.err = err;
                test.parsed = stackFilter.parse(err, options.stackFilter);

                out.writeln(style.error(padRight(stats.failures + ': ', indentLen(indents + 1), ' ')) + style.warning(test.parsed.getHeaderSingle()));

                failures.push(test);
            });

            runner.on('end', function () {
                var test;
                var sum = '';
                var fail;

                indents = 0;

                stats.end = new Date().getTime();
                stats.duration = stats.end - stats.start;

                if (stats.tests > 0) {
                    if (stats.failures > 0) {
                        fail = style.error('failed ' + stats.failures);
                        sum += fail + ' and ';
                    }

                    if (stats.passes == stats.tests) {
                        sum += style.success('passed ' + stats.passes);
                    } else if (stats.passes === 0) {
                        sum += style.error('passed ' + stats.passes);
                    } else {
                        sum += style.warning('passed ' + stats.passes);
                    }
                    sum += ' of ';
                    sum += style.accent(pluralize('test', stats.tests));
                } else {
                    sum += style.warning(pluralize('test', stats.tests));
                }

                if (pending.length > 0) {
                    sum += ', left ' + style.warning(stats.pending + ' pending');
                }

                if (options.reportPending && pending.length > 0) {
                    out.writeln(style.accent('->') + ' reporting ' + style.warning(pluralize('pending spec', pending.length)));
                    out.writeln('');
                    pending.forEach(function (test, num) {
                        var tmp = test.fullTitle();
                        var ind = tmp.lastIndexOf(test.title);
                        var title = style.accent(tmp.substring(0, ind)) + style.plain(tmp.substring(ind));
                        out.writeln(style.warning(padRight((num + 1) + ': ', indentLen(2), ' ')) + title);
                    });
                    out.writeln('');
                }
                if (failures.length > 0) {
                    out.writeln(style.accent('->') + ' reporting ' + style.error(pluralize('failure', failures.length)));
                    out.writeln('');

                    failures.forEach(function (test, num) {
                        var tmp = test.fullTitle();
                        var ind = tmp.lastIndexOf(test.title);
                        var title = style.accent(tmp.substring(0, ind)) + style.plain(tmp.substring(ind));

                        var err = test.err;
                        var parsed = test.parsed;
                        var msg = parsed.getHeader();

                        out.writeln(style.error(padRight((num + 1) + ': ', indentLen(2), ' ')) + title);
                        out.writeln('');
                        out.writeln(indent(2) + style.warning(msg));

                        if (parsed.hasStack()) {
                            out.writeln(parsed.getHeadlessStack(indent(2), indenter));
                            out.writeln('');
                        } else {
                            out.writeln('');
                        }

                        if (err.showDiff || diffFormat.forcedDiff(err.actual, err.expected)) {
                            var diff = diffFormat.getStyledDiff(err.actual, err.expected, indent(2));
                            if (diff) {
                                out.writeln(diff);
                                out.writeln('');
                            }
                        }
                    });
                }
                out.writeln(style.plain('-> ') + sum + ' (' + (stats.duration) + 'ms)');
                out.writeln('');
            });
        };
        return Unfunk;
    })();
    unfunk.Unfunk = Unfunk;

    expose = Unfunk;
    expose.option = option;
    (module).exports = expose;
})(unfunk || (unfunk = {}));
//# sourceMappingURL=unfunk.js.map
