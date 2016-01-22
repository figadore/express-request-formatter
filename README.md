# Express Request/Response formatter

Formats requests and responses, and optionally bodies, for logging. When capturing response bodies, it only handles non-streaming requests. It is up to the app to determine what to do with the formatted objects

Example Request

```
{
  "id": "7d575f6b-cac9-43cc-96f2-7695f909819d",
  "headers": {
    "host": "localhost:3080",
    "connection": "keep-alive",
    "accept": "application/json, text/plain, */*",
    "user-agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36",
    "referer": "http://localhost:3080/",
    "accept-encoding": "gzip, deflate, sdch",
    "accept-language": "en-US,en;q=0.8"
  },
  "method": "GET",
  "url": "/api/widgets",
  "body": {}
}
```

Example Response

```
{
  "headers": {
    "x-powered-by": "Express",
    "etag": "W/\"I4+1GQyv6zGcoXDQygDf+g==\""
  },
  "requestId": "7d575f6b-cac9-43cc-96f2-7695f909819d",
  "responseTime": 222,
  "statusCode": 200,
  "body": {
    "widgets": [],
    "links": []
  }
}
```

## Usage
Include the module

`requestFormatter = require('shiny-express-formatter');`

Add middleware for formatting requests/responses

`app.use(requestFormatter.formatRequests(options));`

Ensure any request body parsing middleware (e.g. body-parser) is set prior to using the formatting middleware

### Options
* `onRequestCaptured`: function(requestLogObject). callback to run once request object has been formatted. Useful for capturing request id to set bunyan child loggers. default: do nothing

* `onResponseCaptured`: function(requestLogObject, responseLogObject). callback to run once request and response objects have been formatted. default: do nothing

* `captureRequestBody`: boolean. whether to include the request body in the callback. default: true

* `captureResponseBody`: boolean. whether to include the response body in the callback. default: true

### possible future work
* let captureRequestBody and captureResponseBody be bool or functions, in case it depends on other things
* add options to create conditions for which types of request/response bodies are captured (e.g. json only)
