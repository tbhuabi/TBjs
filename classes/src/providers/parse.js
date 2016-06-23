function $ParseProvider() {
    this.$get = ['$ast',
        function($ast) {
            return function expressionParser(experssion) {
                var programs = $ast(experssion);

                function parser(model) {
                    var value;
                    programs.body.forEach(function(program) {
                        value = astInterpreter(program, model);
                    })
                    return value;
                }

                function astInterpreter(program, model) {
                    switch (program.type) {
                        case AST.ExpressionStatement:
                            return astInterpreter(program.expression, model);

                        case AST.AssignmentExpression:
                            return model[program.left.type === AST.Identifier ? program.left.value : astInterpreter(program.left, model)] = astInterpreter(program.right, model);

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
                            program.arguments.forEach(function(item) {
                                args.push(astInterpreter(item), model);
                            })
                            return model[astInterpreter(program.callee, model)].apply(model, args);

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
                    return parser(model);
                }
            }
        }
    ];
}
