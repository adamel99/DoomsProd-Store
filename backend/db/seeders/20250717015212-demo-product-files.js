'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'ProductFiles';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(options, [
      {
        productId: 1,
        fileUrl: 'https://your-s3-url.com/beat1.wav',
        fileType: 'wav',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        productId: 1,
        fileUrl: 'https://your-s3-url.com/beat1.zip',
        fileType: 'zip',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        productId: 2,
        fileUrl: 'https://your-s3-url.com/beat2.wav',
        fileType: 'wav',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        productId: 3,
        fileUrl: 'https://your-s3-url.com/beat3.mp3',
        fileType: 'mp3',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete(options, null, {});
  },
};
