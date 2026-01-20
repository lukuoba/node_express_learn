// /**
//  * 自定义 404 错误
//  */
// class NotFoundError extends Error {
//   constructor(message) {
//     super(message);
//     this.name = 'NotFoundError';
//     this.status = 404;
//   }
// }

/**
 * 请求成功
 */
function success(res, data = {}, message = '请求成功', code = 200) {
  return res.status(code).json({
    code,
    status: 'success',
    data,
    message,
  });
}

/**
 * 自定义 400 404 500 错误
 */
function failure(res, error) {
  console.log(error);
  if (error.name === 'BadRequestError') {
    return res.status(400).json({
      status: false,
      message: '请求参数错误',
      errors: [error.message],
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      status: false,
      message: '认证失败',
      errors: [error.message],
    });
  }
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: false,
      message: '认证失败',
      errors: ['您提交的 token 错误。'],
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: false,
      message: '认证失败',
      errors: ['您的 token 已过期。'],
    });
  }
  if (error.name === 'SequelizeValidationError') {
    const errors = error.errors.map((item) => item.message);
    return res.status(400).json({
      code: 400,
      status: 'error',
      message: '请求参数错误',
      errors,
    });
  } else if (error.name === 'NotFoundError') {
    return res.status(404).json({
      code: 404,
      status: 'error',
      message: '资源不存在',
      error: [error.message],
    });
  } else {
    return res.status(500).json({
      code: 500,
      status: 'error',
      message: '服务器错误',
      error: [error.message],
    });
  }
}

module.exports = {
  // NotFoundError,
  success,
  failure,
};
