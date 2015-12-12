/* eslint-env node */
/* eslint no-underscore-dangle: 0 */

var Uuid = require('uuid');

var callback;
var captureRequestBody;
var captureResponseBody;

// Constructor
function formatRequests(options) {
  callback = options.callback || function empty() {};
  captureRequestBody = options.captureRequestBody || true;
  captureResponseBody = options.captureResponseBody || true;
  return middleware;
}

// Format response
function middleware(req, res, next) {
  // Add unique id to request
  var uuid = Uuid.v4();
  req.id = uuid;
  // Start timing request
  req.startTime = new Date();
  var oldEnd = res.end;
  // Override `end` so we can capture the response before it is sent
  res.end = function end(chunk, encoding) {
    // Set `end` back to its original value and call it
    res.end = oldEnd;
    res.end(chunk, encoding);

    // Capture response body, depending on options
    var body;
    if (captureResponseBody) {
      if (chunk) {
        var isJson = (res._headers
            && res._headers['content-type']
            && res._headers['content-type'].indexOf('json') >= 0
          );
        if (isJson) {
          body = JSON.parse(chunk);
        } else {
          body = chunk.toString();
        }
      }
    }

    var responseTime = (new Date() - req.startTime);
    var request = {
      id: req.id,
      headers: req.headers,
      method: req.method,
      url: req.originalUrl || req.url
    };
    var response = {
      headers: res._headers,
      responseTime: responseTime,
      statusCode: res.statusCode,
      body: body
    };
    if (captureRequestBody) {
      request.body = req.body;
    }
    callback(request, response);
  };
  next();
}

exports.formatRequests = formatRequests;
