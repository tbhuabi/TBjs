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
			function TB(){
				var VERSOIN=1;

			}
			toolkit.extend(TB.prototype,{
				module: function(moduleName){

				}
			})
		};
		toolkit.extend(TB.prototype,{
			VERSION:'1.0.0',
			XMLEngine: function(htmlText){
				if(toolkit.isString(htmlText)){
					return this.$(new XMLEngine(htmlText));
				}
				if(toolkit.isObject(htmlText)&& typeof htmlText.nodeType==='number'){
					return this.$(htmlText);
				}
			},
			$: function(selector, context){
				return new Query(selector, context);
			}
		})
    })
})
