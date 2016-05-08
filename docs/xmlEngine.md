xmlEngine.js简介
====================
xmlEngine.js是TBjs框架的一部分，主要是实现虚拟dom，在node环境下，也能调用dom的标准api，但并没有实现dom的全部方法及属性。

虚拟dom成生的dom树，所有的属性最是只读的，出于性能考虑，并没有实现getter、setter，如果要更改某个属性，请调用相关方法来实现。下面的demo是把当前页面的html字符串，构建成一个虚拟dom树，并可以在控制台中查看相关方法和属性。
请先点击右侧的download按扭，下载整个项目，然后打开`test.html`，添加如下代码。
```javascript
window.onload = function() {
    var domEngine = $XmlEngineProvider().$get();
    var vDom = domEngine(document.getElementsByTagName('html')[0].outerHTML);
    console.log(vDom);
}
```



