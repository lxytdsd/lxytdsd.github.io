/****************************************

 @Name：layer mobile v1.2 弹层组件移动版
 @Author：贤心
 @Date：2014-09-24
 @Copyright：Sentsin Xu(贤心)
 @官网：http://sentsin.com/layui/layer
 @License：MIT
        
 */

;!function(win){        
"use strict";

var path = '/css/'; //所在路径，如果非模块加载不用配置
path = path ? path : document.scripts[document.scripts.length-1].src.match(/[\s\S]*\//)[0];

var doc = document, query = 'querySelectorAll', claname = 'getElementsByClassName', S = function(s){
    return doc[query](s);
};
//document.querySelectorAll(s)



//默认配置
var config = {
     type: 0,
     shade: true,
     shadeClose: true,
     fixed: true,
     anim: true
};

win.ready = {
    extend: function(obj){
        var newobj = JSON.parse(JSON.stringify(config));
        for(var i in obj){
            newobj[i] = obj[i];
        }
        return newobj;
    }, 
    timer: {},
    end: {}
};

var index = 0, classs = ['layermbox'], Layer = function(options){
    var that = this;
    that.config = ready.extend(options);
    that.view();
};

Layer.prototype.view = function(){
    var that = this, config = that.config, layerbox = doc.createElement('div');

    that.id = layerbox.id = classs[0] + index;
    layerbox.setAttribute('class', classs[0] + ' ' + classs[0]+(config.type || 0));
    layerbox.setAttribute('index', index);

    var title = (function(){
        var titype = typeof config.title === 'object';
        return config.title
        ? '<h3 style="'+ (titype ? config.title[1] : '') +'">'+ (titype ? config.title[0] : config.title)  +'</h3><button class="layermend"></button>'
        : '';
    }());
    
    var button = (function(){
        var btns = (config.btn || []).length, btndom;
        if(btns === 0 || !config.btn){
            return '';
        }
        btndom = '<span type="1">'+ config.btn[0] +'</span>'
        if(btns === 2){
            btndom = '<span type="0">'+ config.btn[1] +'</span>' + btndom;
        }
        return '<div class="layermbtn">'+ btndom + '</div>';
    }());
    
    if(!config.fixed){
        config.top = config.hasOwnProperty('top') ?  config.top : 100;
        config.style = config.style || '';
        config.style += ' top:'+ ( doc.body.scrollTop + config.top) + 'px';
    }
    
    if(config.type === 2){
        config.content = '<i></i><i class="laymloadtwo"></i><i></i><div>' + (config.content||'') + '</div>';
    }
    
    layerbox.innerHTML = (config.shade ? '<div class="laymshade"></div>' : '')
    +'<div class="layermmain" '+ (!config.fixed ? 'style="position:static;"' : '') +'>'
        +'<section>'
            +'<div class="layermchild '+ ((!config.type && !config.shade) ? 'layermborder ' : '') + (config.anim ? 'layermanim' : '') +'" ' + ( config.style ? 'style="'+config.style+'"' : '' ) +'>'
                + title
                +'<div class="layermcont">'+ config.content +'</div>'
                + button
            +'</div>'
        +'</section>'
    +'</div>';
    
    if(!config.type || config.type === 2){
        var dialogs = doc[claname](classs[0] + config.type), dialen = dialogs.length;
        //console.log(dialogs);
        if(dialen >= 1){
            layer.close(dialogs[0].getAttribute('index'))
        }
    }
    
    document.body.appendChild(layerbox);
    

    //使用id查找弹出层elem
    var elem = that.elem = S('#'+that.id)[0];

    setTimeout(function(){
        try{
            // 给弹出层添加样式layermshow
            elem.className = elem.className + ' layermshow';           
        }catch(e){
            return;
        }
        //层成功弹出层的回调函数，返回一个参数为当前层元素对象
        config.success && config.success(elem);
    }, 1);
    
    that.index = index++;
    that.action(config, elem);
};

Layer.prototype.action = function(config, elem){
    var that = this;
    
    //自动关闭
    if(config.time){
        ready.timer[that.index] = setTimeout(function(){
            layer.close(that.index);
        }, config.time*1000);
        //console.log(ready.timer[that.index]);
    }
    
    //关闭按钮
    if(config.title){
        elem[claname]('layermend')[0].onclick = function(){
            //点击右上角的叉叉后的回调
            config.cancel && config.cancel();
            layer.close(that.index);
        };
    }
    
    //确认取消type==0为取消，type==1为确定
    if(config.btn){
        var btns = elem[claname]('layermbtn')[0].children, btnlen = btns.length;
        for(var ii = 0; ii < btnlen; ii++){
            btns[ii].onclick = function(){
                var type = this.getAttribute('type');
                if(type == 0){
                    //点击取消后的回调函数
                    config.no && config.no();
                    layer.close(that.index);
                } else {
                    //点击确定后的回调函数
                    config.yes ? config.yes(that.index) : layer.close(that.index);
                }
            };
        }
    }
    
    //点遮罩关闭
    if(config.shade && config.shadeClose){
        var shade = elem[claname]('laymshade')[0];
        shade.onclick = function(){
            layer.close(that.index, config.end);
        };
        shade.ontouchmove = function(){
            layer.close(that.index, config.end);
        };
    }
    
    config.end && (ready.end[that.index] = config.end);
};

var layer = {
    v: '1.2',
    index: index,
    
    //核心方法
    open: function(options){
        var o = new Layer(options || {});
        //console.log(o);      
        return o.index;
    },
    
    close: function(index){
        var ibox = S('#'+classs[0]+index)[0];
        if(!ibox) return;
        ibox.innerHTML = '';
        doc.body.removeChild(ibox);
        clearTimeout(ready.timer[index]);
        delete ready.timer[index];
        // 层彻底销毁后的回调函数
        typeof ready.end[index] === 'function' && ready.end[index]();

        delete ready.end[index]; 

    },
    
    //关闭所有layer层
    closeAll: function(){
        var boxs = doc[claname](classs[0]);
        for(var i = 0, len = boxs.length; i < len; i++){
            layer.close(boxs[i].getAttribute('index'));
        }
    }
};

"function" === typeof define ? define(function() {
    return layer;
}) : win.layer = layer;

}(window);

var ajaxLoading = {
    start: function(){
        //var host = location.host;
        var loadingHtml = '<div class="layermbox ajax-loading" id="ajaxLoading"><div class="laymshade"></div><div class="layermmain"><section><img src="/public/se7en/images/loading.gif" width="50" alt=""></section></div></div>';
        $('body').append(loadingHtml);
    },
    end: function(){
        $('#ajaxLoading').length > 0 && $('#ajaxLoading').remove();
    }
}
window.ajaxLoading = ajaxLoading;

