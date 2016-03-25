(function(factory) {
    if (typeof exports === 'undefined') {
        factory(define)
    } else {
        factory(function(self) {
            self(require, exports, module);
        });
    }
})(function(define) {
    define(function(require, exprots, module) {
        var xmlEngine = require('./src/xmlEngine');
		var document=xmlEngine('vfda <div id="box"><img src="#" id="img" alt=""></div>');
		//console.log(document);
        module.exports = xmlEngine;
    })
})
