module.exports = {
  schema: {},
  query: (req) => {
    const def = 0;
    const prov = req.query.points;

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
