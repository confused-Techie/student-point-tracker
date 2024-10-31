# Endpoint Possibilities

Obviously I'm trying to find the best possible way to manage endpoints.

The current method used here, and one similar to places like `pulsar-edit/backend`:

## Objects/Exports

* Each endpoint is a unique exported file
* Each file is ingested by `endpoints.js` which exports an array
* The endpoint array is setup by a function in `main.js`
* Each endpoint exports: `docs`, `params`, and a mix of functions to handle lifecycle or main logic

```js
module.exports = {
  docs: {
    summary: ""
  },
  endpoint: {
    method: "DELETE",
    paths: ["/api/student/:id/points"],
    rateLimit: "generic",
    successStatus: 204,
    options: {
      Allow: "GET, DELETE, POST",
      "X-Content-Type-Options": "nosniff"
    }
  },
  params: {
    id: (context, req) => { return context.query.id(req); },
    user: (context, req) => { return context.query.user(req); }
  },
  async logic(params, context) {
    const sso = new context.sso();
    return soo.isOk().addContent(false);
  }
}
```

Other possible methods:

## hapi

* A central `route` function is called providing an array of objects for each route
* Each route has several major properties, such as `method` or `path`
* Many functions are available to be setup that will handle the request and lifecycle events

```js
server.route({
  method: "GET",
  path: "/hello/{user?}",
  handler: function (request, h) {
    return `Hello ${user}!`;
  }
});
```

## fastify

* Largely the same as `hapi`

```js
fastify.route({
  method: "GET",
  url: "/",
  schema: {
    querystring: {
      name: { type: "string" },
      excitement: { type: "integer" }
    },
    response: {
      200: {
        type: "object",
        properties: {
          hello: { type: "string" }
        }
      }
    }
  },
  handler: function (request, reply) {
    reply.send({ hello: "world" })
  }
})
```

## gin (golang)

* While nothing to note super special about endpoints
* It does have a nice quality of life feature of grouping routes:

```golang
v1 := router.Group("/v1")
{
  v1.POST("/login", loginEndpoint)
  v1.POST("/submit", submitEndpoint)
}
```

Presumably this allows setting up `/v1/login` and `/v1/submit` at the same time. Which is rather nifty.

## flask

Rather boring in my opinion in this one regard

```python
@app.route("/")
def index():
  return "Index Page"
```

## play (scala)

Interestingly, within play you don't actual define routes within the code, in a `conf/routes` file you add:

```
GET /hello controllers.HomeController.hello
```


## phoenix (elixir)

Actually, quite interesting.
Their method of defining a class that gets extended, which then allows for significant configuration, plus
many features relating to an endpoint has kinda blown me away.
The approach taken here leads one to forget that many other places an endpoint is an object to be set and forgotten.

```elixir
defmodule YourAppWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :your_app

  # plug ...
  # plug ...

  plug YouApp.Router
end

YourAppWeb.Endpoint.config(:port)
YourAppWeb.Endpoint.config(:some_config, :default_value)
```

Then has different values for `compile-time configuration` or `runtime configuration`.

## New New Option?

```js
Server.get.add("/api/student");

Server.get.edit("/api/student").rateLimit("generic");
Server.get.edit("/api/student").params.
```
