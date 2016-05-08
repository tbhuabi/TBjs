query.js简介
====================
query.js是TBjs框架的一部分，主要是实现兼容dom及虚拟dom（查看虚拟dom文档，请[点我](https://github.com/18616392776/TBjs/blob/master/docs/xmlEngine.md)）的快捷dom操作，api也基本和jQuery保持一致，但并不等同于jQuery，也并没有全部实现jQuery中的方法。当前已的API及demo示例如下。

请先点击右侧的download按扭，下载整个项目，然后打开`test.html`，添加如下代码。

```javascript
var $ = TBjs.$;
```

#### 选择器
```javascript
var $div = $('div');
```

更复杂的选择器，这里其实是调用的原生的querySelectorAll来实现的
```javascript
var $elements = ('div p>a.link[href=www.github.com]');
```
如果要操作虚拟dom，因时间问题，当前实现的选择器有，可以自由组合

|传入参数	|说明		|
|--|--|
|`.class`		|类选择器|
|`#box	`	|id选择器|
|`div	`	|标签选择器|
|`[href] `或 `[href=www.github.com]` 或 `[href='www.github.com']`	|属性选择器|
|`:first-child`	|第一个子元素|
|`:last-child`	|	最后一个子元素|
|`+p`		|兄弟节点|

当然也少不了`find`方法：

```javascript
var $p = $('div').find('p');
```

#### 事件
包括直接绑定，批量绑定，事件委托，解绑，事件命名空间，主动触发等一系列功能，

##### 事件绑定
```javascript
//直接绑定
$('div').on('click', function(ev) {
    //your code
})

//绑定多个事件
$('div').on('click keyup', function(ev) {
    //your code
})

//事件委托
$('div').on('click', 'a', function(ev) {
    //your code
})

//给事件添加命名空间，方便用off解绑该命名空间的函数
$('div').on('click.type', function(ev) {
    //your code
})
```
##### 事件解绑

```javascript
//解绑全部用on绑定的函数
$('div').off();

//解绑特定事件
$('div').off('click');

//解绑多个事件
$('div').off('click keyup');

//解绑命名事件
$('div').off('click.type');

//解绑事件委托
$('div').off('click', 'a');

//解绑具名函数
$('div').off('click', functionName);
```
##### 只执行一次的事件
```javascript
$('div').one('click', function(ev) {
    //your code
})
```

##### 主动触发事件
```javascript
$('div').trigger('click');
$('div').trigger('click.type');
```
以上所有功能都可自由组合，如果使用过jQuery，应该是很熟悉的。

#### 属性操作
获取属性
```javascript
$('div').attr('attrName');
```
设置属性
```javascript
$('div').attr('attrName', 'attrValue');
```
#### class操作
```javascript
$('div').addClass('className');
$('div').removeClass('className');
```








