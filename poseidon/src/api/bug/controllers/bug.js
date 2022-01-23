'use strict';

/**
 *  bug controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::bug.bug');
