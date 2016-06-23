function $ParseProvider() {
    var parseMinErr = minErr('$parse');
    this.$get = ['$ast', '$filter',
        function($ast, $filter) {
            return function parser(experssion) {
                var programs = $ast(experssion);

                function astInterpreter(program, model) {
                    switch (program.type) {
                        case AST.Program:
                            var value;
                            program.body.forEach(function(item) {
                                value = astInterpreter(item, model);
                            })
                            return value;

                        case AST.ExpressionStatement:
                            return astInterpreter(program.expression, model);

                        case AST.AssignmentExpression:
                            var key = program.left.type === AST.Identifier ? program.left.value : astInterpreter(program.left, model);
                            if (!isString(key)) {
                                throw parseMinErr('assignment', '表达式{0}有误，不能给{1}赋值！', experssion, {}.toString.call(key));
                            }
                            return model[key] = astInterpreter(program.right, model);

                        case AST.ConditionalExpression:
                            return astInterpreter(program.test, model) ? astInterpreter(program.alternate, model) : astInterpreter(program.consequent, model);

                        case AST.LogicalExpression:
                            switch (program.operator) {
                                case '||':
                                    return astInterpreter(program.left, model) || astInterpreter(program.right, model);
                                case '&&':
                                    return astInterpreter(program.left, model) && astInterpreter(program.right, model);
                            }

                        case AST.BinaryExpression:
                            var leftValue = astInterpreter(program.left, model);
                            var rightValue = astInterpreter(program.right, model);
                            switch (program.operator) {
                                case '+':
                                    return leftValue + rightValue;
                                case '-':
                                    return leftValue - rightValue;
                                case '*':
                                    return leftValue * rightValue;
                                case '/':
                                    return leftValue / rightValue;
                                case '%':
                                    return leftValue % rightValue;
                                case '>':
                                    return leftValue > rightValue;
                                case '>=':
                                    return leftValue >= rightValue;
                                case '<':
                                    return leftValue < rightValue;
                                case '<=':
                                    return leftValue <= rightValue;
                                case '==':
                                    return leftValue == rightValue;
                                case '!=':
                                    return leftValue != rightValue;
                                case '===':
                                    return leftValue === rightValue;
                                case '!==':
                                    return leftValue !== rightValue;
                            }

                        case AST.UnaryExpression:
                            switch (program.operator) {
                                case '+':
                                    return +astInterpreter(program.argument, model);
                                case '-':
                                    return -astInterpreter(program.argument, model);
                                case '!':
                                    return !astInterpreter(program.argument, model);
                            }

                        case AST.CallExpression:
                            var args = [];
                            var fn;
                            program.arguments.forEach(function(item) {
                                args.push(astInterpreter(item, model));
                            })
                            if (program.filter) {
                                var key = program.callee.type === AST.Identifier ? program.callee.value : astInterpreter(program.callee, model);
                                if (!isString(key)) {
                                    throw parseMinErr('filter', '表达式{0}有误，{1}不能做为一个过滤器的名字！', experssion, {}.toString.call(key));
                                }
                                if (!$filter.has(key)) {
                                    throw parseMinErr('injector', '过滤器{0}未注册！', key);
                                }
                                fn = $filter.get(key);
                                if (!isFunction(fn)) {
                                    throw parseMinErr('invoke', '过滤器{0}不是一个函数！', key);
                                }
                                return fn.apply(undefined, args);
                            }
                            fn = model[astInterpreter(program.callee, model)];
                            return isFunction(fn) ? fn.apply(model, args) : undefined;

                        case AST.MemberExpression:
                            return astInterpreter(program.property, astInterpreter(program.primary, model));

                        case AST.Identifier:
                            return model[program.value];

                        case AST.Literal:
                            return program.value;

                        case AST.ArrayExpression:
                            var arr = [];
                            program.elements.forEach(function(item) {
                                arr.push(astInterpreter(item, model));
                            })
                            return arr;

                        case AST.Property:
                            return astInterpreter(program.value, model);

                        case AST.ObjectExpression:
                            var obj = {};
                            program.properties.forEach(function(item) {
                                obj[item.key.value] = astInterpreter(item, model)
                            })
                            return obj;

                        case AST.ThisExpression:
                            return model;
                    }
                }
                return function value(model) {
                    return astInterpreter(programs, model);
                }
            }
        }
    ];
}
