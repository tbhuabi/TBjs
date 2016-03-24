define(function(require, exports, module) {
    var toolkit = require('./toolkit');


    var ODD_TAG_LIST = ['img', 'input', 'br', 'hr', 'param', 'meta', 'link'];


    var ELEMENT_NODE = 1;
    var TEXT_NODE = 3;
    var COMMENT_NODE = 8;
    var DOCUMENT_NODE = 9;

    //根对象
    function RootElementEngine() {};
    toolkit.extend(RootElementEngine.prototype, {
        getInnerHtml: function() {
            if (this.innerHTML) {
                return this.innerHTML;
            }
            var innerHTML = '';
            if (this.childNodes) {
                for (var i = 0; i < this.childNodes.length; i++) {
                    innerHTML += this.childNodes[i].getOuterHtml();
                }
            }
            this.innerHTML = innerHTML;
            return innerHTML;
        },
        getOuterHtml: function() {
            if (this.outerHtml) {
                return this.outerHtml;
            }
            if (this.nodeType === TEXT_NODE) {
                return this.innerText;
            }
            var outerHtml = '';
            outerHtml = '<' + this.tagName;
            if (this.attributes) { //document没有attributes
                var attrbutesList = [];
                for (var i = 0; i < this.attributes.length; i++) {
                    var item = this.attributes[i];
                    var attr = item.name;
                    if (attr === 'className') {
                        attr = 'class';
                    }
                    if (item.value !== null) {
                        if (item.value.indexOf('"') === -1) {
                            attr = attr + '="' + item.value + '"';
                        } else {
                            attr = attr + "='" + item.value + "'";
                        }
                    }
                    attrbutesList.push(attr);
                }
                if (attrbutesList.length) {
                    outerHtml = outerHtml + ' ' + attrbutesList.join(' ');
                }
            }
            outerHtml += '>';

            if (ODD_TAG_LIST.indexOf(this.tagName) === -1) {
                for (var i = 0; i < this.childNodes.length; i++) {
                    outerHtml += this.childNodes[i].getOuterHtml();
                }
                if (this.parentNode) {
                    outerHtml += '</' + this.tagName + '>';
                }
            }
            this.outerHtml = outerHtml;
            return outerHtml;
        },
        getInnerText: function() {
            if (this.innerText) {
                return this.innerText;
            }
            var text = '';
            if (this.childNodes) { //单标签没有子级
                for (var i = 0; i < this.childNodes.length; i++) {
                    text += this.childNodes[i].getInnerText();
                }
            }
            this.innerText = text.replace(/[\n\t\r]/g, '');
            return this.innerText;
        }
    });

    //dom元素构造函数

    function ElementEngine() {};
    ElementEngine.prototype = new RootElementEngine();
    toolkit.extend(ElementEngine.prototype, {
        constructor: ElementEngine,
        $refresh: function() {
            this.innerHTML = this.outerHtml = this.innerText = '';
            this.getOuterHtml();
            this.getInnerHtml();
            this.getInnerText();
            if (this.parentNode) {
                this.parentNode.$refresh();
            }
        },
        setInnerHtml: function(arg) {
            var newNodeElements = new DocumentEngine(arg);
            this.childNodes = [];
            for (var i = 0; i < newNodeElements.childNodes.length; i++) {
                this.appendChild(newNodeElements.childNodes[i]);
            }
            newNodeElements = null;
            this.$refresh();
        },
        setAttribute: function(attributes, value) {
            if (toolkit.isString(attributes)) {
                for (var i = 0; i < this.attributes.length; i++) {
                    if (this.attributes[i].name === attributes) {
                        this.attributes[i].value = value;
                        this.className = this.getAttribute('className');
                        this.classList = this.className.match(/[^\s]+/g) || [];
                        this.id = this.getAttribute('id');
                        this.$refresh();
                        return;
                    }
                }
                var obj = {};
                obj.name = attributes;
                obj.value = value;
                this.attributes.push(obj);
            } else if (toolkit.isObject(attributes)) {
                for (var i in attributes) {
                    if (!this.hasAttribute(i)) {
                        this.attributes.push({
                            name: i,
                            value: attributes[i]
                        })
                    }
                }
            }
            this.className = this.getAttribute('className');
            this.classList = this.className.match(/[^\s]+/g) || [];
            this.id = this.getAttribute('id');
            this.$refresh();
        },
        getAttribute: function(key) {
            var value;
            for (var i = 0; i < this.attributes.length; i++) {
                if (this.attributes[i].name === key) {
                    return this.attributes[i].value;
                }
            }
            return '';
        },
        hasAttribute: function(key) {
            for (var i = 0; i < this.attributes.length; i++) {
                if (this.attributes[i].name === key) {
                    return true;
                }
            }
            return false;
        },
        addClass: function(className) {
            var reg = new RegExp('(^|\\s+)' + className + '(\\s+|$)');
            if (!reg.test(' ' + this.className + ' ')) {
                this.setAttribute('className', toolkit.trim(this.className += ' ' + className));
            }
        },
        removeClass: function(className) {
            var reg = new RegExp('(^|\\s+)' + className + '(\\s+|$)');
            if (reg.test(' ' + this.className + ' ')) {
                this.setAttribute('className', this.className.replace(reg, '').replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' '));
            }
        },
        hasClass: function(className) {
            className = toolkit.trim(className);
            return this.classList.indexOf(className) !== -1;
        }
    });

    //dom方法构造函数

    function ElementMethodEngine() {};
    ElementMethodEngine.prototype = new ElementEngine();
    toolkit.extend(ElementMethodEngine.prototype, {
        constructor: ElementMethodEngine,
        getElementsByTagName: function(tagName) {
            var elements = [];
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i].tagName === tagName) {
                    elements.push(this.children[i]);
                }
                if (this.children[i].children) {
                    this.children[i].getElementsByTagName(tagName).filter(function(item) {
                        elements.push(item);
                    });
                }
            }
            return elements;
        },
        getElementsByClassName: function(className) {
            var elements = [];
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i].hasClass(className)) {
                    elements.push(this.children[i]);
                }
                if (this.children[i].children) {
                    this.children[i].getElementsByClassName(className).filter(function(item) {
                        elements.push(item);
                    });
                }
            }
            return elements;
        },
        appendChild: function(TBDomElement) {
            if (TBDomElement.parentNode !== this) {
                TBDomElement.parentNode = this;
                this.childNodes.push(TBDomElement);
                if (TBDomElement.nodeType === ELEMENT_NODE) {
                    this.children.push(TBDomElement);
                }
            } else {
                var currentNode;
                for (var i = 0; i < this.childNodes.length; i++) {
                    if (TBDomElement === this.childNodes[i]) {
                        this.childNodes.splice(this.childNodes.length - 1, 0, this.childNodes.splice(i, 1));
                    }
                }
                if (TBDomElement.nodeType === ELEMENT_NODE) {
                    for (var i = 0; i < this.children.length; i++) {
                        if (TBDomElement === this.children[i]) {
                            this.children.splice(this.children.length - 1, 0, this.children.splice(i, 1));
                        }
                    }
                }
            }
            this.$refresh();
        },
        removeChild: function(TBDomElement) {
            for (var i = 0; i < this.childNodes.length; i++) {
                if (this.childNodes[i] === TBDomElement) {
                    this.childNodes.splice(i, 1);
                    break;
                }
            }
            if (TBDomElement.nodeType === ELEMENT_NODE) {
                for (var i = 0; i < this.children.length; i++) {
                    if (this.children[i] === TBDomElement) {
                        this.children.splice(i, 1);
                        break;
                    }
                }
            }
            this.$refresh();
        },
        insertBefore: function(TBDomElement, nextElement) {
            var parentNode = TBDomElement.parentNode;
            for (var i = 0; i < parentNode.childNodes.length; i++) {
                if (parentNode.childNodes[i] === TBDomElement) {
                    parentNode.childNodes.splice(i, 1);
                    break;
                }
            }
            for (var i = 0; i < parentNode.children.length; i++) {
                if (parentNode.children[i] === TBDomElement) {
                    parentNode.children.splice(i, 1);
                    break;
                }
            }
            TBDomElement.parentNode = this;
            for (var i = 0; i < this.childNodes.length; i++) {
                if (this.childNodes[i] === nextElement) {
                    this.childNodes.splice(i, 0, TBDomElement);
                    break;
                }
            }
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i] === nextElement) {
                    this.children.splice(i, 0, TBDomElement);
                    break;
                }
            }
            this.$refresh();
        }
    })

    //document构造函数
    function DocumentEngine(htmlContent) {
        this.$XMLContent = htmlContent;
        this.nodeType = DOCUMENT_NODE;
        this.parentNode = null;
        this.innerHTML = '';
        this.innerText = '';
        this.outerHtml = '';
        this.classList = [];
        this.className = '';
        this.childNodes = [];
        this.children = [];
        this.$XMLEngine();
    }
    DocumentEngine.prototype = new ElementMethodEngine();
    toolkit.extend(DocumentEngine.prototype, {
        constructor: DocumentEngine,
        createElement: function(tag) {
            tag = tag.toLowerCase();
            if (ODD_TAG_LIST.indexOf(tag) === -1) {
                return new EvenElement(tag);
            }
            return new OddElement(tag);
        },
        createTextNode: function(text) {
            text = text.replace(/[<>]/g, function(str) {
                if (str === '<') {
                    return '&lt;';
                }
                return '&gt;';
            })
            return new TextElement(text);
        },
        getElementById: function(id) {
            function getElementById(parent) {
                var element = null;
                var children = parent.children || [];
                for (var i = 0; i < children.length; i++) {
                    if (children[i].id === id) {
                        return children[i];
                    } else {
                        element = getElementById(children[i]);
                        if (element) return element;
                    }
                }
                return element;
            }
            return getElementById(this);
        },
        getElementsByName: function(name) {
            var elements = [];
            this.getElementsByTagName('form').filter(function(item) {
                if (item.hasAttribute(name)) {
                    elements.push(item);
                }
            });
            return elements;
        },
        $XMLEngine: function() {
            //this.$XMLContent = this.$XMLContent.replace(/\s*[\n\t\r]+\s*/g, '');
            var arr1 = []; //存放第一次标签分析结果

            var SPLIT_TAG_BEFORE_REG = /(?!^)(?=<\w+(?:-\w+)*(?:\s+\w+(?:-\w+)*(?:="[^"]*"|='[^']*'|=[^\s>]+)*)*\s*\/?>|<\/\w+(?:-\w+)*>)/;
            var SPLIT_TAG_AFTER_REG = /(<\w+(?:-\w+)*(?:\s+\w+(?:-\w+)*(?:="[^"]*"|='[^']*'|=[^\s>]+)*)*\s*\/?>|<\/\w+(?:-\w+)*>)((?:.|\r|\n|\t|\s)*)/;
            var TEST_TAG_REG = /^<\w+(?:-\w+)*(?:\s+\w+(?:-\w+)*(?:="[^"]*"|='[^']*'|=[^\s>]+)*)*\s*\/?>$|^<\/\w+(?:-\w+)*>$/;



            this.$XMLContent.split(SPLIT_TAG_BEFORE_REG).filter(function(item) {
                arr1.push(item);
            });
            var arr2 = []; //存放第二次标签分析结果
            arr1.filter(function(item) {
                var oldLength = arr2.length;
                item.replace(SPLIT_TAG_AFTER_REG, function(str, $1, $2) {
                    arr2.push($1);
                    $2 && arr2.push($2);
                });
                if (oldLength == arr2.length) {
                    arr2.push(item);
                }
            })
            var arr3 = []; //存入组合过滤后的dom文本元素集合;
            var text = '';
            for (var i = 0; i < arr2.length; i++) {
                if (TEST_TAG_REG.test(arr2[i])) {
                    if (text !== '') {
                        arr3.push(text);
                        text = '';
                    }
                    arr3.push(arr2[i]);
                } else {
                    text += arr2[i];
                }
            }

            this.$XMLbuilder(this, arr3, 0);
        },
        $XMLbuilder: function(parentNode, arr, i) {
            if (i < arr.length) {
                var item = arr[i];
                var beginTag = /^<(\w+(?:-\w+)*)/.exec(item);
                if (beginTag) {
                    beginTag = beginTag[1];
                    var currentElement = this.createElement(beginTag);
                    var attrbutes = item.match(/\s\w+(-\w+)*(="[^"]*"|='[^']*'|[^\s>]+)*\s*?/g);
                    if (attrbutes) {
                        var attrbutesObj = {};
                        attrbutes.filter(function(item) {
                            item = toolkit.trim(item);
                            item.replace(/(^\w+(?:-\w+)*)(?:=(.*)$)?/, function(str, $1, $2) {
                                if ($1 === 'class') $1 = 'className';
                                if ($2) {
                                    $2 = $2.replace(/^['"]|['"]$/g, '');
                                }
                                attrbutesObj[$1] = $2;
                            })
                        })
                        currentElement.setAttribute(attrbutesObj);
                    }
                    parentNode.appendChild(currentElement);
                    i++;
                    if (currentElement.childNodes === undefined) {
                        this.$XMLbuilder(parentNode, arr, i);
                    } else {
                        this.$XMLbuilder(currentElement, arr, i);
                    }
                    return;
                }
                var closeTag = /^<\/(\w+(?:-\w+)*)/.exec(item);
                if (closeTag) {
                    closeTag = closeTag[1];
                    if (parentNode.parentNode) {
                        this.$XMLbuilder(parentNode.parentNode, arr, ++i);
                    }
                    return;
                }
                var currentElement = this.createTextNode(item);
                parentNode.appendChild(currentElement);
                this.$XMLbuilder(parentNode, arr, ++i);
            }
        }
    })

    //单标签元素构造函数

    function OddElement(tagName) {
        this.tagName = tagName;
        this.nodeType = ELEMENT_NODE;
        this.parentNode = null;
        this.innerHTML = '';
        this.innerText = '';
        this.outerHtml = '';
        this.classList = [];
        this.className = '';
        this.attributes = [];
    }
    OddElement.prototype = new ElementEngine();
    toolkit.extend(OddElement.prototype, {
        constructor: OddElement
    })


    //双标签元素构造函数
    function EvenElement(tagName) {
        this.tagName = tagName;
        this.nodeType = ELEMENT_NODE;
        this.parentNode = null;
        this.innerHTML = '';
        this.innerText = '';
        this.outerHtml = '';
        this.classList = [];
        this.className = '';
        this.childNodes = [];
        this.children = [];
        this.attributes = [];
    }
    EvenElement.prototype = new ElementMethodEngine();
    toolkit.extend(EvenElement.prototype, {
        constructor: EvenElement
    })

    //文本节点构造函数
    function TextElement(text) {
        this.parentNode = null;
        this.nodeType = TEXT_NODE;
        this.innerHTML = this.innerText = this.outerHtml = text;
    }
    TextElement.prototype = new RootElementEngine();
    TextElement.prototype.constructor = TextElement;









    module.exports = function(text) {
        var document = new DocumentEngine(text);
        console.log(document);
        //console.log(document.getElementsByClassName('a'));
        //        var td = document.getElementsByTagName('td');
        //        td.filter(function(item) {
        //            item.addClass('test');
        //        })
        //console.log(document.getOuterHtml());
    };
})
