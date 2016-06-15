TBjs开发文档
========================
关于我：
------------------------
QQ：464328895 
由于本人能力有限，且读书少，英语更是烂上加烂，所以希望有兴趣的童鞋一起参于开发。

#### 部分文档

* [query.js](https://github.com/18616392776/TBjs/blob/master/docs/query.md)一个兼容DOM和虚拟DOM的类jQuery工具库 
* [xmlEngine.js](https://github.com/18616392776/TBjs/blob/master/docs/xmlEngine.md)虚拟DOM



#### 当前前端框架及类库的一些限制（见识所限，难免谬误）：
##### React  
本身并没有做什么事，只是提供一了套前端组织代码的方法，JSX虽好，但需要编译，否则前端需要加载JSX的解析文件，不利于前端精简代码……  
##### Angular
angular各种好，但2.0跳崖式升级，想必大家的有所诟病，另外不利于SEO，虽然有其他迂回的方法，但还是让人不爽，模板和指令很好，但后台不认识…… 
##### jQuery
这个基本不用说了，大家太熟悉，jQuery提供了一套非常优雅的API，操作DOM非常方便，但基本可能说，也仅些而已。 


项目简介：
------------------------
由于在实际开发过程中，因为前后台的一些差异，往往同样的逻辑需要实现两遍，且不能做到模板通用，所以爱折腾的我发起这个项目。TBjs发起的初衷是想成为一个具有模块化、MVC、AMD异步加载、数据双向绑定，整合第三方代码容易，当然，最重要的是能__前后台通用代码__，这样后台就能完成由前端模板及代码完成首屏渲染，有利于seo，前台也通过后台生成的页面，自动识别并做好数据映射。  
在项目开发过程中，借鉴了Angular、React、jQuery的一些思想，甚至有的代码是直接参考，但有的地方也有很大的不同，为了大家便于理解，故把整个工程的代码模块，用处，及最后的使用demo发布如下：


#### 项目文件简介（可能因为不能及时更新，有所不同）：
  

* `classes`		源码目录
	- `src`			框架源文件
		+ `amd`  		类requirejs的AMD模块化框架
		+ `bootstrap`	启动已注册的应用
		+ `injector`	依赖注入方法
		+ `main`  		框架主文件
		+ `main`  		框架主文件
		+ `toolkit`  	公共方法集合
		+	providers  
			* `ast`			构建抽象语法树
			* `async`		兼容Node和Web的异步文件服务
			* `compile`		虚拟DOM编译器
			* `directive` 	指令服务	
			* `lexer`		词法分析器
			* `model`		数据模型
			* `module`		模块服务
			* `parse`		语法树解析器
			* `promise` 	异步回调解决方案
			* `query`		兼容DOM和虚拟DOM的类jQuery类库
			* `virtualDom`	虚拟DOM成生器
		+ `directives` 
			* `event`		一般DOM事件指令集合
			* `tbClass`
			* `tbFor`
			* `tbIf`
			* `tbInit`
			* `tbModel`
			* `tbModule`
			* `tbShow`
			* `tbStyle`
			* `tbTemplate`
* `TBjs.html`	测试文件


例用范例：
-----------------------------------
**以下demo是当前开发进度下可能的预览，正式发布时可能有所更改**
##### 注册一个应用
```javascript
var TBjs = require('TBjs');
var myApp = TBjs.app('myApplication');
```
##### 给myApp注册通用服务
TBjs的service跟angular不同，TBjs只实现了angular的provider，剔除了angular的factory、service、value等方法，相应功能推荐用TBjs的AMD模块来定义：

###### 返回一个常量
```javascript
myApp.directive('serviceA', function() {
	var value = 'yourValue';
    this.$get = function() {
		return value;
	}
})
```
######  service中的依赖注入
依赖注入同angular一样，以数组的方式传入，最后一个元素为函数，函数参数会按照数组的书写顺序依次传入
```javascript
myApp.service('serviceF', function() {
	this.$get=['service1', 'service2', function(service1, service2) {
		return 'value';
	}]
})
```

##### 给myApp注册指令

指令是指在DOM元素中的一些有特殊行为的属性，TBjs的指令和Angular的指令不同，demo如下：

```javascript
myApp.directive('myDirective', function() {
    return function(data, virtualDom, services) {
        //your code
    }
});
```
或者
```javascript
myApp.directive('myDirective', function() {
    return {
        priority: 0,
        controller: function(data, virtualDom, services) {
            //your code
        }
    }
});
```
参数说明：
* data：当前作用域的数据对象
* virtualDom：应用当前指令的虚拟dom
* services：当前指令所属application的服务集合

如果直接返回一个函数，TBjs会把这个函数当作`controller`来使用，并传入相应函数，但指令应用执行的优先级交由TBjs自动处理。  

如果返回的是一个对象，TBjs会跟据这个对象的`priority`属性的值来确定优先级，并根据对应优先级来调用`controller`函数。
指令优先级顺序在TBjs开发完成后，将会在文档中公布。

##### 给myApp注册模块

TBjs的模块是一个包含数据模型，视图模板的集合，有点类似于Angular中controller和direcitve的一部分，更像是React中component的概念，demo如下：

如果直接返回一个函数，那么这个函数将会被当做构造函数来调用，并传入当前module所属的已实例化的application的服务的集合
```javascript
myApp.module('myModule', function() {
    return function() {
        this.name = '张三';
        this.age = 24;
        var _this = this;
        this.changeName = function() {
            _this.name = '李四';
        }
    }
})
```
或者这样
```javascript
myApp.module('myModule', function() {
    return {
        template: '一个模板字符串',
        templateUrl: '一个模板字符串的url地址',
        model: function() {
            this.name = '张三';
            this.age = 24;
            var _this = this;
            this.changeName = function() {
                _this.name = '李四';
            }
        }
    }
})
```
如要需要服务，注入方式和angular一样：

```javascript
myApp.module('myModule', ['serviceA', function(serviceA) {
    return {
        template: '一个模板字符串',
        templateUrl: '一个模板字符串的url地址',
        model: function() {
            this.name = '张三';
            this.age = 24;
            var _this = this;
            this.changeName = function() {
                _this.name = '李四';
            }
        }
    }
}])
```
		
			