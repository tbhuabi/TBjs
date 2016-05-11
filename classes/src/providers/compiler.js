function $CompilerProvider() {
    var compileElementNode = function(elementNode) {

    };
    var compileCommentNode = function(commentNode) {

    };
    var compileTextNode = function(textNode) {

    };
    this.$get = ['$xmlEngine', '$query', '$parse',
        function($xmlEngine, $query, $parse) {
            return function compiler(html) {
                if (isString(htmlText)) {
                    var html = $xmlEngine(html);
                }
                var TEST_COMMENTNODE_IS_DIRECTIVE_REG = /^<!--\s{2}directive:.*\s{2}-->$/;

                function compileHtml(html, $scope) {
                    var childNodes = html.childNodes;
                    if (!childNodes) return;
                    for (var i = 0, len = childNodes.length; i < len; i++) {
                        switch (childNodes[i].nodeType) {
                            case ELEMENT_NODE:
                                compileElementNode(childNodes[i]);
                                compileHtml(childNodes[i], $scope);
                            case COMMENT_NODE:
                                if (TEST_COMMENTNODE_IS_DIRECTIVE_REG.test(childNodes[i].outerHTML)) {
                                    compileCommentNode()
                                }
                            case TEXT_NODE:
                                compileTextNode(childNodes[i]);
                        }
                    }
                }
                return function($scope) {
                    compileHtml(html, $scope);
                    return html;
                }
            }
        }
    ];
}
