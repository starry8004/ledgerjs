"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Transport = require("../../hw-transport/lib/Transport");

var Tag = 0x05;

function asUInt16BE(value) {
  var b = Buffer.alloc(2);
  b.writeUInt16BE(value, 0);
  return b;
}

var initialAcc = {
  data: Buffer.alloc(0),
  dataLength: 0,
  sequence: 0
};

exports.default = function (channel, packetSize) {
  return {
    makeBlocks: function makeBlocks(apdu) {
      var data = Buffer.concat([asUInt16BE(apdu.length), apdu]);
      var blockSize = packetSize - 5;
      var nbBlocks = Math.ceil(data.length / blockSize);
      data = Buffer.concat([data, // fill data with padding
      Buffer.alloc(nbBlocks * blockSize - data.length + 1).fill(0)]);

      var blocks = [];
      for (var i = 0; i < nbBlocks; i++) {
        var head = Buffer.alloc(5);
        head.writeUInt16BE(channel, 0);
        head.writeUInt8(Tag, 2);
        head.writeUInt16BE(i, 3);
        var chunk = data.slice(i * blockSize, (i + 1) * blockSize);
        blocks.push(Buffer.concat([head, chunk]));
      }
      return blocks;
    },
    reduceResponse: function reduceResponse(acc, chunk) {
      var _ref = acc || initialAcc,
          data = _ref.data,
          dataLength = _ref.dataLength,
          sequence = _ref.sequence;

      if (chunk.readUInt16BE(0) !== channel) {
        throw new _Transport.TransportError("Invalid channel", "InvalidChannel");
      }
      if (chunk.readUInt8(2) !== Tag) {
        throw new _Transport.TransportError("Invalid tag", "InvalidTag");
      }
      if (chunk.readUInt16BE(3) !== sequence) {
        throw new _Transport.TransportError("Invalid sequence", "InvalidSequence");
      }

      if (!acc) {
        dataLength = chunk.readUInt16BE(5);
      }
      sequence++;
      var chunkData = chunk.slice(acc ? 5 : 7);
      data = Buffer.concat([data, chunkData]);
      if (data.length > dataLength) {
        data = data.slice(0, dataLength);
      }

      return {
        data: data,
        dataLength: dataLength,
        sequence: sequence
      };
    },
    getReducedResult: function getReducedResult(acc) {
      if (acc && acc.dataLength === acc.data.length) {
        return acc.data;
      }
    }
  };
};
//# sourceMappingURL=hid-framing.js.map