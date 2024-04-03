module.exports = {
  schema: {},
  query: (req) => {
    const def = 1;
    const prov = req.query.page;

    switch (typeof prov) {
      case "string": {
        const n = parseInt(prov, 10);
        return isNaN(prov) ? def : n;
      }
      case "number":
        return isNaN(prov) ? def : prov;
      default:
        return def;
    }
  },
};
