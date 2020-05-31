"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InvalidModelError = exports.InvalidInstanceError = exports.InvalidAttributeError = exports.MissingRequiredAttributeError = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapNativeSuper"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function () { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var MissingRequiredAttributeError = /*#__PURE__*/function (_Error) {
  (0, _inherits2["default"])(MissingRequiredAttributeError, _Error);

  var _super = _createSuper(MissingRequiredAttributeError);

  function MissingRequiredAttributeError(modelInstance, attributeName) {
    var _this;

    (0, _classCallCheck2["default"])(this, MissingRequiredAttributeError);
    _this = _super.call(this, "".concat(modelInstance.constructor.name, " missing required attribute [").concat(attributeName, "]"));
    _this.name = "MissingRequiredAttributeError";
    return _this;
  }

  return MissingRequiredAttributeError;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(Error));

exports.MissingRequiredAttributeError = MissingRequiredAttributeError;

var InvalidAttributeError = /*#__PURE__*/function (_Error2) {
  (0, _inherits2["default"])(InvalidAttributeError, _Error2);

  var _super2 = _createSuper(InvalidAttributeError);

  function InvalidAttributeError(modelInstance, attributeName) {
    var _this2;

    (0, _classCallCheck2["default"])(this, InvalidAttributeError);
    _this2 = _super2.call(this, "".concat(modelInstance.constructor.name, " [").concat(attributeName, "] attribute failed validation"));
    _this2.name = "InvalidAttributeError";
    return _this2;
  }

  return InvalidAttributeError;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(Error));

exports.InvalidAttributeError = InvalidAttributeError;

var InvalidInstanceError = /*#__PURE__*/function (_Error3) {
  (0, _inherits2["default"])(InvalidInstanceError, _Error3);

  var _super3 = _createSuper(InvalidInstanceError);

  function InvalidInstanceError(modelInstance) {
    var _this3;

    (0, _classCallCheck2["default"])(this, InvalidInstanceError);
    _this3 = _super3.call(this, "".concat(modelInstance.constructor.name, " failed validation"));
    _this3.name = "InvalidInstanceError";
    return _this3;
  }

  return InvalidInstanceError;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(Error));

exports.InvalidInstanceError = InvalidInstanceError;

var InvalidModelError = /*#__PURE__*/function (_Error4) {
  (0, _inherits2["default"])(InvalidModelError, _Error4);

  var _super4 = _createSuper(InvalidModelError);

  function InvalidModelError(message) {
    var _this4;

    (0, _classCallCheck2["default"])(this, InvalidModelError);
    _this4 = _super4.call(this, message);
    _this4.name = "InvalidModelError";
    return _this4;
  }

  return InvalidModelError;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(Error));

exports.InvalidModelError = InvalidModelError;