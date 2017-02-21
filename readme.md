# gulp-smarty [![Build Status](https://travis-ci.org/lemures-t/gulp-smarty.svg?branch=master)](https://travis-ci.org/lemures-t/gulp-smarty) [![npm version](https://badge.fury.io/js/gulp-smarty.svg)](https://badge.fury.io/js/gulp-smarty)

> The gulp plugin to render smarty template from remote api and local data

## Install

```
$ npm install --save-dev gulp-smarty
```

## Usage

```js
"use strict"
const gulp = require('gulp');
const smarty = require('gulp-smarty');
const opt = {};

gulp.task('default', () => {
	gulp.src('src/file.html')
    // opt will be explicated below
		.pipe(smarty(opt))
		.pipe(gulp.dest('dist'))
);
```

You can also refer to ```gulp.js``` in the repository for more usage details.



## API

### smarty([options])

##### @parms ```options``` [object]\[must]

The settings of gulp-smarty, which can be configured in the following two ways

```javascript
// options type ONE
{
  "data":{},
  "smarty_opt":{}
}
// options type TWO
{
  "path":"",
  "smarty_opt":{}
}
```



##### @key ```data``` [object]

The detail information, especially corresponing data to render the template.

```javascript
{
  "THE_NAME_OF_THE_HTML_TEMPLATE":{ // be same with the template name from gulp.src();
    // [object] the json data to render the template
    "src_data":{}
  },
  "THE_NAME_OF_THE_HTML_TEMPLATE":{ // another template name from gulp.src();
    // [string] the path to json data, which contains the data to render the template
    "src_data":"THE_FILE_PATH_TO_JSON_DATA.json"
  },
  "THE_NAME_OF_THE_HTML_TEMPLATE":{ // another template name from gulp.src();
    // [string] remote API, from which you can get data to render the template
    "src_data":"REMOTE_API",
    // if the src_data is remote api, the following two optional keys are supported;
    // [object] the object that wraps data from api, which will replace "{{RES}}"
	"res_wrapper":{
      "data":{
        "data":"{{RES}}"
      }
    },
    // [object] the object that is the options of remote API request;
    // you can set request headers, body, method, etc. here
    // for more info: https://nodejs.org/api/http.html#http_http_request_options_callback
    "req_opt":{
      "headers": {
        "Cookie" : "SESSID=abcdefghijklmng"
      },
      "method": "POST",
      // [string] body only for POST.
      // If type of the body is an object, you should parse with querystring.stringify() or JSON.stringify() according to your content-type
      // for more info: http://stackoverflow.com/questions/9768192/sending-data-through-post-request-from-a-node-js-server-to-a-node-js-server
      "body": ""
    }
  },
}
```

##### @key ```path``` [string]

The file path to the detail information above, in case the information is too long in gulpfile.js.

One key between ```data``` and ```path``` **must** be set in options.



##### @key ```smarty_opt``` [object]

the options supported by the renderer pacakge [**smarty4js** ](https://github.com/ecomfe/smarty4js), such as :

```json
{
  "left_delimiter": "{",
  "right_delimiter: "}"
}
```

The key ```smarty_opt``` is optional in options.




## License

MIT ©
