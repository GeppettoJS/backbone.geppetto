var unfunk;
(function (unfunk) {
    var jsesc = require('jsesc');

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
})(unfunk || (unfunk = {}));
var unfunk;
(function (unfunk) {
    var util = require('util');

    var lineExtractExp = /(.*?)(\n|(\r\n)|\r|$)/g;
    var lineBreaks = /\n|(\r\n)|\r/g;
    var stringDiff = require('diff');

    function repeatStr(str, amount) {
        var ret = '';
        for (var i = 0; i < amount; i++) {
            ret += str;
        }
        return ret;
    }

    var StringDiffer = (function () {
        function StringDiffer(diff) {
            this.diff = diff;
        }
        StringDiffer.prototype.getWrappingLines = function (actual, expected, maxWidth, rowPadLength, padFirst, leadSymbols) {
            if (typeof leadSymbols === "undefined") { leadSymbols = false; }
            var changes = stringDiff.diffChars(expected, actual);

            var escape = unfunk.escape;
            var style = this.diff.style;
            var sep = '\n';

            if (changes.length === 0) {
                return [
                    padFirst[0],
                    padFirst[1] + style.warning('<no diff data>'),
                    padFirst[1]
                ].join(sep);
            }

            var isSimple = (unfunk.identAnyExp.test(actual) && unfunk.identAnyExp.test(expected));
            var delim = (isSimple ? '' : '"');
            var delimEmpty = repeatStr(' ', delim.length);

            var top = padFirst[0];
            var middle = padFirst[1];
            var bottom = padFirst[2];

            var buffer = '';

            if (leadSymbols) {
                top += style.error(this.diff.markRemov);
                middle += style.plain(this.diff.markEmpty);
                bottom += style.success(this.diff.markAdded);

                rowPadLength += this.diff.markAdded.length;
            }

            var dataLength = maxWidth - rowPadLength;
            if (rowPadLength + delim.length * 2 >= maxWidth) {
                return '<no space for padded diff: "' + (rowPadLength + ' >= ' + maxWidth) + '">';
            }

            var rowPad = repeatStr(' ', rowPadLength);

            var blocks = [];
            var charSame = '|';
            var charAdded = '+';
            var charMissing = '-';

            var charCounter = 0;

            function delimLine() {
                top += delimEmpty;
                middle += delim;
                bottom += delimEmpty;
            }

            delimLine();

            function flushLine() {
                flushStyle();
                delimLine();
                blocks.push(top + sep + middle + sep + bottom);

                top = rowPad;
                middle = rowPad;
                bottom = rowPad;
                charCounter = 0;
                delimLine();
            }

            function appendAdd(value) {
                for (var i = 0; i < value.length; i++) {
                    top += ' ';
                    buffer += charAdded;
                }
                bottom += value;
            }

            function flushAdd() {
                if (buffer.length > 0) {
                    middle += style.success(buffer);
                    buffer = '';
                }
            }

            function appendRem(value) {
                top += value;
                for (var i = 0; i < value.length; i++) {
                    buffer += charMissing;
                    bottom += ' ';
                }
            }

            function flushRem() {
                if (buffer.length > 0) {
                    middle += style.error(buffer);
                    buffer = '';
                }
            }

            function appendSame(value) {
                top += value;
                for (var i = 0; i < value.length; i++) {
                    buffer += charSame;
                }
                bottom += value;
            }

            function flushSame() {
                if (buffer.length > 0) {
                    middle += style.warning(buffer);
                    buffer = '';
                }
            }

            function appendPlain(value) {
                top += value;
                for (var i = 0; i < value.length; i++) {
                    buffer += ' ';
                }
                bottom += value;
            }

            function flushPlainStyle() {
                middle += buffer;
                buffer = '';
            }

            var appendStyle = appendPlain;
            var flushStyle = flushPlainStyle;

            var printLine = (isSimple ? function (line, end) {
                appendStyle(line);
                charCounter += line.length;
                if (end) {
                    flushLine();
                }
            } : function (line, end) {
                for (var j = 0, jj = line.length; j < jj; j++) {
                    var value = escape(line[j]);
                    if (charCounter + value.length > dataLength) {
                        flushLine();
                    }
                    appendStyle(value);
                    charCounter += value.length;
                }
                if (end) {
                    flushLine();
                }
            });

            for (var i = 0, ii = changes.length; i < ii; i++) {
                var change = changes[i];

                flushStyle();

                if (change.added) {
                    appendStyle = appendAdd;
                    flushStyle = flushAdd;
                } else if (change.removed) {
                    appendStyle = appendRem;
                    flushStyle = flushRem;
                } else {
                    appendStyle = appendSame;
                    flushStyle = flushSame;
                }

                if (change.value.length === 0) {
                    printLine('', true);
                    continue;
                }

                var start = 0;
                var match;

                lineBreaks.lastIndex = 0;
                while ((match = lineBreaks.exec(change.value))) {
                    var line = change.value.substring(start, match.index);

                    start = match.index + match[0].length;
                    lineBreaks.lastIndex = start;

                    printLine(line + match[0], true);
                }

                if (start < change.value.length) {
                    printLine(change.value.substr(start), false);
                }
            }

            if (charCounter > 0) {
                flushLine();
            }

            if (blocks.length === 0) {
                return [
                    padFirst[0],
                    padFirst[1] + style.warning('<no diff content rendered>'),
                    padFirst[1]
                ].join(sep);
            }

            return blocks.join(sep + sep);
        };
        return StringDiffer;
    })();
    unfunk.StringDiffer = StringDiffer;
})(unfunk || (unfunk = {}));
var object;
(function (object) {
    var isDate = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    };

    var padZero = function (str, len) {
        str = '' + str;
        while (str.length < len) {
            str = '0' + str;
        }
        return str;
    };
    var padZero2 = function (str) {
        str = '' + str;
        if (str.length === 1) {
            return '0' + str;
        }
        return str;
    };
    var getDateObj = function (date) {
        return {
            __date: padZero(date.getFullYear(), 4) + '/' + padZero2(date.getMonth()) + '/' + padZero2(date.getDate()),
            __time: padZero2(date.getHours()) + ':' + padZero2(date.getMinutes()) + ' ' + padZero2(date.getSeconds()) + ':' + padZero(date.getMilliseconds(), 3)
        };
    };

    function diff(a, b) {
        if (a === b) {
            return {
                changed: 'equal',
                value: a
            };
        }
        if (!a) {
            return {
                changed: 'removed',
                value: b
            };
        }
        if (!b) {
            return {
                changed: 'added',
                value: a
            };
        }

        var value = {};
        var equal = true;
        for (var key in a) {
            var valueA = a[key];
            var typeA = typeof valueA;
            if (typeA === 'object' && isDate(valueA)) {
                valueA = getDateObj(valueA);
            }

            if (key in b) {
                var valueB = b[key];
                var typeB = typeof valueB;
                if (typeB === 'object' && isDate(valueB)) {
                    valueB = getDateObj(valueB);
                }

                if (valueA === valueB) {
                    value[key] = {
                        changed: 'equal',
                        value: valueA
                    };
                } else {
                    if (valueA && valueB && (typeA === 'object' || typeA === 'function') && (typeB === 'object' || typeB === 'function')) {
                        var valueDiff = diff(valueA, valueB);
                        if (valueDiff.changed === 'equal') {
                            value[key] = {
                                changed: 'equal',
                                value: valueA
                            };
                        } else {
                            equal = false;
                            value[key] = valueDiff;
                        }
                    } else {
                        equal = false;
                        value[key] = {
                            changed: 'primitive change',
                            removed: valueA,
                            added: valueB
                        };
                    }
                }
            } else {
                equal = false;
                value[key] = {
                    changed: 'added',
                    value: valueA
                };
            }
        }

        for (key in b) {
            if (!(key in a)) {
                equal = false;
                value[key] = {
                    changed: 'removed',
                    value: b[key]
                };
            }
        }

        if (equal) {
            return {
                changed: 'equal',
                value: a
            };
        } else {
            return {
                changed: 'object change',
                value: value
            };
        }
    }
    object.diff = diff;
    ;
})(object || (object = {}));
var unfunk;
(function (unfunk) {
    function repeatStr(str, amount) {
        var ret = '';
        for (var i = 0; i < amount; i++) {
            ret += str;
        }
        return ret;
    }

    var ObjectDiffer = (function () {
        function ObjectDiffer(diff) {
            this.diff = diff;
            this.prefix = '';
            this.indents = 0;
        }
        ObjectDiffer.prototype.addIndent = function (amount) {
            this.indents += amount;
            return '';
        };

        ObjectDiffer.prototype.getWrapping = function (actual, expected, prefix) {
            if (typeof prefix === "undefined") { prefix = ''; }
            this.indents = 0;
            this.prefix = prefix;
            var changes = object.diff(actual, expected);
            return this.getWrappingDiff(changes);
        };

        ObjectDiffer.prototype.getWrappingDiff = function (changes) {
            var properties = [];

            var diff = changes.value;
            var res;

            var indent = this.getIndent();
            var prop;
            if (changes.changed === 'equal') {
                for (prop in diff) {
                    res = diff[prop];
                    properties.push(indent + this.getNameEqual(prop) + this.inspect('', res, 'equal'));
                }
            } else {
                for (prop in diff) {
                    res = diff[prop];
                    var changed = res.changed;
                    switch (changed) {
                        case 'object change':
                            properties.push(indent + this.getNameChanged(prop) + '\n' + this.addIndent(1) + this.getWrappingDiff(res));
                            break;
                        case 'primitive change':
                            if (typeof res.added === 'string' && typeof res.removed === 'string') {
                                if (this.diff.inDiffLengthLimit(res.removed) && this.diff.inDiffLengthLimit(res.added)) {
                                    var plain = this.getNameEmpty(prop);
                                    var preLen = plain.length;
                                    var prepend = [
                                        indent + this.getNameRemoved(prop),
                                        indent + plain,
                                        indent + this.getNameAdded(prop)
                                    ];
                                    properties.push(this.diff.getStringDiff(res.removed, res.added, indent.length + preLen, prepend));
                                } else {
                                    properties.push(this.diff.printDiffLengthLimit(res.removed, res.added, indent));
                                }
                            } else {
                                properties.push(indent + this.getNameRemoved(prop) + this.inspect('', res.added, 'removed') + '\n' + indent + this.getNameAdded(prop) + this.inspect('', res.removed, 'added') + '');
                            }
                            break;
                        case 'removed':
                            properties.push(indent + this.getNameRemoved(prop) + this.inspect('', res.value, 'removed'));
                            break;
                        case 'added':
                            properties.push(indent + this.getNameAdded(prop) + this.inspect('', res.value, 'added'));
                            break;
                        case 'equal':
                        default:
                            properties.push(indent + this.getNameEqual(prop) + this.inspect('', res.value, 'equal'));
                            break;
                    }
                }
            }
            return properties.join('\n') + this.addIndent(-1) + this.getIndent() + this.diff.markSpace;
        };

        ObjectDiffer.prototype.getIndent = function (id) {
            if (typeof id === "undefined") { id = ''; }
            var ret = [];
            for (var i = 0; i < this.indents; i++) {
                ret.push(this.diff.indentert);
            }
            return id + this.prefix + ret.join('');
        };

        ObjectDiffer.prototype.encodeName = function (prop) {
            if (!unfunk.identAnyExp.test(prop)) {
                return '"' + unfunk.escape(prop) + '"';
            }
            return prop;
        };

        ObjectDiffer.prototype.encodeString = function (prop) {
            return '"' + unfunk.escape(prop) + '"';
        };

        ObjectDiffer.prototype.getNameAdded = function (prop) {
            return this.diff.style.success(this.diff.markAdded + this.encodeName(prop)) + ': ';
        };

        ObjectDiffer.prototype.getNameRemoved = function (prop) {
            return this.diff.style.error(this.diff.markRemov + this.encodeName(prop)) + ': ';
        };

        ObjectDiffer.prototype.getNameChanged = function (prop) {
            return this.diff.style.warning(this.diff.markChang + this.encodeName(prop)) + ': ';
        };

        ObjectDiffer.prototype.getNameEmpty = function (prop) {
            return this.diff.markColum + repeatStr(' ', this.encodeName(prop).length) + ': ';
        };

        ObjectDiffer.prototype.getNameEqual = function (prop) {
            return this.diff.markEqual + this.encodeName(prop) + ': ';
        };

        ObjectDiffer.prototype.getName = function (prop, change) {
            switch (change) {
                case 'added':
                    return this.getNameAdded(prop);
                case 'removed':
                    return this.getNameRemoved(prop);
                case 'object change':
                    return this.getNameChanged(prop);
                case 'empty':
                    return this.getNameEmpty(prop);
                case 'plain':
                default:
                    return this.diff.markEqual + this.encodeName(prop) + ': ';
            }
        };

        ObjectDiffer.prototype.inspect = function (accumulator, obj, change) {
            var i;

            switch (typeof obj) {
                case 'object':
                    if (!obj) {
                        accumulator += 'null';
                        break;
                    }
                    var length;
                    if (Array.isArray(obj)) {
                        length = obj.length;
                        if (length === 0) {
                            accumulator += '[]';
                        } else {
                            accumulator += '\n';
                            for (i = 0; i < length; i++) {
                                this.addIndent(1);
                                accumulator = this.inspect(accumulator + this.getIndent() + this.getName(String(i), change), obj[i], change);
                                if (i < length - 1) {
                                    accumulator += '\n';
                                }
                                this.addIndent(-1);
                            }
                        }
                    } else {
                        var props = Object.keys(obj).sort();
                        length = props.length;
                        if (length === 0) {
                            accumulator += '{}';
                        } else {
                            accumulator += '\n';
                            for (i = 0; i < length; i++) {
                                var prop = props[i];
                                this.addIndent(1);
                                accumulator = this.inspect(accumulator + this.getIndent() + this.getName(prop, change), obj[prop], change);
                                if (i < length - 1) {
                                    accumulator += '\n';
                                }
                                this.addIndent(-1);
                            }
                        }
                    }
                    break;
                case 'function':
                    accumulator += 'function()';
                    break;
                case 'undefined':
                    accumulator += 'undefined';
                    break;
                case 'string':
                    accumulator += this.encodeName(obj);
                    break;
                case 'number':
                    accumulator += String(obj);
                    break;
                default:
                    accumulator += this.encodeString(String(obj));
                    break;
            }
            return accumulator;
        };
        return ObjectDiffer;
    })();
    unfunk.ObjectDiffer = ObjectDiffer;
})(unfunk || (unfunk = {}));
var unfunk;
(function (unfunk) {
    unfunk.objectNameExp = /(^\[object )|(\]$)/gi;
    unfunk.identExp = /^[a-z](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
    unfunk.identAnyExp = /^[a-z0-9](?:[a-z0-9_\-]*?[a-z0-9])?$/i;

    var DiffFormatter = (function () {
        function DiffFormatter(style, maxWidth) {
            if (typeof maxWidth === "undefined") { maxWidth = 80; }
            this.style = style;
            this.maxWidth = maxWidth;
            this.indentert = '  ';
            this.markAdded = '+ ';
            this.markRemov = '- ';
            this.markChang = '? ';
            this.markEqual = '. ';
            this.markEmpty = '  ';
            this.markColum = '| ';
            this.markSpace = '';
            this.stringMaxLength = 2000;
            this.bufferMaxLength = 100;
            this.arrayMaxLength = 100;
            if (maxWidth === 0) {
                this.maxWidth = 100;
            }
        }
        DiffFormatter.prototype.forcedDiff = function (actual, expected) {
            if (typeof actual === 'string' && typeof expected === 'string') {
                return true;
            } else if (typeof actual === 'object' && typeof expected === 'object') {
                return true;
            }
            return false;
        };

        DiffFormatter.prototype.inDiffLengthLimit = function (obj, limit) {
            if (typeof limit === "undefined") { limit = 0; }
            switch (typeof obj) {
                case 'string':
                    return (obj.length < (limit ? limit : this.stringMaxLength));
                case 'object':
                    switch (this.getObjectType(obj)) {
                        case 'array':
                        case 'arguments':
                            return (obj.length < (limit ? limit : this.arrayMaxLength));
                        case 'buffer':
                            return (obj.length < (limit ? limit : this.bufferMaxLength));
                        case 'object':
                            return (obj && (Object.keys(obj).length < (limit ? limit : this.arrayMaxLength)));
                    }
                default:
                    return false;
            }
        };

        DiffFormatter.prototype.printDiffLengthLimit = function (actual, expected, prepend, limit) {
            if (typeof prepend === "undefined") { prepend = ''; }
            if (typeof limit === "undefined") { limit = 0; }
            var len = [];
            if (actual && !this.inDiffLengthLimit(actual, limit)) {
                len.push(prepend + this.style.warning('<actual too lengthy for diff: ' + actual.length + '>'));
            }
            if (expected && !this.inDiffLengthLimit(expected, limit)) {
                len.push(prepend + this.style.warning('<expected too lengthy for diff: ' + expected.length + '>'));
            }
            if (len.length > 0) {
                return len.join('\n');
            }
            return '';
        };

        DiffFormatter.prototype.getObjectType = function (obj) {
            return Object.prototype.toString.call(obj).replace(unfunk.objectNameExp, '').toLowerCase();
        };

        DiffFormatter.prototype.validType = function (value) {
            var type = typeof value;
            if (type === 'string') {
                return true;
            }
            if (type === 'object') {
                return !!value;
            }
            return false;
        };

        DiffFormatter.prototype.getStyledDiff = function (actual, expected, prepend) {
            if (typeof prepend === "undefined") { prepend = ''; }
            if ((this.getObjectType(actual) !== this.getObjectType(expected) || !this.validType(actual) || !this.validType(expected))) {
                return '';
            }
            if (!this.inDiffLengthLimit(actual) || !this.inDiffLengthLimit(expected)) {
                return this.printDiffLengthLimit(actual, expected, prepend);
            }

            if (typeof actual === 'object' && typeof expected === 'object') {
                return this.getObjectDiff(actual, expected, prepend);
            } else if (typeof actual === 'string' && typeof expected === 'string') {
                return this.getStringDiff(actual, expected, prepend.length, [prepend, prepend, prepend], true);
            }
            return '';
        };

        DiffFormatter.prototype.getObjectDiff = function (actual, expected, prepend, diffLimit) {
            if (typeof diffLimit === "undefined") { diffLimit = 0; }
            return new unfunk.ObjectDiffer(this).getWrapping(actual, expected, prepend);
        };

        DiffFormatter.prototype.getStringDiff = function (actual, expected, padLength, padFirst, leadSymbols) {
            if (typeof leadSymbols === "undefined") { leadSymbols = false; }
            return new unfunk.StringDiffer(this).getWrappingLines(actual, expected, this.maxWidth, padLength, padFirst, leadSymbols);
        };
        return DiffFormatter;
    })();
    unfunk.DiffFormatter = DiffFormatter;
})(unfunk || (unfunk = {}));
var unfunk;
(function (unfunk) {
    var ministyle = require('ministyle');

    function ansi(valueA, valueB, maxWidth) {
        if (typeof maxWidth === "undefined") { maxWidth = 80; }
        var formatter = new unfunk.DiffFormatter(ministyle.ansi(), maxWidth);
        return formatter.getStyledDiff(valueA, valueB);
    }
    unfunk.ansi = ansi;

    function plain(valueA, valueB, maxWidth) {
        if (typeof maxWidth === "undefined") { maxWidth = 80; }
        var formatter = new unfunk.DiffFormatter(ministyle.plain(), maxWidth);
        return formatter.getStyledDiff(valueA, valueB);
    }
    unfunk.plain = plain;
})(unfunk || (unfunk = {}));

(module).exports = unfunk;
//# sourceMappingURL=index.js.map
