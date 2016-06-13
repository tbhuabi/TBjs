function $CompileProvider() {
    var compileMinErr = minErr('compiler');
    this.$get = ['$parse', '$virtualDom', '$query', function($parse, $virtualDom, $query) {
        return function parserExpors(domElement) {
            if (isString(domElement)) {
                domElement = $virtualDom(domElement);
            }

            if (!domElement.$ENGINE) {
                throw compileMinErr('params', '编译模板的参数只能为字符串或一个虚拟DOM对象！');
            }
        }
    }]
}
