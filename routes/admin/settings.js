let express = require('express');
let router = express.Router();
const { Setting, Sequelize } = require('../../models');
const { Op } = Sequelize;
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');

/**
 * 公共方法：查询当前系统设置
 */
async function getSetting() {
  const setting = await Setting.findOne();
  if (!setting) {
    throw new NotFoundError('初始系统设置未找到，请运行种子文件。');
  }

  return setting;
}

/**
 * GET /admin/setting/:id
 */
router.get('/', async function (req, res, next) {
  try {
    const setting = await getSetting();
    success(res, { setting }, '查询成功');
  } catch (error) {
    failure(res, error);
  }
});

/**
 * PUT /admin/setting/:id
 */
router.put('/', async function (req, res, next) {
  try {
    const setting = await getSetting();
    const body = filterBody(req);
    await setting.update(body);

    success(
      res,
      {
        setting,
      },
      '更新成功',
    );
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{copyright: (string|*), icp: (string|string|DocumentFragment|*), name}}
 */
function filterBody(req) {
  return {
    name: req.body.name,
    icp: req.body.icp,
    copyright: req.body.copyright,
  };
}

module.exports = router;
