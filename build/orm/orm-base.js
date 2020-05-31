"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _helpers = require("../helpers");

var _constants = require("./constants");

var _errors = require("./errors");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var Store = /*#__PURE__*/function () {
  function Store(config) {
    (0, _classCallCheck2["default"])(this, Store);
    this.modelRegistry = {};
    this.knex = null;
    this.debugMode = false;
    this.init(config);
  }
  /**
   * If knex function provided, manually modify the postProcessResponse function (kind of sketchy)
   * If connection config provided, instantiate knex and set postProcessResponse here (per documentation)
   */


  (0, _createClass2["default"])(Store, [{
    key: "init",
    value: function init(config) {
      if (typeof config === 'function' && config.name === "knex") {
        config.client.config.postProcessResponse = this.processResponse;
        this.knex = config;
      } else {
        this.knex = require('knex')(_objectSpread(_objectSpread({}, config), {}, {
          postProcessResponse: this.processResponse
        }));
      }
    }
    /**
     * Does the mapping of results to data model instances
     */

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
      if (!this.isModel(model)) {
        throw new _errors.InvalidModelError("Registered model not instance of store model: " + model);
      }

      if (!(0, _helpers.isObject)(model.model_definition)) {
        throw new _errors.InvalidModelError("model_definition must be of type object");
      }

      if (!model.model_definition.table) {
        throw new _errors.InvalidModelError("model_definition.table required");
      }

      if (!(0, _helpers.isObject)(model.model_definition.attributes) || !Object.keys(model.model_definition.attributes).length) {
        throw new _errors.InvalidModelError("model_definition.attributes must be non empty object");
      }

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
  }, {
    key: "saveAll",
    value: function () {
      var _saveAll2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(modelInstances) {
        var _this = this;

        var transaction,
            _args2 = arguments;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                transaction = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : null;

                if (!Array.isArray(modelInstances)) {
                  _context2.next = 9;
                  break;
                }

                if (!transaction) {
                  _context2.next = 7;
                  break;
                }

                _context2.next = 5;
                return _saveAll(this, modelInstances, transaction);

              case 5:
                _context2.next = 9;
                break;

              case 7:
                _context2.next = 9;
                return this.knex.transaction( /*#__PURE__*/function () {
                  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(trx) {
                    return _regenerator["default"].wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            _context.next = 2;
                            return _saveAll(_this, modelInstances, trx);

                          case 2:
                            _context.next = 4;
                            return trx.commit();

                          case 4:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee);
                  }));

                  return function (_x2) {
                    return _ref.apply(this, arguments);
                  };
                }());

              case 9:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function saveAll(_x) {
        return _saveAll2.apply(this, arguments);
      }

      return saveAll;
    }()
  }, {
    key: "deleteAll",
    value: function () {
      var _deleteAll2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(modelInstances) {
        var _this2 = this;

        var transaction,
            _args4 = arguments;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                transaction = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : null;

                if (!Array.isArray(modelInstances)) {
                  _context4.next = 9;
                  break;
                }

                if (!transaction) {
                  _context4.next = 7;
                  break;
                }

                _context4.next = 5;
                return _deleteAll(this, modelInstances, transaction);

              case 5:
                _context4.next = 9;
                break;

              case 7:
                _context4.next = 9;
                return this.knex.transaction( /*#__PURE__*/function () {
                  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(trx) {
                    return _regenerator["default"].wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            _context3.next = 2;
                            return _deleteAll(_this2, modelInstances, trx);

                          case 2:
                            _context3.next = 4;
                            return trx.commit();

                          case 4:
                          case "end":
                            return _context3.stop();
                        }
                      }
                    }, _callee3);
                  }));

                  return function (_x4) {
                    return _ref2.apply(this, arguments);
                  };
                }());

              case 9:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function deleteAll(_x3) {
        return _deleteAll2.apply(this, arguments);
      }

      return deleteAll;
    }()
  }, {
    key: "isModelInstance",
    value: function isModelInstance(modelInstance) {
      return (0, _helpers.isObject)(modelInstance) && isModel(modelInstance.constructor);
    }
  }, {
    key: "isModel",
    value: function isModel(model) {
      return typeof model === 'function' && model.prototype instanceof this.Model;
    }
  }, {
    key: "transaction",
    value: function transaction(callback) {
      return this.knex.transaction(function (trx) {
        callback(trx);
      });
    }
  }]);
  return Store;
}();

exports["default"] = Store;

function _saveAll(_x5, _x6, _x7) {
  return _saveAll3.apply(this, arguments);
}

function _saveAll3() {
  _saveAll3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(ORM, modelInstances, transaction) {
    var i;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            i = 0;

          case 1:
            if (!(i < modelInstances.length)) {
              _context5.next = 8;
              break;
            }

            if (!ORM.isModelInstance(modelInstances[i])) {
              _context5.next = 5;
              break;
            }

            _context5.next = 5;
            return modelInstances[i].save(transaction);

          case 5:
            i++;
            _context5.next = 1;
            break;

          case 8:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _saveAll3.apply(this, arguments);
}

function _deleteAll(_x8, _x9, _x10) {
  return _deleteAll3.apply(this, arguments);
}

function _deleteAll3() {
  _deleteAll3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(ORM, modelInstances, transaction) {
    var i;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            i = 0;

          case 1:
            if (!(i < modelInstances.length)) {
              _context6.next = 8;
              break;
            }

            if (!ORM.isModelInstance(modelInstances[i])) {
              _context6.next = 5;
              break;
            }

            _context6.next = 5;
            return modelInstances[i]["delete"](transaction);

          case 5:
            i++;
            _context6.next = 1;
            break;

          case 8:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _deleteAll3.apply(this, arguments);
}