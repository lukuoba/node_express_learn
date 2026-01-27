let express = require('express');
let router = express.Router();
const { Article, Sequelize } = require('../../models');
const { Op } = Sequelize;
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');

async function getArticle(params) {
  const { id } = params;
  let article = await Article.findByPk(id);
  if (!article) {
    throw new NotFoundError(`ID:${id} 文章不存在`);
  }
  return article;
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    // const { title } = req.query;
    const currentPage = Math.abs(Number(req.query.currentPage), 1) || 1;
    const pageSize = Math.abs(Number(req.query.pageSize), 10) || 10;
    const offset = (currentPage - 1) * pageSize;
    const condition = {
      where: {},
      order: [['id', 'DESC']],
      limit: pageSize,
      offset: offset,
    };
    // 查询被软删除的数据
    if (req.query.deleted === 'true') {
      condition.paranoid = false;
      condition.where.deletedAt = {
        [Op.not]: null,
      };
    }
    if (req.query.title) {
      condition.where.title = {
        [Op.like]: `%${query.title}%`,
      };
    }

    const { rows, count } = await Article.findAndCountAll(condition);
    success(
      res,
      {
        articles: rows,
        pagination: {
          total: count,
          currentPage,
          pageSize,
        },
      },
      '查询成功',
    );
  } catch (error) {
    failure(res, error);
  }
});

/**
 * GET /admin/articles/:id
 */
router.get('/:id', async function (req, res, next) {
  try {
    let article = await getArticle(req.params);
    success(res, { article }, '查询成功');
  } catch (error) {
    failure(res, error);
  }
});

/**
 * POST /admin/articles
 */
router.post('/', async function (req, res) {
  try {
    const body = createWhiteList(req);
    let article = await Article.create(body);
    success(res, { article }, '创建成功');
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 删除到回收站
 * POST /admin/articles/delete
 */
router.post('/delete', async function (req, res) {
  try {
    const { id } = req.body;
    await Article.destroy({ where: { id: id } });
    success(res, '已删除到回收站。');
  } catch (error) {
    failure(res, error);
  }
});

/**
 * PUT /admin/articles/:id
 */
router.put('/:id', async function (req, res, next) {
  try {
    let article = await getArticle(req.params);
    const body = createWhiteList(req);
    await article.update(body);

    success(
      res,
      {
        article,
      },
      '更新成功',
    );
  } catch (error) {
    failure(res, error);
  }
});
/**
 * 从回收站恢复
 * POST /admin/articles/restore
 */
router.post('/restore', async function (req, res) {
  try {
    const { id } = req.body;

    await Article.restore({ where: { id: id } });
    success(res, '已恢复成功。');
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
    title: req.body.title || '',
    content: req.body.content || '',
  };
}

module.exports = router;
