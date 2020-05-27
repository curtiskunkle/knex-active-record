"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _ormBase = _interopRequireDefault(require("./orm/orm-base"));

var _datamodelBase = _interopRequireDefault(require("./orm/datamodel-base"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function () { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var CreateStore = function CreateStore(config) {
  var initializedOrm = new _ormBase["default"](config);

  var Model = /*#__PURE__*/function (_DataModelBase) {
    (0, _inherits2["default"])(Model, _DataModelBase);

    var _super = _createSuper(Model);

    function Model() {
      (0, _classCallCheck2["default"])(this, Model);
      return _super.apply(this, arguments);
    }

    (0, _createClass2["default"])(Model, null, [{
      key: "ORM",
      get: function get() {
        return initializedOrm;
      }
    }]);
    return Model;
  }(_datamodelBase["default"]);

  initializedOrm.Model = Model;
  return initializedOrm;
};

var _default = CreateStore;
exports["default"] = _default;