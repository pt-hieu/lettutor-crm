module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '0680f70ffe8b4671ee8be38b2069670f'),
  },
});
