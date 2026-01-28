const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const { success, failure } = require('../utils/responses');
const { setKey, getKey } = require('../utils/redis');

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

/**
 * 查询分类列表
 * GET /categories
 */
router.get('/', async function (req, res, next) {
  try {
    let categories = await getKey('categories');
    if (!categories) {
      categories = await Category.findAll({
        order: [
          ['rank', 'ASC'],
          ['id', 'DESC'],
        ],
      });
      await setKey('categories', categories);
    }

    success(res, '查询分类成功。', { categories });
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;
