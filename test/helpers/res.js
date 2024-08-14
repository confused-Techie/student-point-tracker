module.exports = class Res {
  constructor() {
    this.headers = {};
    this.statusCode = 0;
    this.content = null;
  }

  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  }

  set(headerName, headerValue) {
    this.headers[headerName] = headerValue;
    return this;
  }

  send(content) {
    this.content = content;
    return content;
  }
};
