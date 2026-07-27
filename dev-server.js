const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const airHandler = require("./api/air.js");

const root = __dirname;
const port = Number(process.env.PORT || 3000);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function createVercelLikeResponse(response) {
  return {
    setHeader: (name, value) => response.setHeader(name, value),
    status(statusCode) {
      response.statusCode = statusCode;
      return this;
    },
    json(payload) {
      sendJson(response, response.statusCode || 200, payload);
    },
  };
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://localhost:${port}`);

  if (url.pathname === "/api/air") {
    airHandler(request, createVercelLikeResponse(response));
    return;
  }

  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(root, requestedPath));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
    });
    response.end(content);
  });
});

server.listen(port, () => {
  console.log(`Local server running at http://localhost:${port}`);
});
