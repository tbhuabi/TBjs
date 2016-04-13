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
		var Promise=require('./promise');

		function Http(data,options){
			return new Http.prototype.init(data,options);
		}
		Http.prototype.init=function(data,options){
			this.options={

			};
		};
		Http.prototype.init.prototype=Http.prototype;
		toolkit.extend(Http.prototype,{
			config: function(options){

			},
			success: function(data){

			},
			error: function(){

			}
		})

        module.exports = Http;
    })
})
