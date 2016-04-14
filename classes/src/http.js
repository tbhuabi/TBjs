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
		//interceptors
		Http.prototype.init=function(data,options){
			this.options={

			};
		};
		Http.prototype.init.prototype=Http.prototype;
		toolkit.extend(Http.prototype,{
			options:{
				common:"application/json, text/plain, */*",
				get:{
					method:'get',
					requestHeaders:{
						'Content-Type': 'application/json;charset=utf-8'
					},
					params:null,
					data:null,
					transformRequest:[]
				},
				post:{
					method:'post',
					requestHeaders:{
						'Content-Type': 'application/json;charset=utf-8'
					}
				}
			},
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
