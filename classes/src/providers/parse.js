function $ParseProvider() {
    this.$get = ['$ast', function($ast) {
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

                    case AST.BinaryExpression:
                        switch (program.operator) {
                            case '+':
                                return model[astInterpreter(program.left, model)] + model[astInterpreter(program.right, model)];
                            case '-':
                                return model[astInterpreter(program.left, model)] - model[astInterpreter(program.right, model)];
                            case '*':
                                return model[astInterpreter(program.left, model)] * model[astInterpreter(program.right, model)];
                            case '/':
                                return model[astInterpreter(program.left, model)] / model[astInterpreter(program.right, model)];
                            case '%':
                                return model[astInterpreter(program.left, model)] % model[astInterpreter(program.right, model)];
                            case '>':
                                return model[astInterpreter(program.left, model)] > model[astInterpreter(program.right, model)];
                            case '>=':
                                return model[astInterpreter(program.left, model)] >= model[astInterpreter(program.right, model)];
                            case '<':
                                return model[astInterpreter(program.left, model)] < model[astInterpreter(program.right, model)];
                            case '<=':
                                return model[astInterpreter(program.left, model)] <= model[astInterpreter(program.right, model)];
                            case '==':
                                return model[astInterpreter(program.left, model)] == model[astInterpreter(program.right, model)];
                            case '!=':
                                return model[astInterpreter(program.left, model)] != model[astInterpreter(program.right, model)];
                            case '===':
                                return model[astInterpreter(program.left, model)] === model[astInterpreter(program.right, model)];
                            case '!==':
                                return model[astInterpreter(program.left, model)] !== model[astInterpreter(program.right, model)];
                        }

                    case AST.Identifier:
                        return program.value;

                    case AST.AssignmentExpression:
                        return model[astInterpreter(program.left, model)] = astInterpreter(program.right, model);

                    case AST.Literal:
                        return program.value;

					case AST.MemberExpression:
						return

                }
            }
            return function value(model) {
                return parser(model);
            }
        }
    }];
}
