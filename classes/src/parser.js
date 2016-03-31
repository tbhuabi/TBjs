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
		//var expression='a+b.ccc*c+(5-3)/4 + 4 %2';
		var expression='5*3 +(4-6)*3 %2+"test"';
		function Parser(expression){
			expression=toolkit.trim(expression);

			var SPLIT_BERORE_REG=/(?=[-+*/%()])/;
			var SPLIT_AFTER_REG=/^([-+*/%()])(.*)$/;

			var arr=expression.split(SPLIT_BERORE_REG);

			var arr2=[];

			arr.forEach(function(item){
				var len=arr2.length;
				item.replace(SPLIT_AFTER_REG,function(str, $1, $2){
					arr2.push(toolkit.trim($1));
					if($2){
						$2=toolkit.trim($2);
						$2 && arr2.push($2);
					}
				})
				if(arr2.length===length){
					arr2.push(toolkit.trim(item));
				}
			})
			var arr3=[];
			arr2.forEach(function(item){
				if(/^[a-zA-Z]/.test(item)){
					arr3.push('a.'+item);
					return;
				}
				arr3.push(item);
			})

			var result=new Function('return function(a){return '+arr3.join('')+'}');

			console.log(arr)
			console.log(arr2)
			console.log(arr3)
			console.log(result)
			console.log(result())
			console.log(result()())
			console.log(eval(expression))

		}

		Parser(expression);

		module.exports=Parser;
	})
})
