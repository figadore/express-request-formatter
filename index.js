/* eslint-env node */
/* eslint no-underscore-dangle: 0 */

var Uuid = require('uuid');

var onRequestCaptured;
var onResponseCaptured;
var captureRequestBody;
var captureResponseBody;
var logRequestHeaders;
var logResponseHeaders;

// Constructor
function formatRequests(options) {
  //deprecated, overridden by onResponseCaptured
  var callback = options.callback || function empty() {};

  onResponseCaptured = options.onResponseCaptured || callback || function empty() {};
  onRequestCaptured = options.onRequestCaptured || function empty() {};

  //default request/response body capturing to false
  captureRequestBody = false;
  if (options.hasOwnProperty('captureRequestBody')) {
    captureRequestBody = options.captureRequestBody;
  }
  captureResponseBody = false;
  if (options.hasOwnProperty('captureResponseBody')) {
    captureResponseBody = options.captureResponseBody;
  }

  //default request/response header logging to true
  logRequestHeaders = true;
  if (options.hasOwnProperty('logRequestHeaders')) {
    logRequestHeaders = options.logRequestHeaders;
  }
  logResponseHeaders = true;
  if (options.hasOwnProperty('logResponseHeaders')) {
    logResponseHeaders = options.logResponseHeaders;
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
    method: req.method,
    path: req.originalUrl || req.url
  };
  // Show request body size, if included
  if (req.headers.hasOwnProperty("content-length")) {
    request.size = parseInt(req.headers["content-length"], 10);
  }
  // Add headers (if configured to)
  var logReqHeaders;
  if (typeof logRequestHeaders === "function") {
    // If option is a function, use returned object as headers to log
    var headers = logReqHeaders(req);
    request.headers = headers;
  } else {
    // If option is a bool, include all headers if true
    logReqHeaders = logRequestHeaders;
    if (logReqHeaders) {
      request.headers = req.headers;
    }
  }

  var captureReqBody; //boolean
  if (typeof captureRequestBody === "function") {
    captureReqBody = captureRequestBody(req);
  } else {
    captureReqBody = captureRequestBody;
  }
  if (captureReqBody) {
    request.body = req.body;
  }
  res.end = function end(chunk, encoding) {
    // Set `end` back to its original value and call it
    res.end = oldEnd;
    res.end(chunk, encoding);

    // Capture response body, depending on options
    var body;
    var captureResBody; //boolean
    if (typeof captureResponseBody === "function") {
      captureResBody = captureResponseBody(req, res);
    } else {
      captureResBody = captureResponseBody;
    }
    if (captureResBody) {
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
      requestId: req.id,
      time: responseTime,
      size: parseInt(res._headers["content-length"], 10),
      status: res.statusCode
    };
    // Add headers (if configured to)
    var logReqHeaders;
    if (typeof logRequestHeaders === "function") {
      // If option is a function, use returned object as headers to log
      var headers = logResponseHeaders(req, res);
      response.headers = headers;
    } else {
      // If option is a bool, include all headers if true
      logReqHeaders = logRequestHeaders;
      if (logReqHeaders) {
        response.headers = res._headers;
      }
    }

    if (body) {
      response.body = body;
    }
    // Let the app do its own thing with the results
    onResponseCaptured(request, response);
  };
  // Let the app do its own thing with the results
  onRequestCaptured(request);
  next();
}

exports.formatRequests = formatRequests;
