(function(factory) {
    if (typeof exports === 'undefined') {
        factory(define)
    } else {
        factory(function(self) {
            self(require, exports, module);
        });
    }
})(function(define) {
    define(function(require, exports, module) {
        var toolkit = require('./toolkit');


        var Lexer = function(options) {
            this.options = options;
        };

        Lexer.prototype = {
            constructor: Lexer,

            lex: function(text) {
                this.text = text;
                this.index = 0;
                this.tokens = [];

                while (this.index < this.text.length) {
                    var ch = this.text.charAt(this.index);
                    if (ch === '"' || ch === "'") {
                        this.readString(ch);
                    } else if (this.isNumber(ch) || ch === '.' && this.isNumber(this.peek())) {
                        this.readNumber();
                    } else if (this.isIdent(ch)) {
                        this.readIdent();
                    } else if (this.is(ch, '(){}[].,;:?')) {
                        this.tokens.push({
                            index: this.index,
                            text: ch
                        });
                        this.index++;
                    } else if (this.isWhitespace(ch)) {
                        this.index++;
                    } else {
                        var ch2 = ch + this.peek();
                        var ch3 = ch2 + this.peek(2);
                        var op1 = OPERATORS[ch];
                        var op2 = OPERATORS[ch2];
                        var op3 = OPERATORS[ch3];
                        if (op1 || op2 || op3) {
                            var token = op3 ? ch3 : (op2 ? ch2 : ch);
                            this.tokens.push({
                                index: this.index,
                                text: token,
                                operator: true
                            });
                            this.index += token.length;
                        } else {
                            this.throwError('Unexpected next character ', this.index, this.index + 1);
                        }
                    }
                }
                return this.tokens;
            },

            is: function(ch, chars) {
                return chars.indexOf(ch) !== -1;
            },

            peek: function(i) {
                var num = i || 1;
                return (this.index + num < this.text.length) ? this.text.charAt(this.index + num) : false;
            },

            isNumber: function(ch) {
                return ('0' <= ch && ch <= '9') && typeof ch === "string";
            },

            isWhitespace: function(ch) {
                // IE treats non-breaking space as \u00A0
                return (ch === ' ' || ch === '\r' || ch === '\t' ||
                    ch === '\n' || ch === '\v' || ch === '\u00A0');
            },

            isIdent: function(ch) {
                return ('a' <= ch && ch <= 'z' ||
                    'A' <= ch && ch <= 'Z' ||
                    '_' === ch || ch === '$');
            },

            isExpOperator: function(ch) {
                return (ch === '-' || ch === '+' || this.isNumber(ch));
            },

            throwError: function(error, start, end) {
                end = end || this.index;
                var colStr = (isDefined(start) ? 's ' + start + '-' + this.index + ' [' + this.text.substring(start, end) + ']' : ' ' + end);
                throw $parseMinErr('lexerr', 'Lexer Error: {0} at column{1} in expression [{2}].',
                    error, colStr, this.text);
            },

            readNumber: function() {
                var number = '';
                var start = this.index;
                while (this.index < this.text.length) {
                    var ch = this.text.charAt(this.index).toLowerCase();
                    if (ch == '.' || this.isNumber(ch)) {
                        number += ch;
                    } else {
                        var peekCh = this.peek();
                        if (ch == 'e' && this.isExpOperator(peekCh)) {
                            number += ch;
                        } else if (this.isExpOperator(ch) &&
                            peekCh && this.isNumber(peekCh) &&
                            number.charAt(number.length - 1) == 'e') {
                            number += ch;
                        } else if (this.isExpOperator(ch) &&
                            (!peekCh || !this.isNumber(peekCh)) &&
                            number.charAt(number.length - 1) == 'e') {
                            this.throwError('Invalid exponent');
                        } else {
                            break;
                        }
                    }
                    this.index++;
                }
                this.tokens.push({
                    index: start,
                    text: number,
                    constant: true,
                    value: Number(number)
                });
            },

            readIdent: function() {
                var start = this.index;
                while (this.index < this.text.length) {
                    var ch = this.text.charAt(this.index);
                    if (!(this.isIdent(ch) || this.isNumber(ch))) {
                        break;
                    }
                    this.index++;
                }
                this.tokens.push({
                    index: start,
                    text: this.text.slice(start, this.index),
                    identifier: true
                });
            },

            readString: function(quote) {
                var start = this.index;
                this.index++;
                var string = '';
                var rawString = quote;
                var escape = false;
                while (this.index < this.text.length) {
                    var ch = this.text.charAt(this.index);
                    rawString += ch;
                    if (escape) {
                        if (ch === 'u') {
                            var hex = this.text.substring(this.index + 1, this.index + 5);
                            if (!hex.match(/[\da-f]{4}/i)) {
                                this.throwError('Invalid unicode escape [\\u' + hex + ']');
                            }
                            this.index += 4;
                            string += String.fromCharCode(parseInt(hex, 16));
                        } else {
                            var rep = ESCAPE[ch];
                            string = string + (rep || ch);
                        }
                        escape = false;
                    } else if (ch === '\\') {
                        escape = true;
                    } else if (ch === quote) {
                        this.index++;
                        this.tokens.push({
                            index: start,
                            text: rawString,
                            constant: true,
                            value: string
                        });
                        return;
                    } else {
                        string += ch;
                    }
                    this.index++;
                }
                this.throwError('Unterminated quote', start);
            }
        };


        var parser = new Lexer();
        var a = parser.lex('[{3:4}]');



        var AST = function(lexer, options) {
            this.lexer = lexer;
            this.options = options;
        };

        AST.Program = 'Program';
        AST.ExpressionStatement = 'ExpressionStatement';
        AST.AssignmentExpression = 'AssignmentExpression';
        AST.ConditionalExpression = 'ConditionalExpression';
        AST.LogicalExpression = 'LogicalExpression';
        AST.BinaryExpression = 'BinaryExpression';
        AST.UnaryExpression = 'UnaryExpression';
        AST.CallExpression = 'CallExpression';
        AST.MemberExpression = 'MemberExpression';
        AST.Identifier = 'Identifier';
        AST.Literal = 'Literal';
        AST.ArrayExpression = 'ArrayExpression';
        AST.Property = 'Property';
        AST.ObjectExpression = 'ObjectExpression';
        AST.ThisExpression = 'ThisExpression';

        // Internal use only
        AST.NGValueParameter = 'NGValueParameter';

        AST.prototype = {
            ast: function(text) {
                this.text = text;
                this.tokens = this.lexer.lex(text);

                var value = this.program();

                if (this.tokens.length !== 0) {
                    this.throwError('is an unexpected token', this.tokens[0]);
                }

                return value;
            },

            program: function() {
                var body = [];
                while (true) {
                    if (this.tokens.length > 0 && !this.peek('}', ')', ';', ']'))
                        body.push(this.expressionStatement());
                    if (!this.expect(';')) {
                        return {
                            type: AST.Program,
                            body: body
                        };
                    }
                }
            },

            expressionStatement: function() {
                return {
                    type: AST.ExpressionStatement,
                    expression: this.filterChain()
                };
            },

            filterChain: function() {
                var left = this.expression();
                var token;
                while ((token = this.expect('|'))) {
                    left = this.filter(left);
                }
                return left;
            },

            expression: function() {
                return this.assignment();
            },

            assignment: function() {
                var result = this.ternary();
                if (this.expect('=')) {
                    result = {
                        type: AST.AssignmentExpression,
                        left: result,
                        right: this.assignment(),
                        operator: '='
                    };
                }
                return result;
            },

            ternary: function() {
                var test = this.logicalOR();
                var alternate;
                var consequent;
                if (this.expect('?')) {
                    alternate = this.expression();
                    if (this.consume(':')) {
                        consequent = this.expression();
                        return {
                            type: AST.ConditionalExpression,
                            test: test,
                            alternate: alternate,
                            consequent: consequent
                        };
                    }
                }
                return test;
            },

            logicalOR: function() {
                var left = this.logicalAND();
                while (this.expect('||')) {
                    left = {
                        type: AST.LogicalExpression,
                        operator: '||',
                        left: left,
                        right: this.logicalAND()
                    };
                }
                return left;
            },

            logicalAND: function() {
                var left = this.equality();
                while (this.expect('&&')) {
                    left = {
                        type: AST.LogicalExpression,
                        operator: '&&',
                        left: left,
                        right: this.equality()
                    };
                }
                return left;
            },

            equality: function() {
                var left = this.relational();
                var token;
                while ((token = this.expect('==', '!=', '===', '!=='))) {
                    left = {
                        type: AST.BinaryExpression,
                        operator: token.text,
                        left: left,
                        right: this.relational()
                    };
                }
                return left;
            },

            relational: function() {
                var left = this.additive();
                var token;
                while ((token = this.expect('<', '>', '<=', '>='))) {
                    left = {
                        type: AST.BinaryExpression,
                        operator: token.text,
                        left: left,
                        right: this.additive()
                    };
                }
                return left;
            },

            additive: function() {
                var left = this.multiplicative();
                var token;
                while ((token = this.expect('+', '-'))) {
                    left = {
                        type: AST.BinaryExpression,
                        operator: token.text,
                        left: left,
                        right: this.multiplicative()
                    };
                }
                return left;
            },

            multiplicative: function() {
                var left = this.unary();
                var token;
                while ((token = this.expect('*', '/', '%'))) {
                    left = {
                        type: AST.BinaryExpression,
                        operator: token.text,
                        left: left,
                        right: this.unary()
                    };
                }
                return left;
            },

            unary: function() {
                var token;
                if ((token = this.expect('+', '-', '!'))) {
                    return {
                        type: AST.UnaryExpression,
                        operator: token.text,
                        prefix: true,
                        argument: this.unary()
                    };
                } else {
                    return this.primary();
                }
            },

            primary: function() {
                var primary;
                if (this.expect('(')) {
                    primary = this.filterChain();
                    this.consume(')');
                } else if (this.expect('[')) {
                    primary = this.arrayDeclaration();
                } else if (this.expect('{')) {
                    primary = this.object();
                } else if (this.constants.hasOwnProperty(this.peek().text)) {
                    primary = copy(this.constants[this.consume().text]);
                } else if (this.peek().identifier) {
                    primary = this.identifier();
                } else if (this.peek().constant) {
                    primary = this.constant();
                } else {
                    this.throwError('not a primary expression', this.peek());
                }

                var next;
                while ((next = this.expect('(', '[', '.'))) {
                    if (next.text === '(') {
                        primary = {
                            type: AST.CallExpression,
                            callee: primary,
                            arguments: this.parseArguments()
                        };
                        this.consume(')');
                    } else if (next.text === '[') {
                        primary = {
                            type: AST.MemberExpression,
                            object: primary,
                            property: this.expression(),
                            computed: true
                        };
                        this.consume(']');
                    } else if (next.text === '.') {
                        primary = {
                            type: AST.MemberExpression,
                            object: primary,
                            property: this.identifier(),
                            computed: false
                        };
                    } else {
                        this.throwError('IMPOSSIBLE');
                    }
                }
                return primary;
            },

            filter: function(baseExpression) {
                var args = [baseExpression];
                var result = {
                    type: AST.CallExpression,
                    callee: this.identifier(),
                    arguments: args,
                    filter: true
                };

                while (this.expect(':')) {
                    args.push(this.expression());
                }

                return result;
            },

            parseArguments: function() {
                var args = [];
                if (this.peekToken().text !== ')') {
                    do {
                        args.push(this.expression());
                    } while (this.expect(','));
                }
                return args;
            },

            identifier: function() {
                var token = this.consume();
                if (!token.identifier) {
                    this.throwError('is not a valid identifier', token);
                }
                return {
                    type: AST.Identifier,
                    name: token.text
                };
            },

            constant: function() {
                // TODO check that it is a constant
                return {
                    type: AST.Literal,
                    value: this.consume().value
                };
            },

            arrayDeclaration: function() {
                var elements = [];
                if (this.peekToken().text !== ']') {
                    do {
                        if (this.peek(']')) {
                            // Support trailing commas per ES5.1.
                            break;
                        }
                        elements.push(this.expression());
                    } while (this.expect(','));
                }
                this.consume(']');

                return {
                    type: AST.ArrayExpression,
                    elements: elements
                };
            },

            object: function() {
                var properties = [],
                    property;
                if (this.peekToken().text !== '}') {
                    do {
                        if (this.peek('}')) {
                            // Support trailing commas per ES5.1.
                            break;
                        }
                        property = {
                            type: AST.Property,
                            kind: 'init'
                        };
                        if (this.peek().constant) {
                            property.key = this.constant();
                        } else if (this.peek().identifier) {
                            property.key = this.identifier();
                        } else {
                            this.throwError("invalid key", this.peek());
                        }
                        this.consume(':');
                        property.value = this.expression();
                        properties.push(property);
                    } while (this.expect(','));
                }
                this.consume('}');

                return {
                    type: AST.ObjectExpression,
                    properties: properties
                };
            },

            throwError: function(msg, token) {
                throw $parseMinErr('syntax',
                    'Syntax Error: Token \'{0}\' {1} at column {2} of the expression [{3}] starting at [{4}].',
                    token.text, msg, (token.index + 1), this.text, this.text.substring(token.index));
            },

            consume: function(e1) {
                if (this.tokens.length === 0) {
                    throw $parseMinErr('ueoe', 'Unexpected end of expression: {0}', this.text);
                }

                var token = this.expect(e1);
                if (!token) {
                    this.throwError('is unexpected, expecting [' + e1 + ']', this.peek());
                }
                return token;
            },

            peekToken: function() {
                if (this.tokens.length === 0) {
                    throw $parseMinErr('ueoe', 'Unexpected end of expression: {0}', this.text);
                }
                return this.tokens[0];
            },

            peek: function(e1, e2, e3, e4) {
                return this.peekAhead(0, e1, e2, e3, e4);
            },

            peekAhead: function(i, e1, e2, e3, e4) {
                if (this.tokens.length > i) {
                    var token = this.tokens[i];
                    var t = token.text;
                    if (t === e1 || t === e2 || t === e3 || t === e4 ||
                        (!e1 && !e2 && !e3 && !e4)) {
                        return token;
                    }
                }
                return false;
            },

            expect: function(e1, e2, e3, e4) {
                var token = this.peek(e1, e2, e3, e4);
                if (token) {
                    this.tokens.shift();
                    return token;
                }
                return false;
            },


            /* `undefined` is not a constant, it is an identifier,
             * but using it as an identifier is not supported
             */
            constants: {
                'true': {
                    type: AST.Literal,
                    value: true
                },
                'false': {
                    type: AST.Literal,
                    value: false
                },
                'null': {
                    type: AST.Literal,
                    value: null
                },
                'undefined': {
                    type: AST.Literal,
                    value: undefined
                },
                'this': {
                    type: AST.ThisExpression
                }
            }
        };
		var ast=new AST(a);
        console.log(ast.ast('[{3:4}]'))

        module.exports = Parser;
    })
})
