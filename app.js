const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const logger = require('morgan');

require('dotenv').config();
const adminAuth = require('./middlewares/admin-auth');
const userAuth = require('./middlewares/user-auth');
const indexRouter = require('./routes/index');

const app = express();
const adminRouter = require('./routes/admin/articles');
const categoriesRouter = require('./routes/admin/categories');
const settingsRouter = require('./routes/admin/settings');
const usersRouter = require('./routes/admin/users');
const coursesRouter = require('./routes/admin/courses');
const chaptersRouter = require('./routes/admin/chapters');
const adminChartsRouter = require('./routes/admin/charts');
const authRouter = require('./routes/admin/auth');
const getCategories = require('./routes/categories');
const getCourses = require('./routes/courses');
const getChapters = require('./routes/chapters');
const articlesRouter = require('./routes/articles');
const getSettings = require('./routes/settings');
const searchRouter = require('./routes/search');
const authWebRouter = require('./routes/auth');
const usersAuthRouter = require('./routes/users');
const likesRouter = require('./routes/likes');

app.use(cors());
app.use('/', indexRouter);

// CORS 跨域配置
// const corsOptions = {
//   origin: [
//     'https://clwy.cn',
//     'http://localhost:63342'
//   ],
// }
// app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/', indexRouter);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin/articles', adminAuth, adminRouter);
app.use('/admin/categories', adminAuth, categoriesRouter);
app.use('/admin/settings', adminAuth, settingsRouter);
app.use('/admin/users', adminAuth, usersRouter);
app.use('/admin/courses', adminAuth, coursesRouter);
app.use('/admin/chapters', adminAuth, chaptersRouter);
app.use('/admin/charts', adminAuth, adminChartsRouter);
app.use('/admin/auth', authRouter);
app.use('/categories', getCategories);
app.use('/courses', getCourses);
app.use('/chapters', getChapters);
app.use('/articles', articlesRouter);
app.use('/settings', getSettings);
app.use('/search', searchRouter);
app.use('/auth', authWebRouter);
app.use('/users', userAuth, usersAuthRouter);
app.use('/likes', userAuth, likesRouter);

module.exports = app;
