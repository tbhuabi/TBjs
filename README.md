TBjs开发文档
========================
关于我：
------------------------
QQ：464328895 
由于本人能力有限，且读书少，英语更是烂上加烂，所以希望有兴趣的童鞋一起参于开发


#### 当前前端框架及类库的一些限制（见识所限，难免谬误）：
##### React  
本身并没有做什么事，只是提供一了套前端组织代码的方法，JSX虽好，但需要编译，否则前端需要加载JSX的解析文件，不利于前端精简代码……  
##### Angular
angular各种好，但2.0跳崖式升级，想必大家的有所诟病，另外不利于SEO，虽然有其他迂回的方法，但还是让人不爽，模板和指令很好，但后台不认识，兼容第三方类库或插件也必须经过包装…… 
##### jQuery
这个基本不用说了，大家太熟悉，jQuery提供了一套非常优雅的API，操作DOM非常方便，但基本可能说，也仅些而已。 


项目简介：
------------------------
由于在实际开发过程中，因为前后台的一些差异，往往同样的逻辑需要实现两遍，且不能做到模板通用，所以爱折腾的我发起这个项目。TBjs发起的初衷是想成为一个具有模块化、MVC、AMD异步加载、数据双向绑定，整合第三方代码容易，当然，最重要的是能__前后台通用代码__，这样后台就能完成由前端模板及代码完成首屏渲染，有利于seo，前台也通过后台生成的页面，自动识别并做好数据映射。  
在项目开发过程中，借鉴了Angular、React、jQuery的一些思想，甚至有的代码是直接参考，但有的地方也有很大的不同，为了大家便于理解，故把整个工程的代码模块，用处，及最后的使用demo发布如下：


#### 项目文件简介（可能因为不能及时更新，有所不同）：
  

* `classes`		源码目录
	- `TBjs.js`		框架主文件
	- `src`			框架源文件
		+ `amd.js`  类requirejs的AMD模块化框架
		+ `ast.js`  构建抽象语法树
		+ `bootstrap.js`  启动已注册的应用
		+ `compiler.js`  编译需要实例化的应用
		+ `directive.js`  指令提供者
		+ `http.js`  数据交互模块
		+ `lexer.js`  模板语法，词法分析器
		+ `main.js`  注册应用的入口
		+ `module.js`  MVC模块提供者
		+ `parse.js`  解析模板语法的入口
		+ `promise.js`  异步回调金字塔解决方案
		+ `query.js`  类jQuery的DOM及虚拟DOM的类库
		+ `scope.js`  构建模块作用域
		+ `service.js`  服务提供者
		+ `toolkit.js`  工具函数集合
		+ `value.js`  根据当前作用域，求出模板表达式的值
		+ `xmlEngine.js`  虚拟DOM引擎
* `test.html`	测试文件


例用范例：
-----------------------------------
**以下demo是当前开发进度下可能的预览，正式发布时可能有所更改**
##### 注册一个应用
```javascript
var TB = require('TBjs');
var myApp = TB.app('myApplication');
```
##### 给myApp注册通用服务
TBjs的service跟angular不同，TBjs对service的定义是当调用某个已注册的服务时，一定会更新视图或数据，当使用时需要一些公共的字面量或函数时，推荐用AMD或commonjs规范，通过require函数来引入，这样可以保证服务的单一性，以降低复杂度。
虽然你也可以通过service的返回值来返回一个常量，但并不推荐这么做。
service方法会跟据不同的返回值，做出不同的响应，为了防止迷惑，把所有可能的情况列举如下：

###### 返回一个常量
```javascript
myApp.service('serviceA', function() {
    return 'a';
})
```
###### 返回一个对象
```javascript
myApp.service('serviceB', function() {
    return {
        name: '张三',
        age: 24
    }
})
```
###### 返回一个对象，并提供一个$get方法

如果返回一个对象，并且有$get方法，那么在module中，service会注入$get方法的返回值

```javascript

myApp.service('serviceC', function() {
    return {
        $get: function() {
            return {
                name: '张三',
                age: 24,
            }
        }
    }
})
```
######  返回一个构造函数
如果service返回的是一个函数，那么这个函数一定会被当成一个构造函数来调用，如果使用中确实须要返回一个函数，请通过$get方法返回

```javascript
myApp.service('serviceD', function() {
    return function() {
        this.name = '张三';
        this.age = 24;
    }
})
```
######  返回一个构造函数

如果实例化后有$get方法，那么在module中，service会注入$get方法的返回值
```javascript
myApp.service('serviceE', function() {
    return function() {
        this.$get = function() {
            return {
                name: '张三',
                age: 24,
            }
        }
    }
})
```
######  service中的依赖注入
依赖注入同angular一样，以数组的方式传入，最后一个元素为函数，函数参数会按照数组的书写顺序依次传入
```javascript
myApp.service('serviceF', ['serviceA', 'serviceB',
    function(serviceA, serviceB) {
		//your code
    }
])
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
    return function(services) {
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
        model: function(services) {
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

		
			