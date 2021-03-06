"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendAPDU = undefined;

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _rxjs = require("rxjs");

var _debug = require("./debug");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TagId = 0x05;

function chunkBuffer(buffer, sizeForIndex) {
  var chunks = [];
  for (var i = 0, size = sizeForIndex(0); i < buffer.length; i += size, size = sizeForIndex(i)) {
    chunks.push(buffer.slice(i, i + size));
  }
  return chunks;
}

var sendAPDU = exports.sendAPDU = function sendAPDU(write, apdu, mtuSize) {
  var chunks = chunkBuffer(apdu, function (i) {
    return mtuSize - (i === 0 ? 5 : 3);
  }).map(function (buffer, i) {
    var head = Buffer.alloc(i === 0 ? 5 : 3);
    head.writeUInt8(TagId, 0);
    head.writeUInt16BE(i, 1);
    if (i === 0) {
      head.writeUInt16BE(apdu.length, 3);
    }
    return Buffer.concat([head, buffer]);
  });

  return _rxjs.Observable.create(function (o) {
    var main = function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, chunk;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 3;
                _iterator = (0, _getIterator3.default)(chunks);

              case 5:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context.next = 14;
                  break;
                }

                chunk = _step.value;

                if (!terminated) {
                  _context.next = 9;
                  break;
                }

                return _context.abrupt("return");

              case 9:
                _context.next = 11;
                return write(chunk);

              case 11:
                _iteratorNormalCompletion = true;
                _context.next = 5;
                break;

              case 14:
                _context.next = 20;
                break;

              case 16:
                _context.prev = 16;
                _context.t0 = _context["catch"](3);
                _didIteratorError = true;
                _iteratorError = _context.t0;

              case 20:
                _context.prev = 20;
                _context.prev = 21;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 23:
                _context.prev = 23;

                if (!_didIteratorError) {
                  _context.next = 26;
                  break;
                }

                throw _iteratorError;

              case 26:
                return _context.finish(23);

              case 27:
                return _context.finish(20);

              case 28:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[3, 16, 20, 28], [21,, 23, 27]]);
      }));

      return function main() {
        return _ref.apply(this, arguments);
      };
    }();

    var terminated = false;

    main().then(function () {
      terminated = true;
      o.complete();
    }, function (e) {
      terminated = true;
      _debug.logSubject.next({
        type: "ble-error",
        message: "sendAPDU failure " + String(e)
      });
      o.error(e);
    });

    var unsubscribe = function unsubscribe() {
      if (!terminated) {
        _debug.logSubject.next({
          type: "verbose",
          message: "sendAPDU interruption"
        });
        terminated = true;
      }
    };

    return unsubscribe;
  });
};
//# sourceMappingURL=sendAPDU.js.map