"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _helpers = require("../helpers");

var _constants = require("./constants");

var _errors = require("./errors");

/**
 * Base class that other data models will extend
 */
var DataModelBase = /*#__PURE__*/function () {
  function DataModelBase() {
    (0, _classCallCheck2["default"])(this, DataModelBase);
    this.constructAttributes();
    this.applyRelations();
  }
  /**
   * Get the primary key.  Default if not defined is id
   * @return string
   */


  (0, _createClass2["default"])(DataModelBase, [{
    key: "_id",

    /**
     * return the primary key of this instance
     * @return mixed
     */
    value: function _id() {
      return this[this.constructor._pk()];
    }
    /**
     * Insert or update instance
     * @param  object transaction optional knex transaction object
     * @return resolved Promise
     */

  }, {
    key: "save",
    value: function () {
      var _save = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var transaction,
            knex,
            def,
            inserting,
            attributeKeys,
            i,
            thisKey,
            isRequired,
            validate,
            values,
            savePromise,
            result,
            _args = arguments;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                transaction = _args.length > 0 && _args[0] !== undefined ? _args[0] : null;
                knex = this.constructor.ORM.knex;
                def = this.constructor.model_definition;
                inserting = !this._id();
                attributeKeys = Object.keys(def.attributes); //assert required flag and attribute level validation

                i = 0;

              case 6:
                if (!(i < attributeKeys.length)) {
                  _context.next = 22;
                  break;
                }

                thisKey = attributeKeys[i];
                isRequired = (0, _helpers.getPropFromObject)('required', def.attributes[thisKey]);
                validate = (0, _helpers.getPropFromObject)('validate', def.attributes[thisKey]);

                if (!(isRequired && !this[thisKey])) {
                  _context.next = 12;
                  break;
                }

                throw new _errors.MissingRequiredAttributeError(this, thisKey);

              case 12:
                _context.t0 = typeof validate === 'function';

                if (!_context.t0) {
                  _context.next = 17;
                  break;
                }

                _context.next = 16;
                return validate(this[thisKey]);

              case 16:
                _context.t0 = !_context.sent;

              case 17:
                if (!_context.t0) {
                  _context.next = 19;
                  break;
                }

                throw new _errors.InvalidAttributeError(this, thisKey);

              case 19:
                i++;
                _context.next = 6;
                break;

              case 22:
                _context.next = 24;
                return this.validate();

              case 24:
                if (_context.sent) {
                  _context.next = 26;
                  break;
                }

                throw new _errors.InavlidInstanceError(this);

              case 26:
                //get values for save
                values = getSaveValues(this);
                savePromise = inserting ? knex(def.table).insert(values) : knex(def.table).where(this.constructor.attr(this.constructor._pk()), this._id()).update(values);
                _context.prev = 28;

                if (!transaction) {
                  _context.next = 35;
                  break;
                }

                _context.next = 32;
                return savePromise.transacting(transaction);

              case 32:
                _context.t1 = _context.sent;
                _context.next = 38;
                break;

              case 35:
                _context.next = 37;
                return savePromise;

              case 37:
                _context.t1 = _context.sent;

              case 38:
                result = _context.t1;
                if (inserting) this[this.constructor._pk()] = result[0];
                return _context.abrupt("return", Promise.resolve(true));

              case 43:
                _context.prev = 43;
                _context.t2 = _context["catch"](28);
                this.debug(_context.t2);
                throw _context.t2;

              case 47:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[28, 43]]);
      }));

      function save() {
        return _save.apply(this, arguments);
      }

      return save;
    }()
  }, {
    key: "validate",

    /**
     * Override to apply instance level validation function when saving
     */
    value: function validate() {
      return true;
    }
    /**
     * Called after object is constructed from query response in find functions
     * Override this function to apply instance level transform
     *
     * Note: Adding properties to the object here is not recommended as they will not be present on the
     * object after it is saved - only after a find() function is called.  Instead, this should really only
     * be used for transforming attributes that exist in the model definition.
     */

  }, {
    key: "transform",
    value: function transform() {
      return true;
    }
    /**
     * Delete this instance
     * @param  object transaction optional knex transaction object
     * @return pending Promise
     */

  }, {
    key: "delete",
    value: function _delete() {
      var transaction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var deletion = this.constructor.query().where(this.constructor.attr(this.constructor._pk()), this._id()).del();
      return transaction ? deletion.transacting(transaction) : deletion;
    }
  }, {
    key: "constructAttributes",

    /**
     * Instantiate defined attributes on instance object
     */
    value: function constructAttributes() {
      var def = this.constructor.model_definition;
      var that = this;
      Object.keys(def.attributes).map(function (attr) {
        that[attr] = undefined;
      });
    }
    /**
     * Create functions on instance for fetching defined relationships
     */

  }, {
    key: "applyRelations",
    value: function applyRelations() {
      var def = this.constructor.model_definition;
      var that = this;
      var relationTypes = [_constants.HAS_MANY, _constants.BELONGS_TO, _constants.HAS_ONE, _constants.HAS_MANY_THROUGH, _constants.BELONGS_TO_THROUGH, _constants.HAS_ONE_THROUGH];
      relationTypes.map(function (relType) {
        if ((0, _helpers.isObject)(def[relType])) {
          Object.keys(def[relType]).map(function (relationName) {
            var config = def[relType][relationName];

            if ((0, _helpers.isObject)(config)) {
              if ([_constants.BELONGS_TO_THROUGH, _constants.HAS_MANY_THROUGH, _constants.HAS_ONE_THROUGH].indexOf(relType) !== -1 && config.through && config.relationship) {
                that[relationName] = function () {
                  return that._doRelation(relationName, relType, function () {
                    return that["_" + relType](config.through, config.relationship);
                  });
                };
              } else if (config.model && config.key) {
                that[relationName] = function () {
                  return that._doRelation(relationName, relType, function () {
                    return that["_" + relType](config.model, config.key);
                  });
                };
              }
            }
          });
        }
      });
    }
  }, {
    key: "_doRelation",
    value: function _doRelation(key, type, getFunc) {
      if (!this._id()) return relationDefault(type);
      return getFunc();
    }
  }, {
    key: "_hasMany",
    value: function _hasMany(model, key) {
      var ORM = this.constructor.ORM;
      var modelClass = ORM.modelRegistry[model];

      if (!modelClass) {
        this.debug("Invalid model provided for hasMany relationship");
        return Promise.resolve([]);
      }

      return modelClass.find().where(modelClass.attr(key), this._id());
    }
  }, {
    key: "_belongsTo",
    value: function _belongsTo(model, key) {
      var ORM = this.constructor.ORM;
      var modelClass = ORM.modelRegistry[model];

      if (!modelClass) {
        this.debug("Invalid model provided for belongsTo relationship");
        return Promise.resolve(null);
      }

      return modelClass.findByPk(this[key]);
    }
  }, {
    key: "_hasOne",
    value: function _hasOne(model, key) {
      var ORM = this.constructor.ORM;
      var modelClass = ORM.modelRegistry[model];

      if (!modelClass) {
        this.debug("Invalid model provided for belongsTo relationship");
        return Promise.resolve(null);
      }

      return modelClass.findOne().where(modelClass.attr(key), this._id());
    }
  }, {
    key: "_hasManyThrough",
    value: function _hasManyThrough(throughRelation, targetRelation) {
      var ORM = this.constructor.ORM;
      var data = ORM.getThroughRelationshipData(this.constructor.name, throughRelation, targetRelation);

      if (typeof data === 'string') {
        this.debug(data);
        return Promise.resolve([]);
      }

      var validCombinations = ["".concat(_constants.HAS_MANY, "-").concat(_constants.HAS_MANY), "".concat(_constants.HAS_ONE, "-").concat(_constants.HAS_MANY), "".concat(_constants.HAS_MANY, "-").concat(_constants.HAS_ONE)];

      if (validCombinations.indexOf(data.relationshipCombination) === -1) {
        this.debug("Invalid relationship combination for hasManyThrough ".concat(relationshipCombination));
        return Promise.resolve([]);
      }

      return data.targetModel.find().join(data.throughModel._table(), data.throughModel.attr(data.throughModel._pk()), '=', data.targetModel.attr(data.targetKey)).join(this.constructor._table(), this.constructor.attr(this.constructor._pk()), '=', data.throughModel.attr(data.throughKey)).where(this.constructor.attr(this.constructor._pk()), this._id());
    }
  }, {
    key: "_hasOneThrough",
    value: function _hasOneThrough(throughRelation, targetRelation) {
      var ORM = this.constructor.ORM;
      var data = ORM.getThroughRelationshipData(this.constructor.name, throughRelation, targetRelation);

      if (typeof data === 'string') {
        this.debug(data);
        return Promise.resolve([]);
      }

      if (data.relationshipCombination !== "".concat(_constants.HAS_ONE, "-").concat(_constants.HAS_ONE)) {
        this.debug("Invalid relationship combination for hasOneThrough ".concat(relationshipCombination));
        return Promise.resolve([]);
      }

      return data.targetModel.findOne().join(data.throughModel._table(), data.throughModel.attr(data.throughModel._pk()), '=', data.targetModel.attr(data.targetKey)).join(this.constructor._table(), this.constructor.attr(this.constructor._pk()), '=', data.throughModel.attr(data.throughKey)).where(this.constructor.attr(this.constructor._pk()), this._id());
    }
  }, {
    key: "_belongsToThrough",
    value: function _belongsToThrough(throughRelation, targetRelation) {
      var ORM = this.constructor.ORM;
      var data = ORM.getThroughRelationshipData(this.constructor.name, throughRelation, targetRelation);

      if (typeof data === 'string') {
        this.debug(data);
        return Promise.resolve(null);
      }

      if (data.relationshipCombination !== "".concat(_constants.BELONGS_TO, "-").concat(_constants.BELONGS_TO)) {
        this.debug("Invalid relationship combination for belongsToThrough ".concat(relationshipCombination));
        return Promise.resolve(null);
      }

      return data.targetModel.findOne().join(data.throughModel._table(), data.throughModel.attr(data.targetKey), '=', data.targetModel.attr(data.targetModel._pk())).join(this.constructor._table(), this.constructor.attr(data.throughKey), '=', data.throughModel.attr(data.throughModel._pk())).where(this.constructor.attr(this.constructor._pk()), this._id());
    }
  }, {
    key: "debug",
    value: function debug(message) {
      this.constructor.debug(message);
    }
  }], [{
    key: "_pk",
    value: function _pk() {
      return this.model_definition.pk || "id";
    }
    /**
     * Return this models table name
     * @return string
     */

  }, {
    key: "_table",
    value: function _table() {
      return this.model_definition.table;
    }
  }, {
    key: "batchCreate",
    value: function batchCreate(modelInstances, transaction) {
      var chunk = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1000;
      var ORM = this.ORM;
      var rows = [];

      if (Array.isArray(modelInstances)) {
        rows = modelInstances.map(function (instance) {
          if (ORM.isModelInstance(instance)) {
            return getSaveValues(instance);
          }
        });
      }

      return transaction ? ORM.knex.batchInsert(this._table(), rows, chunk).transacting(transaction) : ORM.knex.batchInsert(this._table(), rows, chunk);
    } //@TODO how to pass any args from this function into the knex function
    //(object, array, multiple params - knex supports multiple different ways of passing params to these functions)

  }, {
    key: "update",
    value: function update(fields) {
      return this.ORM.knex(this._table()).update(fields);
    }
  }, {
    key: "delete",
    value: function _delete() {
      return this.ORM.knex(this._table())["delete"]();
    }
  }, {
    key: "query",
    value: function query() {
      return this.ORM.knex(this._table());
    }
    /**
     * Query this model's table and return promise that resolves to array of instances for found rows
     * @return pending Promise
     */

  }, {
    key: "find",
    value: function find() {
      return this.query().column(this.getTableColumns()).queryContext({
        ormtransform: transformQueryResults(this.model_definition, this)
      });
    }
    /**
     * Query this model's table and return promise that resolves to instance for first found row
     * @return pending Promise
     */

  }, {
    key: "findOne",
    value: function findOne() {
      return this.query().limit(1).column(this.getTableColumns()).queryContext({
        ormtransform: transformQueryResults(this.model_definition, this),
        returnSingleObject: true
      });
    } //@TODO how to pass any args from this function into the knex function
    //(object, array, multiple params - knex supports multiple different ways of passing params to these functions)

  }, {
    key: "count",
    value: function count() {}
  }, {
    key: "min",
    value: function min() {}
  }, {
    key: "max",
    value: function max() {}
  }, {
    key: "sum",
    value: function sum() {}
  }, {
    key: "avg",
    value: function avg() {}
  }, {
    key: "truncate",
    value: function truncate() {} //@TODO figure out how to union, or does this just get offloaded to knex?  need to test to see if
    //we can call a model function inside a union callback to get the desired result

    /**
     * Query this model's table by primary key and return promise that resolves to instance
     * @return pending Promise
     */

  }, {
    key: "findByPk",
    value: function findByPk(id) {
      return this.findOne().where(this.attr(this._pk()), id);
    }
  }, {
    key: "getTableColumns",
    value: function getTableColumns() {
      var def = this.model_definition;
      var that = this;
      return Object.keys(def.attributes).map(function (key) {
        return that.attr(key);
      });
    }
    /**
     * Helper function for getting SQL attribute string formatted like table.field
     * @param  string attribute
     * @return string
     */

  }, {
    key: "attr",
    value: function attr(attribute) {
      return "".concat(this._table(), ".").concat(attribute);
    }
  }, {
    key: "debug",
    value: function debug(message) {
      this.ORM.debug(message);
    }
  }]);
  return DataModelBase;
}();

