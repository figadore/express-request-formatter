#Express Request/Response formatter

Formats requests and responses, and optionally bodies, for logging. When capturing response bodies, it only handles non-streaming requests. It is up to the app to determine what to do with the formatted objects

##Usage
Include  the module
`requestFormatter = require('shiny-express-formatter');`

Add middleware for formatting requests/responses
`app.use(requestFormatter.formatRequests(options));`

###options
`callback`: function(requestLogObject, responseLogObject). callback to run once request and response objects have been formatted. default: do nothing
`captureRequestBody`: boolean. whether to include the request body in the callback. default: true
`captureResponseBody`: boolean. whether to include the response body in the callback. default: true

###possible future work
* let captureRequestBody and captureResponseBody be bool or functions, in case it depends on other things
* add options to create conditions for which types of request/response bodies are captured (e.g. json only)
