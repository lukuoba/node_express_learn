let express = require('express');
let router = express.Router();
const { Course, Sequelize, Category, User, Chapter } = require('../../models');
const { Op } = Sequelize;
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');

/**
 * 公共方法：关联分类、用户数据
 * @returns {{include: [{as: string, model, attributes: string[]}], attributes: {exclude: string[]}}}
 */
function getCondition() {
  return {
    attributes: { exclude: ['CategoryId', 'UserId'] },
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar'],
      },
    ],
  };
}

/**
 * 公共方法：查询当前课程
 */
async function getCourse(req) {
  console.log('reqreqreq', req.params);
  const { id } = req.params;
  console.log('ididid', id);
  const condition = getCondition();

  const course = await Course.findByPk(id, condition);
  if (!course) {
    throw new NotFoundError(`ID: ${id}的课程未找到。`);
  }

  return course;
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    const { name } = req.query;
    const currentPage = Math.abs(Number(req.query.currentPage), 1) || 1;
    const pageSize = Math.abs(Number(req.query.pageSize), 10) || 10;
    const offset = (currentPage - 1) * pageSize;
    const condition = {
      ...getCondition(),
      order: [['id', 'DESC']],
      limit: pageSize,
      offset: offset,
    };

    if (name) {
      condition.where = {
        name: {
          [Op.like]: `%${name}%`,
        },
      };
    }
    const { rows, count } = await Course.findAndCountAll(condition);
    success(
      res,
      {
        courses: rows,
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
 * GET /admin/courses/:id
 */
router.get('/:id', async function (req, res, next) {
  try {
    let course = await getCourse(req);
    success(res, { course }, '查询成功');
  } catch (error) {
    failure(res, error);
  }
});

/**
 * POST /admin/courses
 */
router.post('/', async function (req, res) {
  try {
    const body = createWhiteList(req);
    let course = await Course.create(body);
    success(res, { course }, '创建成功');
  } catch (error) {
    failure(res, error);
  }
});

/**
 * delete /admin/courses/:id
 */
router.delete('/:id', async function (req, res, next) {
  try {
    let course = await getCourse(req);
    const count = await Chapter.count({ where: { courseId: req.params.id } });
    if (count > 0) {
      throw new Error('当前课程有章节，无法删除。');
    }
    await course.destroy();
    success(
      res,
      {
        course,
      },
      '删除成功',
    );
  } catch (error) {
    failure(res, error);
  }
});
/**
 * PUT /admin/courses/:id
 */
router.put('/:id', async function (req, res, next) {
  try {
    let course = await getCourse(req.params);
    const body = createWhiteList(req);
    await course.update(body);

    success(
      res,
      {
        course,
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
 * @returns {{rank: (number|*), video: (string|boolean|MediaTrackConstraints|VideoConfiguration|*), title, courseId: (number|*), content}}
 */
function createWhiteList(req) {
  return {
    courseId: req.body.courseId,
    title: req.body.title,
    content: req.body.content,
    video: req.body.video,
    rank: req.body.rank,
  };
}

module.exports = router;
