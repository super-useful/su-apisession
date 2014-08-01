/*

  Session object

*/
'use strict';

var define = require('su-define-object');

module.exports = define('SessionData', {
  properties: [
    {
      id: {
        enumerable: true,
        type: 'string'
      }
    },
    {
      isValid: {
        enumerable: true,
        type: 'boolean',
        value: true
      }
    },
    {
      isReady: {
        enumerable: true,
        type: 'boolean',
        value: false
      }
    },
    {
      cache: {
        enumerable: true,
        type: 'object'
      }
    },
    {
      data: {
        enumerable: true,
        type: 'object'
      }
    },
    {
      timestamp: {
        enumerable: true,
        type: 'number'
      }
    }
  ]
});
