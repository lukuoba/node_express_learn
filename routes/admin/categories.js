let express = require('express');
let router = express.Router();
const { Category, Sequelize } = require('../../models');
const { Op } = Sequelize;
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');
const { delKey } = require('../../utils/redis');

/**
 * 清除缓存
 * @param category
 * @returns {Promise<void>}
 */
async function clearCache(category = null) {
  await delKey('categories');

  if (category) {
    await delKey(`category:${category.id}`);
  }
}

async function getCategories(params) {
  const { id } = params;
  let category = await Category.findByPk(id);
  if (!category) {
    throw new NotFoundError(`ID:${id} 分类不存在`);
  }
  return category;
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    const condition = {
      where: {},
      order: [
        ['rank', 'ASC'],
        ['id', 'ASC'],
      ],
    };
    if (query.name) {
      condition.where.name = {
        [Op.like]: `%${query.name}%`,
      };
    }
    const { rows } = await Category.findAndCountAll(condition);
    success(
      res,
      {
        categories: rows,
      },
      '查询成功',
    );
  } catch (error) {
    failure(res, error);
  }
});

/**
 * GET /admin/categories/:id
 */
router.get('/:id', async function (req, res, next) {
  try {
    let category = await getCategories(req.params);
    success(res, { category }, '查询成功');
  } catch (error) {
    failure(res, error);
  }
});

/**
 * POST /admin/categories
 */
router.post('/', async function (req, res) {
  try {
    const body = createWhiteList(req);
    let category = await Category.create(body);
    await clearCache(category);
    success(res, { category }, '创建成功');
  } catch (error) {
    failure(res, error);
  }
});

/**
 * delete /admin/categories/:id
 */
router.delete('/:id', async function (req, res, next) {
  try {
    let category = await getCategories(req.params);
    await category.destroy();
    await clearCache(category);
    success(
      res,
      {
        category,
      },
      '删除成功',
    );
  } catch (error) {
    failure(res, error);
  }
});
/**
 * PUT /admin/categories/:id
 */
router.put('/:id', async function (req, res, next) {
  try {
    let category = await getCategories(req.params);
    const body = createWhiteList(req);
    await category.update(body);
    await clearCache(category);
    success(
      res,
      {
        category,
      },
      '更新成功',
    );
  } catch (error) {
    failure(res, error);
  }
});

/*
 *创建白名单
 * post请求和put请求永远不要相信前端的数据
 **/
function createWhiteList(req) {
  return {
    name: req.body.name || '',
    rank: req.body.rank || 0,
  };
}

module.exports = router;
