'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('Articles', [{
     *   title: 'Article 1',
     *   content: 'Content 1'
     * }], {});
    */
    const articles =[];
    const counts = 100;
    for(let i=0;i<counts;i++){
      articles.push({
        title: `文章标题 ${i+1}`,
        content: `文章内容 ${i+1}`,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
    await queryInterface.bulkInsert('Articles', articles, {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Articles', null, {});
  }
  
};
