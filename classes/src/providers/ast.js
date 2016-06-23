function AST(lexer) {
    this.lexer = lexer;
}

AST.Program = 'Program';
AST.ExpressionStatement = 'ExpressionStatement'; //表达式语句
AST.AssignmentExpression = 'AssignmentExpression'; //赋值表达式
AST.ConditionalExpression = 'ConditionalExpression'; //条件表达式
AST.LogicalExpression = 'LogicalExpression'; //逻辑表达式
AST.BinaryExpression = 'BinaryExpression'; //二元运算表达式
AST.UnaryExpression = 'UnaryExpression'; //一元运算表达式
AST.CallExpression = 'CallExpression'; //函数调用表达式
AST.MemberExpression = 'MemberExpression'; //成员表达式
AST.Identifier = 'Identifier'; //标识符
AST.Literal = 'Literal'; //文本常量
AST.ArrayExpression = 'ArrayExpression'; //数组表达式
AST.Property = 'Property'; //属性表达式
AST.ObjectExpression = 'ObjectExpression'; //对象表达式
AST.ThisExpression = 'ThisExpression'; //this表达式

function $AstProvider() {
    this.$get = ['$lexer',
        function($lexer) {
            return function ast(expression) {
                return (new AST($lexer)).ast(expression);
            }
        }
    ];


    var astMinErr = minErr('AST');

    extend(AST.prototype, {
        ast: function(text) {
            this.text = text;

            //分析词法
            this.tokens = this.lexer.lex(text);
            //构建一个项目
            var value = this.program();

            if (this.tokens.length !== 0) {
                //如果项目构建完，但当前的词法单元并未用完，则判定当前表达式不正确
                throw astMinErr('ast', '表达式：{0}中，{1}没用使用', text, this.tokens[0]);
            }
            return value;
        },
        program: function() {
            var body = [];
            while (true) {
                //循环this.tokens中的每一项
                if (this.tokens.length > 0 && !this.peek('}', ')', ';', ']')) {
                    //如果tokens中还有元素，则创建抽象语法树
                    body.push(this.expressionStatement());
                }
                if (!this.expect(';')) {
                    return {
                        type: AST.Program,
                        body: body
                    };
                }
            }
        },
        expressionStatement: function() {
            //返回一个表达式单元
            return {
                type: AST.ExpressionStatement,
                //每一项元素都有可能的过滤器来格式化当前计算后的结果，所以先从过滤器分析
                expression: this.filterChain()
            }
        },
        filterChain: function() {
            //过滤器规则 value | filter，但value的值没有，所以先计算value的表达式
            var left = this.expression();
            var token;
            while (token = this.expect('|')) {
                left = this.filter(left);
            }
            return left;
        },
        expression: function() {
            return this.assignment();
        },
        assignment: function() {
            //先求构建左边的表达式
            var result = this.ternary();
            //如果下一项为 = 号，则当前表达式为赋值运算，否则直接返回左边的值
            if (this.expect('=')) {
                result = {
                    type: AST.AssignmentExpression,
                    left: result,
                    operator: '=',
                    right: this.assignment()
                }
            }
            return result;
        },
        ternary: function() {
            //三元运算 boolean ? trueExpression : falseExpression

            var test = this.logicalOR(); // a || b ? true : false
            var alternate;
            var consequent;
            if (this.expect('?')) {
                alternate = this.expression();
                if (this.expect(':')) {
                    consequent = this.expression();
                    return {
                        type: AST.ConditionalExpression,
                        test: test,
                        alternate: alternate,
                        consequent: consequent
                    }
                }
            }
            return test;
        },
        logicalOR: function() {
            //或者 a || b
            var left = this.logicalAND(); //a && b || c;
            while (this.expect('||')) {
                //a || b || c
                left = {
                    type: AST.LogicalExpression,
                    left: left,
                    operator: '||',
                    right: this.logicalAND() //运算优先级，后面一定不是三目（?:）运算表达式
                };
            }
            return left;
        },
        logicalAND: function() {
            //并且 a && b
            var left = this.equality(); // a == b && c

            while (this.expect('&&')) {
                // a && b && c
                left = {
                    type: AST.LogicalExpression,
                    left: left,
                    operator: '&&',
                    right: this.equality() //运算优先级，后面一定不是三目（?:），或者（||）运算表达式
                }
            }
            return left;
        },
        equality: function() {
            //相等 a == b
            var left = this.relational(); // a <= b == c
            var token;
            while (token = this.expect('==', '!=', '!==', '===')) {
                // a == b == c
                left = {
                    type: AST.BinaryExpression,
                    left: left,
                    operator: token.text,
                    right: this.relational()
                }
            }
            return left;
        },
        relational: function() {
            //关系运算 a <= b
            var left = this.additive(); // a + b <= c
            var token;
            while (token = this.expect('<', '>', '<=', '>=')) {
                // a < b < c
                left = {
                    type: AST.BinaryExpression,
                    left: left,
                    operator: token.text,
                    right: this.additive()
                }
            }
            return left;
        },
        additive: function() {
            //加减法运算 a + b
            var left = this.multiplicative(); // a * b + c
            var token;
            while (token = this.expect('+', '-')) {
                // a + b + c
                left = {
                    type: AST.BinaryExpression,
                    left: left,
                    operator: token.text,
                    right: this.multiplicative()
                }
            }
            return left;
        },
        multiplicative: function() {
            //乘除模运算 a * b
            var left = this.unary(); // -a * b
            var token;
            while (token = this.expect('*', '/', '%')) {
                left = {
                    type: AST.BinaryExpression,
                    left: left,
                    operator: token.text,
                    right: this.unary()
                }
            }
            return left;
        },
        unary: function() {
            var token = this.expect('+', '-', '!');
            if (token) {
                return {
                    type: AST.UnaryExpression,
                    operator: token.text,
                    argument: this.unary()
                }
            } else {
                //如果不是以上所有情况，则判定当前表达式的构建逻辑为()优先运算符，或者是[]数组、{}json
                return this.primary();
            }
        },
        primary: function() {
            var primary;
            if (this.expect('(')) {
                primary = this.filterChain(); //括号内可能包含任意元素
                this.consume(')');
            } else if (this.expect('[')) {
                primary = this.arrayDeclaration();
            } else if (this.expect('{')) {
                primary = this.object();
            } else if (this.constants.hasOwnProperty(this.peek().text)) {
                primary = this.constants[this.consume().text];
            } else if (this.peek().identifier) {
                primary = this.identifier();
            } else if (this.peek().constant) {
                primary = this.constant();
            } else {
                //如果以上所有情况都不匹配，则判定表达式不正确
                throw astMinErr('primary', '{0}不是一个正确的表达式', this.peek().text);
            }
            var next;
            //有可能出现取属性：[1,2][0]，{key:value}[key]，a.b.c
            //也有可能是函数调用：fn(a,b)
            while (next = this.expect('[', '(', '.')) {
                if (next.text === '[') {
                    //取一个对象的属性
                    primary = {
                        type: AST.MemberExpression,
                        primary: primary,
                        property: this.expression()
                    }
                    this.consume(']');
                } else if (next.text === '(') {
                    primary = {
                        type: AST.CallExpression,
                        callee: primary,
                        arguments: this.parseArguments()
                    }
                    this.consume(')');
                } else if (next.text === '.') {
                    primary = {
                        type: AST.MemberExpression,
                        primary: primary,
                        property: this.expression()
                    }
                } else {
                    //如果以上所有情况都不符合，则判定当前表达式不正确
                    throw astMinErr('primary', '{0}不是一个正确的表达式', next.text);
                }
            }
            return primary;
        },
        parseArguments: function() {
            var args = [];
            if (this.peek().text !== ')') {
                do {
                    args.push(this.expression());
                } while (this.expect(','));
            }
            return args;
        },
        filter: function(baseExpression) {
            var args = [baseExpression];
            var result = {
                type: AST.CallExpression,
                callee: this.identifier(),
                arguments: args
            };
            while (this.expect(':')) {
                args.push(this.expression());
            }
            return result;
        },
        object: function() {
            var properties = [];
            var property;
            if (!this.peek('}')) {
                do {
                    if (this.peek('}')) {
                        //ECMA5 支持 {key:value,key:value,} 最后一个元素后面可以有逗号
                        break;
                    }
                    property = {
                        type: AST.Property
                    };
                    if (this.peek().constant) {
                        //属性名为true,false,null,undefined
                        property.key = this.constant();
                    } else if (this.peek().identifier) {
                        property.key = this.identifier();
                    } else {
                        throw astMinErr('object', '{0}不能作为一个标识符或属性名！', this.peek().text);
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
            }
        },
        identifier: function() {
            var token = this.consume();
            if (token.identifier) {
                return {
                    type: AST.Identifier,
                    value: token.text
                }
            }
            throw astMinErr('identifier', '{0}不能作为一个标识符或属性名！', token.text);
        },
        constant: function() {
            return {
                type: AST.Literal,
                value: this.consume().value
            }
        },
        arrayDeclaration: function() {
            var elements = [];
            if (!this.peek(']')) {
                do {
                    if (this.peek(']')) {
                        //ECMA5 支持 [1,3,] 最后一个元素后面可以有逗号
                        break;
                    }
                    elements.push(this.expression());
                } while (this.expect(','));
            }
            this.consume(']');
            return {
                type: AST.ArrayExpression,
                elements: elements
            }
        },
        expect: function(e1, e2, e3, e4) {
            var token = this.peek(e1, e2, e3, e4);
            if (token) {
                this.tokens.shift();
                return token;
            }
            return false;
        },
        peek: function(e1, e2, e3, e4) {
            if (this.tokens.length) {
                var token = this.tokens[0];
                var text = token.text;
                if (text === e1 || text === e2 || text === e3 || text === e4 || !e1 && !e2 && !e3 && !e4) {
                    return token
                }
            }
            return false;
        },
        consume: function(e1) {
            if (this.tokens.length) {
                var token = this.expect(e1);
                if (token) return token;
            }
            throw astMinErr('comsume', '解析表达式出错，{0}中缺少{1}！', this.text, e1);
        },
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
    });

}
