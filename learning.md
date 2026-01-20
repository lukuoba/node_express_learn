config/config.js ==>数据库连接配置
migrations ==>数据库迁移文件
models ==>数据库模型文件(对应数据库表的字段结构)
seeders ==>数据库种子文件

**日常中开发步骤**
1.建模型文件(对应数据库表的字段结构)
2.运行迁移文件(创建数据库表`sequelize db:migrate`)
3.运行种子文件(填充数据库表数据`npx sequelize db:seed:all`)
    

***新建模型***
· sequelize model:generate --name Article --attributes title:string,content:text
***运行迁移文件***
· sequelize db:migrate
***运行所有种子文件***
· npx sequelize db:seed:all
***运行单个种子文件***（20260113160433-article.js文件）
· npx sequelize db:seed --seed 20260113160433-article.js
***删除种子文件***（20260113160433-article.js文件）
· npx sequelize db:seed:undo --seed 20260113160433-article.js
***回滚种子文件***（20260113160433-article.js文件）
· npx sequelize db:seed:undo:all --seed 20260113160433-article.js

MYSQL查询语句
· SELECT * FROM articles WHERE title LIKE '%title%' ORDER BY id DESC //查询标题包含title的文章列表
· SELECT * FROM articles WHERE id = 1 //查询id为1的文章
· SELECT * FROM articles ORDER BY id DESC LIMIT 10 //查询最新的10篇文章
· SELECT * FROM articles  LIMIT 10,10 //查询第11篇到第20篇文章(第一个10表示从哪里开始，第二个表示查询多少条)

