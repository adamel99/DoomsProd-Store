'use strict';

const bcrypt = require("bcryptjs");
let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Licenses';

    return queryInterface.bulkInsert(options, [
      {
        id: 1,
        name: 'Basic',
        price: 29.99,
        description: 'Basic non-exclusive beat license. Includes MP3 delivery for drafts, demos, and limited non-commercial use up to 5,000 streams. Does not include WAV, stems, trackouts, ZIP delivery, radio, sync, paid advertising, Content ID registration, copyright claims, resale, redistribution, sublicensing, or transfer.',
        downloadLimit: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Premium',
        price: 49.99,
        description: 'Premium non-exclusive beat license. Includes MP3 and WAV delivery for commercial music releases up to 100,000 streams, standard monetized streaming platforms, and limited radio use. Does not include stems/trackouts unless separately provided. No Content ID registration, copyright claims, exclusive-rights claims, resale, redistribution, sublicensing, transfer, sync licensing, or paid advertising use without written approval.',
        downloadLimit: null,  // null means unlimited
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: 'Unlimited',
        price: 99.99,
        description: 'Unlimited non-exclusive beat license. Includes MP3, WAV, and ZIP delivery for commercial music releases with no stream cap and unlimited standard monetized streaming/radio use. Copyright, publishing, and master ownership in the underlying beat remain with doomsprod. No Content ID registration, copyright claims, exclusive-rights claims, resale, redistribution, sublicensing, transfer, sync licensing, or paid advertising use without written approval.',
        downloadLimit: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        name: 'Exclusive',
        price: 299.99,
        description: 'Exclusive beat license. Includes MP3, WAV, and ZIP delivery and grants exclusive commercial usage rights to the purchased beat for one buyer. The beat should be removed from future sale after purchase. Copyright, publishing, and master ownership remain with doomsprod unless transferred in a separate signed agreement. No resale, redistribution, sublicensing, transfer, or sync/paid advertising use without written approval.',
        downloadLimit: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = "Licenses";
    const Op = Sequelize.Op;

    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: [1, 2, 3, 4] },
    }, {});
  },
};
