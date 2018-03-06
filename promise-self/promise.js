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

  Promise.all(iterable)
    这个方法返回一个新的promise对象，该promise对象在iterable参数对象里所有的promise对象
    都成功的时候才会触发成功，一旦有任何一个iterable里面的promise对象失败则立即触发该promise
    对象的失败。这个新的promise对象在触发成功状态以后，会把一个包含iterable里所有promise返回值
    的数组作为成功回调的返回值，顺序跟iterable的顺序保持一致；如果这个新的promise对象触发了失败
    状态，它会把iterable里第一个触发失败的promise对象的错误信息作为它的失败错误信息。
    Promise.all方法常被用于处理多个promise对象的状态集合。

  Promise.race(iterable)
    当iterable参数里的任意一个子promise被成功或失败后，父promise马上也会用子promise的成功返回
    值或失败详情作为参数调用父promise绑定的相应句柄，并返回该promise对象。
  Promise.reject(reason)
    返回一个状态为失败的Promise对象，并将给定的失败信息传递给对应的处理方法
  Promise.resolve(value)
    返回一个状态由给定value决定的Promise对象。如果该值是一个Promise对象，则直接返回该对象；
    如果该值是thenable(即，带有then方法的对象)，返回的Promise对象的最终状态由then方法执行决定；
    否则的话(该value为空，基本类型或者不带then方法的对象),返回的Promise对象状态为fulfilled，
    并且将该value传递给对应的then方法。通常而言，如果你不知道一个值是否是Promise对象，
    使用Promise.resolve(value) 来返回一个Promise对象,这样就能将该value以Promise对象形式使用。
----------------------------------------------------------------------------- */


/* ************************* Promise构造函数 ************************* */
function Promise(processor) {
  var self = this;
  self.status = 'pending';  // status
  self.value = null;  // resolve value
  self.reason = null;  // reject reason
  self.onRejectedCallbacks = [];  // reject callback
  self.onFulfilledCallbacks = [];  // resolve callback

  // resolve
  function resolve(value) {
    if (self.status === 'pending') {
      self.status = 'fulfilled';
      self.value = value;
      self.onFulfilledCallbacks.map(function (callback) {
        callback();
      });
    }
  }

  // reject
  function reject(reason) {
    if (self.status === 'pending') {
      self.status = 'rejected';
      self.reason = reason;
      self.onRejectedCallbacks.map(function (callback) {
        callback(reason);
      });
    }
  }

  // 延迟到下一次事件循环
  try {
    processor(resolve, reject);
  } catch (e) {
    setTimeout(function () {
      reject(e);
    });
  }
}

/* ------------------- 分析promise.then中返回的值类型 promise/value ------------------- */

// 注意父子promise状态是怎样控制的，父promise需要将控制权(resovle, reject)转发给子promise
var analysisPromise = function (x, resolve, reject) {

  var then, y;

  // 可能为promise
  if (x !== undefined && (typeof x === 'object' || typeof x === 'function')) {
    then = x.then;

    // 为promise
    if (then && typeof then === 'function') {

      then.call(x, function (value) {
        analysisPromise(value, resolve, reject);

      }, function (error) {
        reject(error);
      });

    // 为普通值
    }else {
      resolve(x);
    }

  // 普通值
  }else {
    resolve(x);
  }
};


/* ------------------- then-返回新的promise ------------------- */


/**
 * [then 应该返回一个全新的Promise对象，不应该与当前Promise存在功能耦合]
 * @param  {[type]} successFn [description]
 * @param  {[type]} errorFn   [description]
 */
Promise.prototype.then = function (successCallback, errorCallback) {

  var promise, x;
  var self = this;

  // 判断当前promise状态
  if (self.status === 'fulfilled') {
    promise = new Promise(function (reject, resolve) {
      x = successCallback(self.value);
      // 分析返回值 然后更改 当前promise状态
      analysisPromise(x, resolve, reject);
    });
  }

  if (self.status === 'rejected') {
    promise = new Promise(function (reject, resolve) {
      x = errorCallback(self.reason);
      // 分析返回值 然后更改 当前promise状态
      analysisPromise(x, resolve, reject);
    });
  }

  if (self.status === 'pending') {
    promise = new Promise(function (reject, resolve) {
      self.onFulfilledCallbacks.push(function () {
        x = successCallback(self.value);
        // 分析返回值 然后更改 当前promise状态
        analysisPromise(x, resolve, reject);
      });

      self.onRejectedCallbacks.push(function () {
          x = errorCallback ? errorCallback(self.reason) : undefined;
        // 分析返回值 然后更改 当前promise状态
        analysisPromise(x, resolve, reject);
      });
    });

  }

  return promise;
};


/* ------------------- 错误捕获 ------------------- */
Promise.prototype.catch = function (handleError) {
  if (this.status === 'pending') {
    this.onRejectedCallbacks.push(handleError);
  }else {
    this.reason && handleError(this.reason);
  }
};


/* ------------------- all-所有promise成功后即成功,一个失败即失败 ------------------- */

Promise.all = function (pArray) {
  var rArray = [];
  var promise = new Promise(function (resolve, reject) {

    pArray.forEach(function (pr, i) {

        if (pr instanceof Promise) {
          pr.then(function (value1) {
            analysisPromise(value1, function (value2) {
              rArray[i] = value2;
              if (rArray.length === pArray.length) {
                resolve(rArray);
              }
            }, reject);

          }, function (error) {
            reject(error);
          });

        }else {
          rArray[i] = pr;
          if (rArray.length === pArray.length) {
            resolve(rArray);
          }
        }

    });

  });

  return promise;
};

/* ------------------- race - 最终状态取决于第一个完成的promise状态 ------------------- */
Promise.race = function (pArray) {
  var rArray = [];
  var promise = new Promise(function (resolve, reject) {

    pArray.forEach(function (pr, i) {

        if (pr instanceof Promise) {
          pr.then(function (value) {
            analysisPromise(value, resolve, reject);
          }, function (error) {
            reject(error);
          });
        }else {
          rArray[i] = pr;
        }

    });

  });

  return promise;
};

/* ------------------- 返回成功态的promise ------------------- */
Promise.resolve = function (value) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(value);
    })
  });
};

/* ------------------- 返回失败态的promise ------------------- */
Promise.reject = function (reason) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(reason);
    })
  });
};















/* ************************* 测试main ************************* */

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
