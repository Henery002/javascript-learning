/* -----------------------------------------------------------------------------
  自定义Promise需要引入
----------------------------------------------------------------------------- */


/* ------------------- 功能测试 ------------------- */
var promise1 = new Promise(function (resolve, reject) {
  setTimeout(function () {
    console.log('promise1 -> pending');
    resolve('promise1 -> resolved');
    // reject('promise1 -> rejected');
  }, 1000);
});

promise1.then(function (value) {
  console.log(value);
}, function (reason) {
  console.log(reason);
});

promise1.then(function (value) {

  var promise = new Promise(function (resolve, reject) {
    console.log('promise1 then new promise');
    setTimeout(function () {
      resolve('promise1 then new promise resolve');
    }, 1000)
  });

  promise.then(function (value) {
    console.log(value);
  })

  return promise;

}).then(function (value) {
  return new Promise(function (resolve, reject) {

  });
});


/* ------------------- 错误处理测试 ------------------- */
var promise2 = new Promise(function (resolve, reject) {
  // throw new Error('promise2 error test.');
  resolve(true);
});

promise2.then(function (value) {
  throw new Error('test');
}, function (reason) {
  console.log('promise2 then error: ', reason);
}).catch(function (error) {
  console.log('promise2 then throw error: ', error);
});

promise2.catch(function (error) {
  console.log('promise2 catch error: ', error);
});


/* ------------------- all函数测试 ------------------- */
Promise.all([

  new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(true);
    }, 1000);
  }),

  new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(false);
    }, 2000);
  }),

  new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(true);
    }, 2000);
  }),

]).then(function (value) {
  console.log('all - value: ', value);
}, function (reason) {
  console.log('all - reason: ', reason);
});


/* ------------------- race函数测试 ------------------- */
Promise.race(
  [
    new Promise(function (resolve, reject) {
      setTimeout(function () {
        resolve('p1');
      }, 3000);
    }),

    new Promise(function (resolve, reject) {
      setTimeout(function () {
        resolve('p2');
      }, 3000);
    }),

    new Promise(function (resolve, reject) {
      setTimeout(function () {
        resolve('p3');
      }, 3000);
    }),
  ]
).then(function (value) {
  console.log('race - value : ', value);
}, function (reason) {
  console.log('race - reason : ', reason);
})


/* ------------------- resolve/reject静态方法测试 ------------------- */
Promise.resolve('resolve').then(function (value) {
  console.log('Promise resolve: ', value);
}, function (reason) {
  console.log('Promise reject: ', reason);
});

Promise.reject('reject').then(function (value) {
  console.log('Promise resolve: ', value);
}, function (reason) {
  console.log('Promise reject: ', reason);
})
