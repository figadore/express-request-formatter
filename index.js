/* eslint-env node */
/* eslint no-underscore-dangle: 0 */

var Uuid = require('uuid');

var onRequestCaptured;
var onResponseCaptured;
var captureRequestBody;
var captureResponseBody;

// Constructor
function formatRequests(options) {
  //deprecated, overridden by onResponseCaptured
  var callback = options.callback || function empty() {};

  onResponseCaptured = options.onResponseCaptured || callback || function empty() {};
  onRequestCaptured = options.onRequestCaptured || function empty() {};

  //default request/response body capturing to true
  captureRequestBody = true;
  if (options.hasOwnProperty('captureRequestBody')) {
    captureRequestBody = options.captureRequestBody;
  }
  captureResponseBody = true;
  if (options.hasOwnProperty('captureResponseBody')) {
    captureResponseBody = options.captureResponseBody
  }
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
  var request = {
    id: req.id,
    headers: req.headers,
    method: req.method,
    url: req.originalUrl || req.url
  };
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
    var response = {
      headers: res._headers,
      requestId: req.id,
      responseTime: responseTime,
      statusCode: res.statusCode,
      body: body
    };
    if (captureRequestBody) {
      request.body = req.body;
    }
    // Let the app do its own thing with the results
    onResponseCaptured(request, response);
  };
  // Let the app do its own thing with the results
  onRequestCaptured(request);
  next();
}

exports.formatRequests = formatRequests;
