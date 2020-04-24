"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isObject = exports.getPropFromObject = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var getPropFromObject = function getPropFromObject(prop, object) {
  if (isObject(object) && typeof object[prop] !== 'undefined') {
    return object[prop];
  }

  return null;
};

exports.getPropFromObject = getPropFromObject;

var isObject = function isObject(obj) {
  return (0, _typeof2["default"])(obj) === 'object' && obj !== null;
};

exports.isObject = isObject;