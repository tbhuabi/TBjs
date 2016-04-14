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
		var toolkit=require('./src/toolkit');
		var XMLEngine=require('./src/xmlEngine');
		var Query=require('./src/query');
		var TB=function(){
		};
		toolkit.extend(TB.prototype,{
			VERSION:'1.0.0',
			XMLEngine: XMLEngine,
			$: Query
		})
    })
})
