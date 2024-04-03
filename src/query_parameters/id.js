module.exports = {
  schema: {},
  query: (req) => {
    return req.params.id;
  },
};
