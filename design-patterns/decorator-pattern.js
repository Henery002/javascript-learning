/*
传统面向对象语言的装饰者
*/
(function () {

  var Plane = function () {};
  Plane.prototype.fire = function () {
    console.log('发射普通子弹');
  };

  // 发射导弹装饰类
  var MissileDecorator = function (plane) {
    this.plane = plane;
  };
  MissileDecorator.prototype.fire = function () {
    this.plane.fire();
    console.log('发射导弹');
  };

  // 发射原子弹装饰类
  var AtomDecorator = function (plane) {
    this.plane = plane;
  };
  AtomDecorator.prototype.fire = function () {
    this.plane.fire();
    console.log('发射原子弹');
  };

})();

/*
JavaScript的装饰者
*/

// 直接改造原有对象
(function functionName() {

  var plane = {
    fire: function () {
      console.log('发射普通子弹');
    }
  };

  // 发射导弹
  var missileDecorator = function () {
    console.log('发射导弹');
  };

  // 发射原子弹
  var atomDecorator = function () {
    console.log('发射原子弹');
  };

  // 先保存引用，再修改引用
  var fire1 = plane.fire;
  plane.fire = function () {
    fire1();
    missileDecorator();
  };

  var fire2 = plane.fire;
  plane.fire = function () {
    fire2();
    atomDecorator();
  };

})();

// 侵入性更改原型方法
(function functionName() {

  // 函数执行前
  Function.prototype.before = function (beforeFn) {
    var _self = this;

    return function () {
      beforeFn.apply(this, arguments);
      _self.apply(this, arguments);
    };
  };

  // 函数执行后
  Function.prototype.after = function (afterFn) {
    var _self = this;

    return function () {
      _self.apply(this, arguments);
      after.apply(this, arguments);
    };
  };

  // 使用方式
  document.getElementById = document.getElementById.before(function () {
    console.log('正在执行getElementById');
  });
  var button = document.getElementById('buttonId');
})();
