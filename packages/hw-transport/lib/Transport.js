"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StatusCodes = undefined;

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

exports.getAltStatusMessage = getAltStatusMessage;
exports.TransportError = TransportError;
exports.TransportStatusError = TransportStatusError;

var _events2 = require("events");

var _events3 = _interopRequireDefault(_events2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * all possible status codes.
 * @see https://github.com/LedgerHQ/blue-app-btc/blob/d8a03d10f77ca5ef8b22a5d062678eef788b824a/include/btchip_apdu_constants.h#L85-L115
 * @example
 * import { StatusCodes } from "@ledgerhq/hw-transport";
 */


/**
 */


/**
 */


/**
 */

/**
 */
var StatusCodes = exports.StatusCodes = {
  PIN_REMAINING_ATTEMPTS: 0x63c0,
  INCORRECT_LENGTH: 0x6700,
  COMMAND_INCOMPATIBLE_FILE_STRUCTURE: 0x6981,
  SECURITY_STATUS_NOT_SATISFIED: 0x6982,
  CONDITIONS_OF_USE_NOT_SATISFIED: 0x6985,
  INCORRECT_DATA: 0x6a80,
  NOT_ENOUGH_MEMORY_SPACE: 0x6a84,
  REFERENCED_DATA_NOT_FOUND: 0x6a88,
  FILE_ALREADY_EXISTS: 0x6a89,
  INCORRECT_P1_P2: 0x6b00,
  INS_NOT_SUPPORTED: 0x6d00,
  CLA_NOT_SUPPORTED: 0x6e00,
  TECHNICAL_PROBLEM: 0x6f00,
  OK: 0x9000,
  MEMORY_PROBLEM: 0x9240,
  NO_EF_SELECTED: 0x9400,
  INVALID_OFFSET: 0x9402,
  FILE_NOT_FOUND: 0x9404,
  INCONSISTENT_FILE: 0x9408,
  ALGORITHM_NOT_SUPPORTED: 0x9484,
  INVALID_KCV: 0x9485,
  CODE_NOT_INITIALIZED: 0x9802,
  ACCESS_CONDITION_NOT_FULFILLED: 0x9804,
  CONTRADICTION_SECRET_CODE_STATUS: 0x9808,
  CONTRADICTION_INVALIDATION: 0x9810,
  CODE_BLOCKED: 0x9840,
  MAX_VALUE_REACHED: 0x9850,
  GP_AUTH_FAILED: 0x6300,
  LICENSING: 0x6f42,
  HALTED: 0x6faa
};

function getAltStatusMessage(code) {
  switch (code) {
    // improve text of most common errors
    case 0x6700:
      return "Incorrect length";
    case 0x6982:
      return "Security not satisfied (dongle locked or have invalid access rights)";
    case 0x6985:
      return "Condition of use not satisfied (denied by the user?)";
    case 0x6a80:
      return "Invalid data received";
    case 0x6b00:
      return "Invalid parameter received";
  }
  if (0x6f00 <= code && code <= 0x6fff) {
    return "Internal error, please report";
  }
}

/**
 * TransportError is used for any generic transport errors.
 * e.g. Error thrown when data received by exchanges are incorrect or if exchanged failed to communicate with the device for various reason.
 */
function TransportError(message, id) {
  this.name = "TransportError";
  this.message = message;
  this.stack = new Error().stack;
  this.id = id;
}
//$FlowFixMe
TransportError.prototype = new Error();

/**
 * Error thrown when a device returned a non success status.
 * the error.statusCode is one of the `StatusCodes` exported by this library.
 */
function TransportStatusError(statusCode) {
  this.name = "TransportStatusError";
  var statusText = (0, _keys2.default)(StatusCodes).find(function (k) {
    return StatusCodes[k] === statusCode;
  }) || "UNKNOWN_ERROR";
  var smsg = getAltStatusMessage(statusCode) || statusText;
  var statusCodeStr = statusCode.toString(16);
  this.message = "Ledger device: " + smsg + " (0x" + statusCodeStr + ")";
  this.stack = new Error().stack;
  this.statusCode = statusCode;
  this.statusText = statusText;
}
//$FlowFixMe
TransportStatusError.prototype = new Error();

/**
 * Transport defines the generic interface to share between node/u2f impl
 * A **Descriptor** is a parametric type that is up to be determined for the implementation.
 * it can be for instance an ID, an file path, a URL,...
 */

var Transport = function () {
  function Transport() {
    var _this = this;

    (0, _classCallCheck3.default)(this, Transport);
    this.debug = global.__ledgerDebug || null;
    this.exchangeTimeout = 30000;
    this._events = new _events3.default();

    this.send = function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(cla, ins, p1, p2) {
        var data = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : Buffer.alloc(0);
        var statusList = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : [StatusCodes.OK];
        var response, sw;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(data.length >= 256)) {
                  _context.next = 2;
                  break;
                }

                throw new TransportError("data.length exceed 256 bytes limit. Got: " + data.length, "DataLengthTooBig");

              case 2:
                _context.next = 4;
                return _this.exchange(Buffer.concat([Buffer.from([cla, ins, p1, p2]), Buffer.from([data.length]), data]));

              case 4:
                response = _context.sent;
                sw = response.readUInt16BE(response.length - 2);

                if (statusList.some(function (s) {
                  return s === sw;
                })) {
                  _context.next = 8;
                  break;
                }

                throw new TransportStatusError(sw);

              case 8:
                return _context.abrupt("return", response);

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, _this);
      }));

      return function (_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
      };
    }();

    this._appAPIlock = null;
  }

  /**
   * Statically check if a transport is supported on the user's platform/browser.
   */


  /**
   * List once all available descriptors. For a better granularity, checkout `listen()`.
   * @return a promise of descriptors
   * @example
   * TransportFoo.list().then(descriptors => ...)
   */


  /**
   * Listen all device events for a given Transport. The method takes an Obverver of DescriptorEvent and returns a Subscription (according to Observable paradigm https://github.com/tc39/proposal-observable )
   * a DescriptorEvent is a `{ descriptor, type }` object. type can be `"add"` or `"remove"` and descriptor is a value you can pass to `open(descriptor)`.
   * each listen() call will first emit all potential device already connected and then will emit events can come over times,
   * for instance if you plug a USB device after listen() or a bluetooth device become discoverable.
   * @param observer is an object with a next, error and complete function (compatible with observer pattern)
   * @return a Subscription object on which you can `.unsubscribe()` to stop listening descriptors.
   * @example
  const sub = TransportFoo.listen({
  next: e => {
    if (e.type==="add") {
      sub.unsubscribe();
      const transport = await TransportFoo.open(e.descriptor);
      ...
    }
  },
  error: error => {},
  complete: () => {}
  })
   */


  /**
   * attempt to create a Transport instance with potentially a descriptor.
   * @param descriptor: the descriptor to open the transport with.
   * @param timeout: an optional timeout
   * @return a Promise of Transport instance
   * @example
  TransportFoo.open(descriptor).then(transport => ...)
   */


  /**
   * low level api to communicate with the device
   * This method is for implementations to implement but should not be directly called.
   * Instead, the recommanded way is to use send() method
   * @param apdu the data to send
   * @return a Promise of response data
   */


  /**
   * set the "scramble key" for the next exchanges with the device.
   * Each App can have a different scramble key and they internally will set it at instanciation.
   * @param key the scramble key
   */


  /**
   * close the exchange with the device.
   * @return a Promise that ends when the transport is closed.
   */


  (0, _createClass3.default)(Transport, [{
    key: "on",


    /**
     * Listen to an event on an instance of transport.
     * Transport implementation can have specific events. Here is the common events:
     * * `"disconnect"` : triggered if Transport is disconnected
     */
    value: function on(eventName, cb) {
      this._events.on(eventName, cb);
    }

    /**
     * Stop listening to an event on an instance of transport.
     */

  }, {
    key: "off",
    value: function off(eventName, cb) {
      this._events.removeListener(eventName, cb);
    }
  }, {
    key: "emit",
    value: function emit(event) {
      var _events;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      (_events = this._events).emit.apply(_events, [event].concat((0, _toConsumableArray3.default)(args)));
    }

    /**
     * Enable or not logs of the binary exchange
     */

  }, {
    key: "setDebugMode",
    value: function setDebugMode(debug) {
      this.debug = typeof debug === "function" ? debug : debug ? function (log) {
        return console.log(log);
      } : null;
    }

    /**
     * Set a timeout (in milliseconds) for the exchange call. Only some transport might implement it. (e.g. U2F)
     */

  }, {
    key: "setExchangeTimeout",
    value: function setExchangeTimeout(exchangeTimeout) {
      this.exchangeTimeout = exchangeTimeout;
    }

    /**
     * wrapper on top of exchange to simplify work of the implementation.
     * @param cla
     * @param ins
     * @param p1
     * @param p2
     * @param data
     * @param statusList is a list of accepted status code (shorts). [0x9000] by default
     * @return a Promise of response buffer
     */

  }, {
    key: "decorateAppAPIMethods",
    value: function decorateAppAPIMethods(self, methods, scrambleKey) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(methods), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var methodName = _step.value;

          self[methodName] = this.decorateAppAPIMethod(methodName, self[methodName], self, scrambleKey);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "decorateAppAPIMethod",
    value: function decorateAppAPIMethod(methodName, f, ctx, scrambleKey) {
      var _this2 = this;

      return function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          var _appAPIlock, _e;

          return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _appAPIlock = _this2._appAPIlock;

                  if (!_appAPIlock) {
                    _context2.next = 5;
                    break;
                  }

                  _e = new TransportError("Ledger Device is busy (lock " + _appAPIlock + ")", "TransportLocked");

                  (0, _assign2.default)(_e, {
                    currentLock: _appAPIlock,
                    methodName: methodName
                  });
                  return _context2.abrupt("return", _promise2.default.reject(_e));

                case 5:
                  _context2.prev = 5;

                  _this2._appAPIlock = methodName;
                  _this2.setScrambleKey(scrambleKey);
                  _context2.next = 10;
                  return f.apply(ctx, args);

                case 10:
                  return _context2.abrupt("return", _context2.sent);

                case 11:
                  _context2.prev = 11;

                  _this2._appAPIlock = null;
                  return _context2.finish(11);

                case 14:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, _this2, [[5,, 11, 14]]);
        }));

        return function () {
          return _ref2.apply(this, arguments);
        };
      }();
    }
  }], [{
    key: "create",


    /**
     * create() allows to open the first descriptor available or
     * throw if there is none or if timeout is reached.
     * This is a light helper, alternative to using listen() and open() (that you may need for any more advanced usecase)
     * @example
    TransportFoo.create().then(transport => ...)
     */
    value: function create() {
      var _this3 = this;

      var openTimeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 3000;
      var listenTimeout = arguments[1];

      return new _promise2.default(function (resolve, reject) {
        var found = false;
        var sub = _this3.listen({
          next: function next(e) {
            found = true;
            if (sub) sub.unsubscribe();
            if (listenTimeoutId) clearTimeout(listenTimeoutId);
            _this3.open(e.descriptor, openTimeout).then(resolve, reject);
          },
          error: function error(e) {
            if (listenTimeoutId) clearTimeout(listenTimeoutId);
            reject(e);
          },
          complete: function complete() {
            if (listenTimeoutId) clearTimeout(listenTimeoutId);
            if (!found) {
              reject(new TransportError(_this3.ErrorMessage_NoDeviceFound, "NoDeviceFound"));
            }
          }
        });
        var listenTimeoutId = listenTimeout ? setTimeout(function () {
          sub.unsubscribe();
          reject(new TransportError(_this3.ErrorMessage_ListenTimeout, "ListenTimeout"));
        }, listenTimeout) : null;
      });
    }
  }]);
  return Transport;
}();

Transport.ErrorMessage_ListenTimeout = "No Ledger device found (timeout)";
Transport.ErrorMessage_NoDeviceFound = "No Ledger device found";
exports.default = Transport;