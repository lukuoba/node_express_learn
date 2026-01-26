let express = require('express');
let router = express.Router();
const { User, Sequelize } = require('../../models');
const { Op } = Sequelize;
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');

async function getUser(params) {
  const { id } = params;
  let user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError(`ID:${id} 用户不存在`);
  }
  return user;
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    const { query } = req;
    const currentPage = Math.abs(Number(req.query.currentPage), 1) || 1;
    const pageSize = Math.abs(Number(req.query.pageSize), 10) || 10;
    const offset = (currentPage - 1) * pageSize;

    const condition = {
      where: {},
      order: [['id', 'DESC']],
      limit: pageSize,
      offset: offset,
    };

    if (query.email) {
      condition.where.email = query.email;
    }

    if (query.username) {
      condition.where.username = query.username;
    }

    if (query.nickname) {
      condition.where.nickname = {
        [Op.like]: `%${query.nickname}%`,
      };
    }

    if (query.role) {
      condition.where.role = query.role;
    }

    const { rows, count } = await User.findAndCountAll(condition);
    success(
      res,
      {
        users: rows,
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
 * GET /admin/users/:id
 */
router.get('/:id', async function (req, res, next) {
  try {
    let user = await getUser(req.params);
    success(res, { user }, '查询成功');
  } catch (error) {
    failure(res, error);
  }
});

/**
 * POST /admin/users
 */
router.post('/', async function (req, res) {
  try {
    const body = filterBody(req);
    let user = await User.create(body);
    success(res, { user }, '创建成功');
  } catch (error) {
    failure(res, error);
  }
});

/**
 * delete /admin/users/:id
 */
router.delete('/:id', async function (req, res, next) {
  try {
    let user = await getUser(req.params);
    await user.destroy();

    success(
      res,
      {
        user,
      },
      '删除成功',
    );
  } catch (error) {
    failure(res, error);
  }
});
/**
 * PUT /admin/users/:id
 */
router.put('/:id', async function (req, res, next) {
  try {
    let user = await getUser(req.params);
    const body = filterBody(req);
    await user.update(body);

    success(
      res,
      {
        user,
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
function filterBody(req) {
  console.log('更新时', req);
  return {
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    nickname: req.body.nickname,
    sex: req.body.sex,
    company: req.body.company,
    introduce: req.body.introduce,
    role: req.body.role,
    avatar: req.body.avatar,
  };
}
module.exports = router;
