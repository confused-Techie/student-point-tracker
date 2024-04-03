module.exports = {
  schema: {},
  query: (req) => {
    const prov = req.user;

    if (typeof prov !== "object") {
      return {};
    }

    return prov;
  },
};
