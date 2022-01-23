'use strict';

/**
 * bug service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::bug.bug');