exports["default"] = DataModelBase;

function relationDefault(type) {
  if (type === _constants.HAS_MANY || type === _constants.HAS_MANY_THROUGH) {
    return [];
  }

  return null;
}
/**
 * Turn result rows into model instances
 *
 * Maps results of query to model instance properties
 * Also applies attribute level and instance level transform functions (in that order)
 *
 * @param  object   model_definition
 * @param  function classConstructor
 * @return array of instances
 */


function transformQueryResults(model_definition, classConstructor) {
  return function (results) {
    var grouped = {};
    results.map(function (result) {
      var object = new classConstructor();
      Object.keys(model_definition.attributes).map(function (attr) {
        if (typeof result[attr] !== 'undefined') {
          var transform = (0, _helpers.getPropFromObject)('transform', model_definition.attributes[attr]);
          object[attr] = typeof transform === 'function' ? transform(result[attr]) : result[attr];
        }
      });
      object.transform();
      grouped[object[classConstructor._pk()]] = object;
    });
    return Object.values(grouped);
  };
}

function getSaveValues(modelInstance) {
  var values = {};
  Object.keys(modelInstance.constructor.model_definition.attributes).map(function (attr) {
    if (attr != modelInstance.constructor._pk()) {
      values[attr] = modelInstance[attr];
    }
  });
  return values;
}