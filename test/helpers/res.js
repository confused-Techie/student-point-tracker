
module.exports =
class Res {
  constructor() {
    this.headers = {};
    this.status = 0;
    this.content = null;
  }

  status(statusCode) {
    this.status = statusCode;
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
}
