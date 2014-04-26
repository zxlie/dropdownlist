/**
 * 自定义下拉框
 *
 * @homepage    http://www.baidufe.com/component/dropdownlist/index.html
 * @author      zhaoxianlie
 */
var DropDownList = (function($,undefined) {
    var staticVar = {
        themeIdPrefix: 'dropdownThemeFor',
        themeId: 'dropdownThemeFor#{id}',
        listId: 'dropdownOptionsFor#{id}',
        classDropdownlsit: 'mod-dropdownlist',
        classFormitem: 'dropdown-select',
        classInput: 'dropdown-input',
        classIcon: 'dropdown-icon',
        classOptions: 'dropdown-options',
        classFocusLi: 'dropdown-options-focus',
        classList : 'dropdown-list',
        classCustomScrollbar : 'custom-scroll-bar',
        classCustomBox : 'dropdown-custombox',
        attrOptionValue: 'data-value',
        attrStylesCols: 'data-cols',
        attrStylesWidth: 'data-width'
    };
    var ids = [];

    /**
     * 创建随即字符串，作为Dom节点的ID
     * @return {String}
     */
    var randomID = function() {
        while (true) {
            var id = ((new Date()).getTime() + 'Select' + Math.floor(Math.random() * 100000)).toString();
            if (!ids[id]) {
                ids[id] = true;
                return id;
            }
        }
    };

    /**
     * 仿tangram 中的 T.string.format 方法
     * @param str 目标字符串
     * @param opts
     * @return {*}
     */
    var format = function (str,opts) {
        source = str;
        var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
        if(data.length){
            data = data.length == 1 ?
                (opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data)
                : data;
            return source.replace(/#\{(.+?)\}/g, function (match, key){
                var replacer = data[key];
                // chrome 下 typeof /a/ == 'function'
                if('[object Function]' == toString.call(replacer)){
                    replacer = replacer(key);
                }
                return ('undefined' == typeof replacer ? '' : replacer);
            });
        }
        return source;
    };


    /**
     * DropDownList Class
     * @param options
     * @constructor
     */
    var DDLClass = function(){

    };

    DDLClass.prototype = {
        constructor:DDLClass,

        _addListItem : function(opt){
            var self = this;
            var new_option = $('<a></a>');
            new_option.attr(staticVar.attrOptionValue, opt.value);
            new_option.html(opt.text);
            new_option.attr('href','javascript:;');
            var li = $('<li></li>');
            new_option.click(function(event) {
                var value = $(this).attr(staticVar.attrOptionValue);
                self.select.val(value);
                self.select.trigger('change');
                self.hide().listEle.trigger('hide-list');
            });
            li.append(new_option);
            self.listUL.append(li);
            return self;
        },

        /**
         * 创建list
         * @private
         */
        _list : function(){
            var self = this;
            this.listId = format(staticVar.listId, {id: this.select.attr('id') || randomID()});
            this.listEle = $('<div></div>').attr('id',this.listId).addClass(staticVar.classList).addClass(staticVar.classCustomScrollbar).hide();
            this.listUL = $('<ul></ul>').appendTo(this.listEle);
            this.listBox = $('<div></div>').appendTo(this.listEle).addClass(staticVar.classCustomBox);

            // 在列表底部增加一个额外的节点
            if(this.configs.box){
                this.listBox.append(this.configs.box);
            }

            var clickFunc = function(evt){
                if(!$.contains(self.listEle[0],evt.target)) {
                    self.hide();
                }
            };
            this.listEle.bind('show-list',function(){
                $(document).bind('click', clickFunc);
            });
            this.listEle.bind('hide-list',function(){
                $(document).unbind('click', clickFunc);
            });

            var theOptions = this.select[0].options;

            $.each(theOptions,function(i,opt){
                self._addListItem(opt);
            });

            this.listUL.addClass(staticVar.classOptions);
            var resize = function() {
                $(window).unbind('resize',resize);
                setTimeout(function() {
                    var position = self.element.position();
                    self.listEle.css({
                        'left': position.left - 1,
                        'top': position.top + self.element[0].offsetHeight
                    });
                    $(window).resize(resize);
                }, 10);
            }
            $(window).resize(resize);
            self.listEle.appendTo(self.dropdownEle);
        },

        /**
         * 通过原生的select控件，创建自定义的下拉列表
         * @return {*|jQuery}
         */
        _createFromSelect : function() {
            this.select = $(this.configs.select);
            var themeId = format(staticVar.themeId, {id: this.select.attr('id')}),
                ddl = $('<a></a>').attr({
                    id: themeId,
                    'href': 'javascript:;',
                    'class': staticVar.classFormitem
                }),
                input = $('<span></span>').attr({
                    'class': staticVar.classInput
                }),
                icon = $('<span></span>').attr({
                    'class': staticVar.classIcon
                }),
                elementClass = this.select.attr('class');

            if (this.select[0].selectedIndex>=0) {
                input.html('<nobr>' + this.select[0].options[this.select[0].selectedIndex].text + '</nobr>');
            }
            icon.html('&#160');
            ddl.append(input).append(icon);

            if (elementClass) {
                $.each(elementClass.split(/\s+/),function(i,cls){
                    ddl.addClass(cls);
                })
            }

            // 把原来的控件隐藏，插入新控件
            this.select.hide();
            this.dropdownEle = $('<div></div>').append(ddl).insertAfter(this.select)
                .addClass(staticVar.classDropdownlsit).addClass(this.configs.className || '');

            // 自定义宽度
            var customizedWidth = this.select.attr(staticVar.attrStylesWidth) || '';
            if (customizedWidth) {
                var pdl = parseInt(input.css('padding-left'),10) || 0,
                    pdr = parseInt(input.css('padding-right'),10) || 0;
                input.css('width', parseInt(customizedWidth, 10) - pdl - pdr - icon[0].offsetWidth - 3);
            }

            // 绑定事件
            input.parent().click(function(event){
                if($(this).attr('data-showwing') == 1){
                    self.hide();
                }else{
                    self.show();
                }
                event.preventDefault();
                event.stopPropagation();
            });
            var self = this;
            this.select.change(function(event) {
                if (self.select[0].selectedIndex>=0) {
                    input.html('<nobr>' + self.select[0].options[self.select[0].selectedIndex].text + '</nobr>');
                }
            });

            this.input = input;
            this.icon = icon;
            this.element = input.parent();
            this._list();
            return ddl;
        },

        _init : function(configs) {
            this.configs = $.extend({
                container : 'body'
            },configs || {});

            var sel,attrs = {};
            attrs.id = this.configs.attrs.id || randomID();
            attrs['data-cols'] = this.configs.attrs.column || 8;
            if(this.configs.attrs.width) {
                attrs['data-width'] = this.configs.attrs.width;
            }

            // select控件通过js创建
            if(this.configs.options){
                if(this.configs.attrs.id) {
                    attrs.id = this.configs.attrs.id;
                }
                attrs['data-cols'] = this.configs.attrs.column || 8;
                if(this.configs.attrs.width) {
                    attrs['data-width'] = this.configs.attrs.width;
                }
                sel = $('<select></select>').attr(attrs).hide().appendTo($(this.configs.container));
                var selectedIndex, option;
                $.each(this.configs.options,function(i,opt){
                    option = new Option(opt[0] || opt, opt[1] || opt[0] || opt);
                    if (opt[2]) {
                        option.selected = true;
                        option.setAttribute('selected', 'selected');
                        selectedIndex = i;
                    }
                    sel[0].options.add(option);
                });
                this.configs.select = sel;
            }else{
                sel = this.configs.select.attr(attrs).hide();
                if (!sel.is('select')) return;
            }
            $('#'+format(staticVar.themeId, {id: sel[0].id})).remove();
            if (sel[0].options.length) this._createFromSelect(sel).show();

            return this;
        },

        /**
         * 获取或设置 下拉框的值
         * @param   {String}        value 需要给下拉框设定的内容
         * @return  {String/Object} value有值时返回DropDownList实例本身，否则返回下拉框的真实值
         */
        val : function(value){
            if((value || '').length) {
                this.select.val(value).trigger('change');
                return this;
            }else{
                return this.select.val();
            }
        },

        change : function(){
            if(arguments.length) {
                return this.select.change.apply(this.select,arguments);
            }else{
                this.select.trigger('change');
                return this;
            }
        },

        show : function(){
            var self = this;
            self.element.attr('data-showwing',1);
            var optionHeight = parseInt(self.configs.attrs.height,10) || 30;
            $('li a',self.listUL).css({
                'height' : optionHeight + 'px',
                'line-height' : optionHeight + 'px'
            });

            // 自定义高度
            var customizedCols = self.select.attr(staticVar.attrStylesCols) || '10';
            var lis = $('li',self.listUL);
            var listHeight = optionHeight * Math.min((parseInt(customizedCols, 10)), lis.length);
            var parent = $('#' + format(staticVar.themeId,{id : self.select.attr('id')}));
            var position = parent.position();
            var tmpStyles = {
                'position': 'absolute',
                'left': position.left ,
                'top': position.top + parent[0].offsetHeight ,
                'width': parent[0].offsetWidth - (parseInt(parent.css('border-left-width'),10) || 0)
                            - (parseInt(parent.css('border-right-width'),10) || 0),
                'z-index': (parseInt(self.select.parent().css('z-index'),10) || 0) + 10
            };
            self.listUL.css({'height': listHeight});
            self.listEle.css(tmpStyles).show().trigger('show-list');

            var focusOption;
            $.each(lis,function(i,li){
                if (self.select.val()==$('a',li).attr(staticVar.attrOptionValue)) {
                    focusOption = li;
                    return false;
                }
            });
            if (focusOption) {
                setTimeout(function() {
                    $(focusOption).siblings('li').removeClass(staticVar.classFocusLi).end().addClass(staticVar.classFocusLi);
                    focusOption.parentNode.scrollTop = focusOption.offsetTop;
                },10);
            }
            return self;
        },

        hide : function(){
            this.element.attr('data-showwing',0);
            this.listEle.hide().trigger('hide-list');
            return this;
        },

        add : function(option){
            var opt = new Option(option.text,option.value);
            this.select[0].options.add(opt);
            this._addListItem(opt);
            return this;
        }
    };

    /**
     * 根据配置创建自定义下拉框
     *
     * @param       {Object}    configs     创建下拉框所需要的配置项
     *
     * @p-config    {jQ-Elm}    select      原生select控件的jQuery对象，通过原生select创建时候必选
     *
     * @p-config    {jQ-Elm}    container   自定义下拉框的父容器，通过JSON数据创建时候必选
     *
     * @p-config    {String}    className   自定义下拉框组件的class，所有和下拉框相关的节点，都受这个className控制
     *
     * @p-config    {Object}    attrs       自定义下拉框的相关属性，参数可选
     * @p-c-config  {String}    id          给自定义下拉框指定一个id，之后可以通过id进行DOM操作
     * @p-c-config  {String}    column      自定义下拉框中的option显示行数，默认显示10行
     * @p-c-config  {Integer}   width       自定义下拉框的宽度，字数超过会自动截断处理，默认：自适应
     * @p-c-config  {Integer}   height      自定义下拉框的高度，默认：30px
     *
     * @p-config    {Array}     options     自定义下拉框需要显示的选项数据，对应select中的option
     * @p-c-item    {Array}                 格式：[text,value,selected]
     *
     * @return      {DropDownList}          返回一个DropDownList实例
     */
    var _create = function(configs) {
        return (new DDLClass())._init(configs);
    };

    return {
        version : '1.3',
        create : _create
    };
})(jQuery);