window.onload = function() {
    var domEngine = $XmlEngineProvider().$get();
    var vDom = domEngine(document.getElementsByTagName('html')[0].outerHTML);
    console.log(vDom);
}
