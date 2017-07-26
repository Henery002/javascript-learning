/**
 * 观察者模式
 */
// 01. 函数式观察者实现 //
 // 观察者初始化
 function observerInit(object) {
     // 定义分数模式的观察者回调函数
     object.watcherList = {
         _list: []
     };
     // 为分数模式注册新的观察者
     object.listen = function (fn, type) {

         if(type){

             if(!object.watcherList[type]){
                 object.watcherList[type] = [fn];
             }else {
                 object.watcherList[type].push(fn);
             }
         }else {
             object.watcherList._list.push(fn);
         }

     };
     // 被观察者事件触发
     object.trigger = function (type) {

         if(type){

             if(object.watcherList[type]){
                 for(var i = 0; i < object.watcherList[type].length; i++){
                     object.watcherList[type][i].apply(object);
                 }
             }else {
                 return false;
             }

         }else {

             for(var i = 0; i < object.watcherList._list.length; i++){
                 object.watcherList._list[i].apply(object);
             }
         }
     };

     // 解绑观察者事件监听
     object.remove = function (fn, type) {

         if(type){

             var length = object.watcherList[type].length;
             for(var i = length - 1; i >= 0; i-- ){
                 if(fn === object.watcherList[type][i]){
                     object.watcherList[type].splice(i, 1);
                 }
             }
         }else {

             var length = object.watcherList._list.length;
             for(var i = length - 1; i >= 0; i-- ){
                 if(fn === object.watcherList._list[i]){
                     object.watcherList._list.splice(i, 1);
                 }
             }
         }

     };
 }

 // 02. 类式观察者实现 //
 // 事件对象
function ObserverTarget() {
  this.handlers = {};
}

ObserverTarget.prototype = {
  constructor: EventTarget,
  addHandler: function (type, handler) {
    if (this.handlers[type]) {
      this.handlers[type].push(handler);

    }else {
      this.handlers[type] = [handler];
    }
  },
  trigger: function (type) {
    if (this.handlers[type]) {
      if (this.handlers[type] instanceof Array) {
        for (var i = 0, len = this.handlers[type].length; i < len; i++) {
          this.handlers[type][i]();
        }
      }
    }
  },
  remove: function (type, handler) {
    if (this.handlers[type] && typeof(handler) !== "undefined") {
      if (this.handlers[type] instanceof Array) {
        for (var i = 0, len = this.handlers[type].length; i < len; i++) {
          if (this.handlers[type][i]  == handler) {
            break;
          }
        }
        // 移除元素
        this.handlers[type].splice(i, 1);
        if (this.handlers[type].indexOf(handler) != -1) {
          this.remove(type, handler);
        }
      }
    }else {
      this.handlers[type] = [];
    }
  }
};
