"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _helpers = require("../helpers");

var _constants = require("./constants");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var ORMBase = /*#__PURE__*/function () {
  function ORMBase(config) {
    (0, _classCallCheck2["default"])(this, ORMBase);
    this.modelRegistry = {};
    this.knex = null;
    this.debugMode = false;
    this.init(config);
  }

  (0, _createClass2["default"])(ORMBase, [{
    key: "init",
    value: function init(config) {
      this.knex = require('knex')(_objectSpread({}, config, {
        postProcessResponse: this.processResponse
      }));
    }
  }, {
    key: "processResponse",
    value: function processResponse(result, queryContext) {
      if ((0, _helpers.isObject)(queryContext) && typeof queryContext.ormtransform === 'function') {
        var transformed = queryContext.ormtransform(result);

        if (queryContext.returnSingleObject) {
          return transformed.length ? transformed[0] : null;
        }

        return transformed;
      }

      return result;
    }
  }, {
    key: "registerModel",
    value: function registerModel(model) {
      //@TODO validate model here
      //make sure it extends model
      //validate model_defintion
      this.modelRegistry[model.name] = model;
    }
  }, {
    key: "getThroughRelationshipData",
    value: function getThroughRelationshipData(parentModel, throughRelation, targetRelation) {
      var result = {
        throughRelationshipType: null,
        throughModel: null,
        throughKey: null,
        targetRelationshipType: null,
        targetModel: null,
        targetKey: null
      };
      if (!this.modelRegistry[parentModel]) return "Invalid parent model";
      var model_definition = this.modelRegistry[parentModel].model_definition;
      var relTypes = [_constants.BELONGS_TO, _constants.HAS_MANY, _constants.HAS_ONE];
      relTypes.map(function (relType) {
        if ((0, _helpers.isObject)(model_definition[relType])) {
          var relKeys = Object.keys(model_definition[relType]);

          if (relKeys.indexOf(throughRelation) !== -1) {
            result.throughRelationshipType = relType;
            result.throughModel = model_definition[relType][throughRelation].model;
            result.throughKey = model_definition[relType][throughRelation].key;
          }
        }
      });
      if (!result.throughModel) return "Invalid through relation [".concat(throughRelation, "]");
      if (!this.modelRegistry[result.throughModel]) return "Invalid through model [".concat(result.throughModel, "]");
      result.throughModel = this.modelRegistry[result.throughModel];
      var target_model_definition = result.throughModel.model_definition;
      relTypes.map(function (relType) {
        if ((0, _helpers.isObject)(target_model_definition[relType])) {
          var relKeys = Object.keys(target_model_definition[relType]);

          if (relKeys.indexOf(targetRelation) !== -1) {
            result.targetRelationshipType = relType;
            result.targetModel = target_model_definition[relType][targetRelation].model;
            result.targetKey = target_model_definition[relType][targetRelation].key;
          }
        }
      });
      if (!result.targetModel) return "Invalid target relation [".concat(targetRelation, "]");
      if (!this.modelRegistry[result.targetModel]) return "Invalid target model [".concat(result.targetModel, "]");
      result.targetModel = this.modelRegistry[result.targetModel];
      result.relationshipCombination = result.throughRelationshipType + '-' + result.targetRelationshipType;
      return result;
    }
  }, {
    key: "debug",
    value: function debug(error) {
      if (this.debugMode) {
        this._debug(error);
      }
    }
  }, {
    key: "_debug",
    value: function _debug(error) {
      console.log(error);
    }
  }]);
  return ORMBase;
}();

exports["default"] = ORMBase;