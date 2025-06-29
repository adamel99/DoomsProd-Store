'use strict';

const bcrypt = require("bcryptjs");
let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = "Products";

    return queryInterface.bulkInsert(options, [
      {
        id: 1,
        userId: 1,
        title: 'Rylo Rodriguez x NoCap Type Beat ~ "Breath"',
        description: 'Emotional Sample Rylo Rodriguez x NoCap Type Beat',
        type: 'beat',
        youtubeLink: 'https://youtu.be/OZXyymz8psk',
        audioPreviewUrl: 'https://youtu.be/OZXyymz8psk',
        price: null, // beats have no fixed price here
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: 'https://doomsstoreimguploads.s3.us-east-2.amazonaws.com/products/1751052996784-artworks-KsVUwjGWb3HieLAD-6vW8bA-t500x500.jpg',
      },
      {
        id: 2,
        userId: 1,
        title: 'Rylo Rodriguez x NoCap Type Beat ~ "Time"',
        description: 'Emotional Sample Rylo Rodriguez x NoCap Type Beat',
        type: 'beat',
        youtubeLink: 'https://youtu.be/YA-GG5AWVTs',
        audioPreviewUrl: 'https://youtu.be/YA-GG5AWVTs',
        price: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl:'https://doomsstoreimguploads.s3.us-east-2.amazonaws.com/products/1751136160606-e6910571f74131164b7261ff02e2d7a3.jpg',
      },
      {
        id: 3,
        userId: 1,
        title: 'Rylo Rodriguez x NoCap Type Beat ~ "Hit My Line"',
        description: 'Emotional Sample Rylo Rodriguez x NoCap Type Beat',
        type: 'beat',
        youtubeLink: 'https://youtu.be/Wf2L588rRtQ',
        audioPreviewUrl: 'https://youtu.be/Wf2L588rRtQ',
        price: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: 'https://doomsstoreimguploads.s3.us-east-2.amazonaws.com/products/1751136160606-e6910571f74131164b7261ff02e2d7a3.jpg'
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = "Products";
    const Op = Sequelize.Op;

    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: [1, 2, 3] },
    }, {});
  },
};
