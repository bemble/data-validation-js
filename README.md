# data-validation
Javascript export of data-validation, to use the library in standard front-end applications.

## How it works?

It only exposes the node module [data-validation](https://github.com/pierrecle/dataValidation) into `window.DataValidation`. And that's all.

## Install

* Lazy method : copy/paste what you want from `dist` folder
* Not-expected-method: `npm install data-validation-js`
* Front-end method: `bower install data-validation-js`

## Examples of usage

    <html>
        <head>
          <title>Validation test</title>
        <body>
          <script src="data-validation-js/dist/data-validation.min.js"></script>
          <script>
            (function() {
              var validator = new DataValidation.Validator();
              if(validator.isValueValid(null, ['required'])) {
                alert('null is not a valid value');
              }
            })();
          </script>
        </body>
    </html>

For more documentation, take a look at [data-validation](https://github.com/pierrecle/dataValidation), everything should be explained there.
