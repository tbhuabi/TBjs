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

        var OPERATORS = {};
        '+ - * / % === !== == != < > <= >= && || ! = |'.split(' ').forEach(function(operator) {
            OPERATORS[operator] = true;
        });

        function Lexer(text) {
            this.text = text;
            this.index = 0;
            this.tokens = [];
        }

        toolkit.extend(Lexer.prototype, {
            lex: function() {
                while (this.index < this.text.length) {
					var currentText=this.text.charAt(this.index);
					if(currentText==='"'||currentText==="'"){
						this.readString(currentText);
					}
                }
            }
        });

    })
})
