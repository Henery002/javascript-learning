/* -----------------------------------------------------------------------------
  使用es5 手动实现Promise:
  Promise 对象是一个代理对象（代理一个值），被代理的值在Promise对象创建时可能是未知的。
  它允许你为异步操作的成功和失败分别绑定相应的处理方法（handlers）。 这让异步方法可以像
  同步方法那样返回值，但并不是立即返回最终执行结果，而是一个能代表未来出现的结果的promise对象

  一个 Promise有以下几种状态:
  pending: 初始状态，不是成功或失败状态。
  fulfilled: 意味着操作成功完成。
  rejected: 意味着操作失败。

  pending 状态的 Promise 对象可能触发fulfilled 状态并传递一个值给相应的状态处理方法，
  也可能触发失败状态（rejected）并传递失败信息。当其中任一种情况出现时，Promise 对象的
  then 方法绑定的处理方法（handlers ）就会被调用（then方法包含两个参数：onfulfilled
  和 onrejected，它们都是 Function 类型。当Promise状态为fulfilled时，调用 then 的
  onfulfilled 方法，当Promise状态为rejected时，调用 then 的 onrejected 方法，
  所以在异步操作的完成和绑定处理方法之间不存在竞争）。
----------------------------------------------------------------------------- */

/**
 * 状态传递 - promise之间可以逐级传递状态
 * 调用句柄 - 每个想关联的promise之间存在 上级可以调用下一级的关系
 * 单一状态 - 每个promise对象的状态改变都是单向固定的
 */

/* ************************* Promise构造函数 ************************* */
function Promise(callback, name) {
  var self = this;
  this.name = name;
  var thisValue = 'pending';  // 临时变量
  this.status = 'pending';
  this.nextHandle = null;
  this.process = callback ? callback: null;  // 正在处理的方法
  this.handle = {
    success: null,  // 成功的处理函数
    error: null  // 失败的处理函数
  };

  Object.defineProperty(this, 'status', {  // 自定义对象属性
    enumerable: true,
    configurable: true,
    get: function () {
      return thisValue;
    },
    set: function (status) {
        if (thisValue !== 'pending') return;

        thisValue = status;
        if (this.handle[status]) {
          this.handle[status]();
          this.nextHandle.setStatus(status);
        }
    }
  });

  // 在下一个事件循环执行
  setTimeout(function () {
    // 开始执行
    this.process && this.process(
      function (info) {
        this.status = 'success';
      }.bind(this),

      function (info) {
        this.status = 'error';
      }.bind(this)
    );

  }.bind(this), 0)

}

/* ------------------- 静态方法 ------------------- */

Promise.all = function () {

};

Promise.race = function () {

};

Promise.resolve = function () {

};

Promise.reject = function () {

};

/* ------------------- 对象继承的方法 ------------------- */

// 设置状态
Promise.prototype.setStatus = function (status) {
  this.status = status;
};

/**
 * [then 应该返回一个全新的Promise对象，不应该与当前Promise存在功能耦合]
 * @param  {[type]} successFn [description]
 * @param  {[type]} errorFn   [description]
 */
Promise.prototype.then = function (successFn, errorFn, name) {
  this.handle['success'] = successFn;
  this.handle['error'] = errorFn;

  var newPromise = new Promise(function (resolve, reject) {

  }, function () {

  }, name);

  this.nextHandle = newPromise;
  return newPromise;
};

Promise.prototype.catch = function (error) {

};


/* ************************* 测试main ************************* */
var promise1 = new Promise(function (resolve, reject) {
  setTimeout(function () {
    console.log('promise1');
  }, 2000);
}, 'promise1');


var promise2 = promise1.then(function (success) {
  setTimeout(() => {
    console.log('test new promise');
  }, 1000);

}, function () {

}, 'promise2');


var promise3 = promise2.then(function (test) {

  console.log('p3');
}, function (error) {

  console.log('error');

}, 'promise3');

var promise4 = promise3.then(function (info) {
console.log('p4');

}, function () {

}, 'promise4')
