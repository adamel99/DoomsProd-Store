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
        userId: 1,
        title: 'Rylo Rodriguez x NoCap Type Beat ~ "Breath"',
        description: 'Emotional Sample Rylo Rodriguez x NoCap Type Beat',
        type: 'beat',
        youtubeLink: 'https://youtu.be/OZXyymz8psk',
        audioPreviewUrl: 'https://youtu.be/OZXyymz8psk',
        genre: 'Trap',
        bpm: 142,
        key: 'C minor',
        artistTags: 'Rylo Rodriguez, NoCap, emotional trap',
        price: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: 'https://doomsstoreimguploads.s3.us-east-2.amazonaws.com/products/1751052996784-artworks-KsVUwjGWb3HieLAD-6vW8bA-t500x500.jpg',
        downloadUrls: JSON.stringify({
          zip: 'https://your-s3-bucket.s3.amazonaws.com/breath-pack.zip',
          mp3: 'https://your-s3-bucket.s3.amazonaws.com/breath-pack.mp3',
          wav: 'https://your-s3-bucket.s3.amazonaws.com/breath-pack.wav',
        }),
      },
      {
        userId: 1,
        title: 'Rylo Rodriguez x NoCap Type Beat ~ "Time"',
        description: 'Emotional Sample Rylo Rodriguez x NoCap Type Beat',
        type: 'beat',
        youtubeLink: 'https://youtu.be/YA-GG5AWVTs',
        audioPreviewUrl: 'https://youtu.be/YA-GG5AWVTs',
        genre: 'Trap',
        bpm: 136,
        key: 'A minor',
        artistTags: 'Rylo Rodriguez, NoCap, melodic trap',
        price: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: 'https://doomsstoreimguploads.s3.us-east-2.amazonaws.com/products/1751136160606-e6910571f74131164b7261ff02e2d7a3.jpg',
        downloadUrls: JSON.stringify({
          zip: 'https://your-s3-bucket.s3.amazonaws.com/time-pack.zip',
          mp3: 'https://your-s3-bucket.s3.amazonaws.com/time-pack.mp3',
          wav: 'https://your-s3-bucket.s3.amazonaws.com/time-pack.wav',
        }),
      },
      {
        userId: 1,
        title: 'Rylo Rodriguez x NoCap Type Beat ~ "Hit My Line"',
        description: 'Emotional Sample Rylo Rodriguez x NoCap Type Beat',
        type: 'beat',
        youtubeLink: 'https://youtu.be/Wf2L588rRtQ',
        audioPreviewUrl: 'https://youtu.be/Wf2L588rRtQ',
        genre: 'Trap',
        bpm: 144,
        key: 'D minor',
        artistTags: 'Rylo Rodriguez, NoCap, pain music',
        price: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: 'https://doomsstoreimguploads.s3.us-east-2.amazonaws.com/products/1751136160606-e6910571f74131164b7261ff02e2d7a3.jpg',
        downloadUrls: JSON.stringify({
          zip: 'https://your-s3-bucket.s3.amazonaws.com/hitmyline-pack.zip',
          mp3: 'https://your-s3-bucket.s3.amazonaws.com/hitmyline-pack.mp3',
          wav: 'https://your-s3-bucket.s3.amazonaws.com/hitmyline-pack.wav',
        }),
      },
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    options.tableName = "Products";
    return queryInterface.bulkDelete(options, null, {});
  },
};
