/*
终极继承方法 -- 寄生组合式继承
结合了寄生式继承和构造函数继承，同时改善了 组合式继承的 父类构造函数执行两遍的缺点，是最佳的解决方案。
*/

// 通过过度函数创建实例对象的方法
function inheritObject (obj){

    // 声明干净的过度函数
    function F(){ }

    // 直接将基类的属性给过度类，没有原型链的共享
    F.prototype = obj;

    // 继承属性的过度类实例对象
    return new F();
}

// 取得父类原型和修改原型指向
function inheritPrototype (subObject, superObject){

    // 此步中重写子类原型导致了子类实例对象不是子类的实例instanceof 为false
    var o = inheritObject(superObject.prototype);
    o.constructor = subObject;
    subObject.prototype = o;
}

// 父类构造函数
function superObject(name) {

    this.name  = name;
}

// 父类共享的属性方法
superObject.prototype.getName = function(){

    return this.name;
};

function subObject(name, time){

    // 复制父类构造函数并执行this绑定
    superObject.call(this, name);
    // 扩展其它属性
    this.time = time;
}

// 共享原型链
inheritPrototype(subObject, superObject);
// 或使用Object.create
//subObject.prototype = Object.create(superObject.prototype);

// 子类的共有方法
subObject.prototype.getTime = function(){

    return this.time;
};
