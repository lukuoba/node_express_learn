let express = require('express');
let router = express.Router();
const { Chapter, Course, Sequelize } = require('../../models');
const { Op } = Sequelize;
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');
const { delKey } = require('../../utils/redis');

/**
 * 清除缓存
 * @param chapter
 * @returns {Promise<void>}
 */
async function clearCache(chapter) {
  await delKey(`chapters:${chapter.courseId}`);
  await delKey(`chapter:${chapter.id}`);
}
/**
 * 公共方法：关联课程数据
 * @returns {{include: [{as: string, model, attributes: string[]}], attributes: {exclude: string[]}}}
 */
function getCondition() {
  return {
    attributes: { exclude: ['CourseId'] },
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'name'],
      },
    ],
  };
}
async function getChapter(params) {
  const { id } = params;
  const condition = getCondition();
  let chapter = await Chapter.findByPk(id, condition);
  if (!chapter) {
    throw new NotFoundError(`ID:${id} 章节不存在`);
  }
  return chapter;
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    const currentPage = Math.abs(Number(req.query.currentPage), 1) || 1;
    const pageSize = Math.abs(Number(req.query.pageSize), 10) || 10;
    const offset = (currentPage - 1) * pageSize;

    const condition = {
      ...getCondition(),
      where: {},
      order: [
        ['rank', 'ASC'],
        ['id', 'ASC'],
      ],
      limit: pageSize,
      offset: offset,
    };

    condition.where.courseId = query.courseId;

    if (query.title) {
      condition.where.title = {
        [Op.like]: `%${query.title}%`,
      };
    }
    const { rows, count } = await Chapter.findAndCountAll(condition);
    success(
      res,
      {
        chapters: rows,
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
 * GET /admin/chapters/:id
 */
router.get('/:id', async function (req, res, next) {
  try {
    let chapter = await getChapter(req.params);
    success(res, { chapter }, '查询成功');
  } catch (error) {
    failure(res, error);
  }
});

/**
 * POST /admin/chapters
 */
router.post('/', async function (req, res) {
  try {
    const body = createWhiteList(req);
    // 创建章节，并增加课程章节数
    const chapter = await Chapter.create(body);
    await Course.increment('chaptersCount', { where: { id: chapter.courseId } });
    await clearCache(chapter);
    success(res, { chapter }, '创建成功');
  } catch (error) {
    failure(res, error);
  }
});

/**
 * delete /admin/chapters/:id
 */
router.delete('/:id', async function (req, res, next) {
  try {
    let chapter = await getChapter(req.params);
    await chapter.destroy();
    await Course.decrement('chaptersCount', { where: { id: chapter.courseId } });
    await clearCache(chapter);
    success(
      res,
      {
        chapter,
      },
      '删除成功',
    );
  } catch (error) {
    failure(res, error);
  }
});
/**
 * PUT /admin/chapters/:id
 */
router.put('/:id', async function (req, res, next) {
  try {
    let chapter = await getChapter(req.params);
    const body = createWhiteList(req);
    await chapter.update(body);
    await clearCache(chapter);
    success(
      res,
      {
        chapter,
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
    title: req.body.title || '',
    content: req.body.content || '',
  };
}

module.exports = router;
