"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
	'use strict';

	//**************************************************************************************
	/**
  * Get value for input parameters, or set a default value
  * @param {Object} parameters
  * @param {string} name
  * @param defaultValue
  */

	function getParametersValue(parameters, name, defaultValue) {
		if (parameters instanceof Object === false) return defaultValue;

		if (name in parameters) return parameters[name];

		return defaultValue;
	}
	//**************************************************************************************
	/**
  * Converts "ArrayBuffer" into a hexdecimal string
  * @param {ArrayBuffer} inputBuffer
  * @param {number} [inputOffset=0]
  * @param {number} [inputLength=inputBuffer.byteLength]
  * @returns {string}
  */
	function bufferToHexCodes(inputBuffer) {
		var inputOffset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
		var inputLength = arguments.length <= 2 || arguments[2] === undefined ? inputBuffer.byteLength : arguments[2];

		var result = "";

		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = new Uint8Array(inputBuffer, inputOffset, inputLength)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var item = _step.value;

				var str = item.toString(16).toUpperCase();
				result = result + (str.length === 1 ? "0" : "") + str;
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

		return result;
	}
	//**************************************************************************************
	/**
  * Check input "ArrayBuffer" for common functions
  * @param {LocalBaseBlock} baseBlock
  * @param {ArrayBuffer} inputBuffer
  * @param {number} inputOffset
  * @param {number} inputLength
  * @returns {boolean}
  */
	function checkBufferParams(baseBlock, inputBuffer, inputOffset, inputLength) {
		if (inputBuffer instanceof ArrayBuffer === false) {
			baseBlock.error = "Wrong parameter: inputBuffer must be \"ArrayBuffer\"";
			return false;
		}

		if (inputBuffer.byteLength === 0) {
			baseBlock.error = "Wrong parameter: inputBuffer has zero length";
			return false;
		}

		if (inputOffset < 0) {
			baseBlock.error = "Wrong parameter: inputOffset less than zero";
			return false;
		}

		if (inputLength < 0) {
			baseBlock.error = "Wrong parameter: inputLength less than zero";
			return false;
		}

		if (inputBuffer.byteLength - inputOffset - inputLength < 0) {
			baseBlock.error = "End of input reached before message was fully decoded (inconsistent offset and length values)";
			return false;
		}

		return true;
	}
	//**************************************************************************************
	/**
  * Convert number from 2^base to 2^10
  * @param {Uint8Array} inputBuffer
  * @param {number} inputBase
  * @returns {number}
  */
	function utilFromBase(inputBuffer, inputBase) {
		var result = 0;

		for (var i = inputBuffer.length - 1; i >= 0; i--) {
			result += inputBuffer[inputBuffer.length - 1 - i] * Math.pow(2, inputBase * i);
		}return result;
	}
	//**************************************************************************************
	/**
  * Convert number from 2^10 to 2^base
  * @param {!number} value The number to convert
  * @param {!number} base The base for 2^base
  * @param {number} [reserved=0] Pre-defined number of bytes in output array (-1 = limited by function itself)
  * @returns {ArrayBuffer}
  */
	function utilToBase(value, base) {
		var reserved = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

		var internalReserved = reserved || -1;
		var internalValue = value;

		var result = 0;
		var biggest = Math.pow(2, base);

		for (var i = 1; i < 8; i++) {
			if (value < biggest) {
				var retBuf = void 0;

				if (internalReserved < 0) {
					retBuf = new ArrayBuffer(i);
					result = i;
				} else {
					if (internalReserved < i) return new ArrayBuffer(0);

					retBuf = new ArrayBuffer(internalReserved);

					result = internalReserved;
				}

				var retView = new Uint8Array(retBuf);

				for (var j = i - 1; j >= 0; j--) {
					var basis = Math.pow(2, j * base);

					retView[result - j - 1] = Math.floor(internalValue / basis);
					internalValue -= retView[result - j - 1] * basis;
				}

				return retBuf;
			}

			biggest *= Math.pow(2, base);
		}

		return new ArrayBuffer(0);
	}
	//**************************************************************************************
	/**
  * Concatenate two ArrayBuffers
  * @param {...ArrayBuffer} buffers First ArrayBuffer (first part of concatenated array)
  */
	function utilConcatBuf() {
		//region Initial variables
		var outputLength = 0;
		var prevLength = 0;
		//endregion

		//region Calculate output length

		for (var _len = arguments.length, buffers = Array(_len), _key = 0; _key < _len; _key++) {
			buffers[_key] = arguments[_key];
		}

		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = buffers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var buffer = _step2.value;

				outputLength += buffer.byteLength;
			} //endregion
		} catch (err) {
			_didIteratorError2 = true;
			_iteratorError2 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion2 && _iterator2.return) {
					_iterator2.return();
				}
			} finally {
				if (_didIteratorError2) {
					throw _iteratorError2;
				}
			}
		}

		var retBuf = new ArrayBuffer(outputLength);
		var retView = new Uint8Array(retBuf);

		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;

		try {
			for (var _iterator3 = buffers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				var _buffer = _step3.value;

				retView.set(new Uint8Array(_buffer), prevLength);
				prevLength += _buffer.byteLength;
			}
		} catch (err) {
			_didIteratorError3 = true;
			_iteratorError3 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion3 && _iterator3.return) {
					_iterator3.return();
				}
			} finally {
				if (_didIteratorError3) {
					throw _iteratorError3;
				}
			}
		}

		return retBuf;
	}
	//**************************************************************************************
	/**
  * Decoding of "two complement" values
  * The function must be called in scope of instance of "hexBlock" class ("valueHex" and "warnings" properties must be present)
  * @returns {number}
  */
	function utilDecodeTC() {
		var buf = new Uint8Array(this.valueHex);

		if (this.valueHex.byteLength >= 2) {
			//noinspection JSBitwiseOperatorUsage
			var condition1 = buf[0] === 0xFF && buf[1] & 0x80;
			var condition2 = buf[0] === 0x00 && (buf[1] & 0x80) === 0x00;

			if (condition1 || condition2) this.warnings.push("Needlessly long format");
		}

		//region Create big part of the integer
		var bigIntBuffer = new ArrayBuffer(this.valueHex.byteLength);
		var bigIntView = new Uint8Array(bigIntBuffer);
		for (var i = 0; i < this.valueHex.byteLength; i++) {
			bigIntView[i] = 0;
		}bigIntView[0] = buf[0] & 0x80; // mask only the biggest bit

		var bigInt = utilFromBase(bigIntView, 8);
		//endregion

		//region Create small part of the integer
		var smallIntBuffer = new ArrayBuffer(this.valueHex.byteLength);
		var smallIntView = new Uint8Array(smallIntBuffer);
		for (var j = 0; j < this.valueHex.byteLength; j++) {
			smallIntView[j] = buf[j];
		}smallIntView[0] &= 0x7F; // mask biggest bit

		var smallInt = utilFromBase(smallIntView, 8);
		//endregion

		return smallInt - bigInt;
	}
	//**************************************************************************************
	/**
  * Encode integer value to "two complement" format
  * @param {number} value Value to encode
  * @returns {ArrayBuffer}
  */
	function utilEncodeTC(value) {
		var modValue = value < 0 ? value * -1 : value;
		var bigInt = 128;

		for (var i = 1; i < 8; i++) {
			if (modValue <= bigInt) {
				if (value < 0) {
					var smallInt = bigInt - modValue;

					var _retBuf = utilToBase(smallInt, 8, i);
					var _retView = new Uint8Array(_retBuf);

					_retView[0] |= 0x80;

					return _retBuf;
				}

				var retBuf = utilToBase(modValue, 8, i);
				var retView = new Uint8Array(retBuf);

				//noinspection JSBitwiseOperatorUsage
				if (retView[0] & 0x80) {
					//noinspection JSCheckFunctionSignatures
					var tempBuf = retBuf.slice(0);
					var tempView = new Uint8Array(tempBuf);

					retBuf = new ArrayBuffer(retBuf.byteLength + 1);
					retView = new Uint8Array(retBuf);

					for (var k = 0; k < tempBuf.byteLength; k++) {
						retView[k + 1] = tempView[k];
					}retView[0] = 0x00;
				}

				return retBuf;
			}

			bigInt *= Math.pow(2, 8);
		}

		return new ArrayBuffer(0);
	}
	//**************************************************************************************
	/**
  * Compare two array buffers
  * @param {!ArrayBuffer} inputBuffer1
  * @param {!ArrayBuffer} inputBuffer2
  * @returns {boolean}
  */
	function isEqualBuffer(inputBuffer1, inputBuffer2) {
		if (inputBuffer1.byteLength !== inputBuffer2.byteLength) return false;

		var view1 = new Uint8Array(inputBuffer1);
		var view2 = new Uint8Array(inputBuffer2);

		for (var i = 0; i < view1.length; i++) {
			if (view1[i] !== view2[i]) return false;
		}

		return true;
	}
	//**************************************************************************************
	/**
  * Pad input number with leade "0" if needed
  * @returns {string}
  * @param {number} inputNumber
  * @param {number} fullLength
  */
	function padNumber(inputNumber, fullLength) {
		var str = inputNumber.toString(10);
		var dif = fullLength - str.length;

		var padding = new Array(dif);
		for (var i = 0; i < dif; i++) {
			padding[i] = "0";
		}var paddingString = padding.join("");

		return paddingString.concat(str);
	}
	//**************************************************************************************
	var base64Template = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var base64UrlTemplate = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=";
	//**************************************************************************************
	/**
  * Encode string into BASE64 (or "base64url")
  * @param {string} input
  * @param {boolean} useUrlTemplate If "true" then output would be encoded using "base64url"
  * @param {boolean} skipPadding Skip BASE-64 padding or not
  * @returns {string}
  */
	function toBase64(input) {
		var useUrlTemplate = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
		var skipPadding = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

		var i = 0;

		var flag1 = 0;
		var flag2 = 0;

		var output = "";

		var template = useUrlTemplate ? base64UrlTemplate : base64Template;

		while (i < input.length) {
			var chr1 = input.charCodeAt(i++);
			if (i >= input.length) flag1 = 1;
			var chr2 = input.charCodeAt(i++);
			if (i >= input.length) flag2 = 1;
			var chr3 = input.charCodeAt(i++);

			var enc1 = chr1 >> 2;
			var enc2 = (chr1 & 0x03) << 4 | chr2 >> 4;
			var enc3 = (chr2 & 0x0F) << 2 | chr3 >> 6;
			var enc4 = chr3 & 0x3F;

			if (flag1 === 1) enc3 = enc4 = 64;else {
				if (flag2 === 1) enc4 = 64;
			}

			if (skipPadding) {
				if (enc3 === 64) output += "" + template.charAt(enc1) + template.charAt(enc2);else {
					if (enc4 === 64) output += "" + template.charAt(enc1) + template.charAt(enc2) + template.charAt(enc3);else output += "" + template.charAt(enc1) + template.charAt(enc2) + template.charAt(enc3) + template.charAt(enc4);
				}
			} else output += "" + template.charAt(enc1) + template.charAt(enc2) + template.charAt(enc3) + template.charAt(enc4);
		}

		return output;
	}
	//**************************************************************************************
	/**
  * Decode string from BASE64 (or "base64url")
  * @param {string} input
  * @param {boolean} [useUrlTemplate=false] If "true" then output would be encoded using "base64url"
  * @param {boolean} [cutTailZeros=false] If "true" then cut tailing zeroz from function result
  * @returns {string}
  */
	function fromBase64(input) {
		var useUrlTemplate = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
		var cutTailZeros = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

		var template = useUrlTemplate ? base64UrlTemplate : base64Template;

		//region Aux functions
		function indexof(toSearch) {
			for (var _i = 0; _i < 64; _i++) {
				if (template.charAt(_i) === toSearch) return _i;
			}

			return 64;
		}

		function test(incoming) {
			return incoming === 64 ? 0x00 : incoming;
		}
		//endregion

		var i = 0;

		var output = "";

		while (i < input.length) {
			var enc1 = indexof(input.charAt(i++));
			var enc2 = i >= input.length ? 0x00 : indexof(input.charAt(i++));
			var enc3 = i >= input.length ? 0x00 : indexof(input.charAt(i++));
			var enc4 = i >= input.length ? 0x00 : indexof(input.charAt(i++));

			var chr1 = test(enc1) << 2 | test(enc2) >> 4;
			var chr2 = (test(enc2) & 0x0F) << 4 | test(enc3) >> 2;
			var chr3 = (test(enc3) & 0x03) << 6 | test(enc4);

			output += String.fromCharCode(chr1);

			if (enc3 !== 64) output += String.fromCharCode(chr2);

			if (enc4 !== 64) output += String.fromCharCode(chr3);
		}

		if (cutTailZeros) {
			var outputLength = output.length;
			var nonZeroStart = -1;

			for (var _i2 = outputLength - 1; _i2 >= 0; _i2--) {
				if (output.charCodeAt(_i2) !== 0) {
					nonZeroStart = _i2;
					break;
				}
			}

			if (nonZeroStart !== -1) output = output.slice(0, nonZeroStart + 1);
		}

		return output;
	}
	//**************************************************************************************
	function arrayBufferToString(buffer) {
		var resultString = "";
		var view = new Uint8Array(buffer);

		var _iteratorNormalCompletion4 = true;
		var _didIteratorError4 = false;
		var _iteratorError4 = undefined;

		try {
			for (var _iterator4 = view[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
				var element = _step4.value;

				resultString = resultString + String.fromCharCode(element);
			}
		} catch (err) {
			_didIteratorError4 = true;
			_iteratorError4 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion4 && _iterator4.return) {
					_iterator4.return();
				}
			} finally {
				if (_didIteratorError4) {
					throw _iteratorError4;
				}
			}
		}

		return resultString;
	}
	//**************************************************************************************
	function stringToArrayBuffer(str) {
		var stringLength = str.length;

		var resultBuffer = new ArrayBuffer(stringLength);
		var resultView = new Uint8Array(resultBuffer);

		for (var i = 0; i < stringLength; i++) {
			resultView[i] = str.charCodeAt(i);
		}return resultBuffer;
	}
	//**************************************************************************************
	var log2 = Math.log(2);
	//**************************************************************************************
	/**
  * Get nearest to input length power of 2
  * @param {number} length Current length of existing array
  * @returns {number}
  */
	function nearestPowerOf2(length) {
		var base = Math.log(length) / log2;

		var floor = Math.floor(base);
		var round = Math.round(base);

		return floor === round ? floor : round;
	}
	//**************************************************************************************

	//**************************************************************************************
	//region Declaration for "LocalBaseBlock" class
	//**************************************************************************************
	/**
  * Class used as a base block for all remaining ASN.1 classes
  * @typedef LocalBaseBlock
  * @interface
  * @property {number} blockLength
  * @property {string} error
  * @property {Array.<string>} warnings
  * @property {ArrayBuffer} valueBeforeDecode
  */

	var LocalBaseBlock = function () {
		//**********************************************************************************
		/**
   * Constructor for "LocalBaseBlock" class
   * @param {Object} [parameters={}]
   * @property {ArrayBuffer} [valueBeforeDecode]
   */
		function LocalBaseBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalBaseBlock);

			/**
    * @type {number} blockLength
    */
			this.blockLength = getParametersValue(parameters, "blockLength", 0);
			/**
    * @type {string} error
    */
			this.error = getParametersValue(parameters, "error", "");
			/**
    * @type {Array.<string>} warnings
    */
			this.warnings = getParametersValue(parameters, "warnings", []);
			//noinspection JSCheckFunctionSignatures
			/**
    * @type {ArrayBuffer} valueBeforeDecode
    */
			if ("valueBeforeDecode" in parameters) this.valueBeforeDecode = parameters.valueBeforeDecode.slice(0);else this.valueBeforeDecode = new ArrayBuffer(0);
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(LocalBaseBlock, [{
			key: "toJSON",

			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
    */
			value: function toJSON() {
				return {
					blockName: this.constructor.blockName(),
					blockLength: this.blockLength,
					error: this.error,
					warnings: this.warnings,
					valueBeforeDecode: bufferToHexCodes(this.valueBeforeDecode, 0, this.valueBeforeDecode.byteLength)
				};
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "baseBlock";
			}
		}]);

		return LocalBaseBlock;
	}();
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Description for "LocalHexBlock" class
	//**************************************************************************************
	/**
  * Class used as a base block for all remaining ASN.1 classes
  * @extends LocalBaseBlock
  * @typedef LocalHexBlock
  * @property {number} blockLength
  * @property {string} error
  * @property {Array.<string>} warnings
  * @property {ArrayBuffer} valueBeforeDecode
  * @property {boolean} isHexOnly
  * @property {ArrayBuffer} valueHex
  */
	//noinspection JSUnusedLocalSymbols


	var LocalHexBlock = function LocalHexBlock(BaseClass) {
		return function (_BaseClass) {
			_inherits(LocalHexBlockMixin, _BaseClass);

			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Constructor for "LocalHexBlock" class
    * @param {Object} [parameters={}]
    * @property {ArrayBuffer} [valueHex]
    */
			function LocalHexBlockMixin() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				_classCallCheck(this, LocalHexBlockMixin);

				/**
     * @type {boolean}
     */
				var _this2 = _possibleConstructorReturn(this, (LocalHexBlockMixin.__proto__ || Object.getPrototypeOf(LocalHexBlockMixin)).call(this, parameters));

				_this2.isHexOnly = getParametersValue(parameters, "isHexOnly", false);
				/**
     * @type {ArrayBuffer}
     */
				if ("valueHex" in parameters) _this2.valueHex = parameters.valueHex.slice(0);else _this2.valueHex = new ArrayBuffer(0);
				return _this2;
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */


			_createClass(LocalHexBlockMixin, [{
				key: "fromBER",

				//**********************************************************************************
				/**
     * Base function for converting block from BER encoded array of bytes
     * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
     * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
     * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
     * @returns {number} Offset after least decoded byte
     */
				value: function fromBER(inputBuffer, inputOffset, inputLength) {
					//region Basic check for parameters
					//noinspection JSCheckFunctionSignatures
					if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;
					//endregion

					//region Getting Uint8Array from ArrayBuffer
					var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
					//endregion

					//region Initial checks
					if (intBuffer.length === 0) {
						this.warnings.push("Zero buffer length");
						return inputOffset;
					}
					//endregion

					//region Copy input buffer to internal buffer
					this.valueHex = inputBuffer.slice(inputOffset, inputOffset + inputLength);
					//endregion

					this.blockLength = inputLength;

					return inputOffset + inputLength;
				}
				//**********************************************************************************
				/**
     * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
     * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
     * @returns {ArrayBuffer}
     */

			}, {
				key: "toBER",
				value: function toBER() {
					var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

					if (this.isHexOnly !== true) {
						this.error = "Flag \"isHexOnly\" is not set, abort";
						return new ArrayBuffer(0);
					}

					if (sizeOnly === true) return new ArrayBuffer(this.valueHex.byteLength);

					//noinspection JSCheckFunctionSignatures
					return this.valueHex.slice(0);
				}
				//**********************************************************************************
				/**
     * Convertion for the block to JSON object
     * @returns {Object}
     */

			}, {
				key: "toJSON",
				value: function toJSON() {
					var object = {};

					//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
					try {
						object = _get(LocalHexBlockMixin.prototype.__proto__ || Object.getPrototypeOf(LocalHexBlockMixin.prototype), "toJSON", this).call(this);
					} catch (ex) {}
					//endregion

					object.blockName = this.constructor.blockName();
					object.isHexOnly = this.isHexOnly;
					object.valueHex = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);

					return object;
				}
				//**********************************************************************************

			}], [{
				key: "blockName",
				value: function blockName() {
					return "hexBlock";
				}
			}]);

			return LocalHexBlockMixin;
		}(BaseClass);
	};
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of identification block class
	//**************************************************************************************

	var LocalIdentificationBlock = function (_LocalHexBlock) {
		_inherits(LocalIdentificationBlock, _LocalHexBlock);

		//**********************************************************************************
		/**
   * Constructor for "LocalBaseBlock" class
   * @param {Object} [parameters={}]
   * @property {Object} [idBlock]
   */
		function LocalIdentificationBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalIdentificationBlock);

			var _this3 = _possibleConstructorReturn(this, (LocalIdentificationBlock.__proto__ || Object.getPrototypeOf(LocalIdentificationBlock)).call(this));

			if ("idBlock" in parameters) {
				//region Properties from hexBlock class
				_this3.isHexOnly = getParametersValue(parameters.idBlock, "isHexOnly", false);
				_this3.valueHex = getParametersValue(parameters.idBlock, "valueHex", new ArrayBuffer(0));
				//endregion

				_this3.tagClass = getParametersValue(parameters.idBlock, "tagClass", -1);
				_this3.tagNumber = getParametersValue(parameters.idBlock, "tagNumber", -1);
				_this3.isConstructed = getParametersValue(parameters.idBlock, "isConstructed", false);
			} else {
				_this3.tagClass = -1;
				_this3.tagNumber = -1;
				_this3.isConstructed = false;
			}
			return _this3;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(LocalIdentificationBlock, [{
			key: "toBER",

			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				//region Initial variables
				var firstOctet = 0;
				var retBuf = void 0;
				var retView = void 0;
				//endregion

				switch (this.tagClass) {
					case 1:
						firstOctet |= 0x00; // UNIVERSAL
						break;
					case 2:
						firstOctet |= 0x40; // APPLICATION
						break;
					case 3:
						firstOctet |= 0x80; // CONTEXT-SPECIFIC
						break;
					case 4:
						firstOctet |= 0xC0; // PRIVATE
						break;
					default:
						this.error = "Unknown tag class";
						return new ArrayBuffer(0);
				}

				if (this.isConstructed) firstOctet |= 0x20;

				if (this.tagNumber < 31 && !this.isHexOnly) {
					retBuf = new ArrayBuffer(1);
					retView = new Uint8Array(retBuf);

					if (!sizeOnly) {
						var number = this.tagNumber;
						number &= 0x1F;
						firstOctet |= number;

						retView[0] = firstOctet;
					}

					return retBuf;
				}

				if (this.isHexOnly === false) {
					var encodedBuf = utilToBase(this.tagNumber, 7);
					var encodedView = new Uint8Array(encodedBuf);
					var size = encodedBuf.byteLength;

					retBuf = new ArrayBuffer(size + 1);
					retView = new Uint8Array(retBuf);
					retView[0] = firstOctet | 0x1F;

					if (!sizeOnly) {
						for (var i = 0; i < size - 1; i++) {
							retView[i + 1] = encodedView[i] | 0x80;
						}retView[size] = encodedView[size - 1];
					}

					return retBuf;
				}

				retBuf = new ArrayBuffer(this.valueHex.byteLength + 1);
				retView = new Uint8Array(retBuf);

				retView[0] = firstOctet | 0x1F;

				if (sizeOnly === false) {
					var curView = new Uint8Array(this.valueHex);

					for (var _i3 = 0; _i3 < curView.length - 1; _i3++) {
						retView[_i3 + 1] = curView[_i3] | 0x80;
					}retView[this.valueHex.byteLength] = curView[curView.length - 1];
				}

				return retBuf;
			}
			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number}
    */

		}, {
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				//region Basic check for parameters
				//noinspection JSCheckFunctionSignatures
				if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;
				//endregion

				//region Getting Uint8Array from ArrayBuffer
				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
				//endregion

				//region Initial checks
				if (intBuffer.length === 0) {
					this.error = "Zero buffer length";
					return -1;
				}
				//endregion

				//region Find tag class
				var tagClassMask = intBuffer[0] & 0xC0;

				switch (tagClassMask) {
					case 0x00:
						this.tagClass = 1; // UNIVERSAL
						break;
					case 0x40:
						this.tagClass = 2; // APPLICATION
						break;
					case 0x80:
						this.tagClass = 3; // CONTEXT-SPECIFIC
						break;
					case 0xC0:
						this.tagClass = 4; // PRIVATE
						break;
					default:
						this.error = "Unknown tag class";
						return -1;
				}
				//endregion

				//region Find it's constructed or not
				this.isConstructed = (intBuffer[0] & 0x20) === 0x20;
				//endregion

				//region Find tag number
				this.isHexOnly = false;

				var tagNumberMask = intBuffer[0] & 0x1F;

				//region Simple case (tag number < 31)
				if (tagNumberMask !== 0x1F) {
					this.tagNumber = tagNumberMask;
					this.blockLength = 1;
				}
				//endregion
				//region Tag number bigger or equal to 31
				else {
						var count = 1;

						this.valueHex = new ArrayBuffer(255);
						var tagNumberBufferMaxLength = 255;
						var intTagNumberBuffer = new Uint8Array(this.valueHex);

						//noinspection JSBitwiseOperatorUsage
						while (intBuffer[count] & 0x80) {
							intTagNumberBuffer[count - 1] = intBuffer[count] & 0x7F;
							count++;

							if (count >= intBuffer.length) {
								this.error = "End of input reached before message was fully decoded";
								return -1;
							}

							//region In case if tag number length is greater than 255 bytes (rare but possible case)
							if (count === tagNumberBufferMaxLength) {
								tagNumberBufferMaxLength += 255;

								var _tempBuffer = new ArrayBuffer(tagNumberBufferMaxLength);
								var _tempBufferView = new Uint8Array(_tempBuffer);

								for (var i = 0; i < intTagNumberBuffer.length; i++) {
									_tempBufferView[i] = intTagNumberBuffer[i];
								}this.valueHex = new ArrayBuffer(tagNumberBufferMaxLength);
								intTagNumberBuffer = new Uint8Array(this.valueHex);
							}
							//endregion
						}

						this.blockLength = count + 1;
						intTagNumberBuffer[count - 1] = intBuffer[count] & 0x7F; // Write last byte to buffer

						//region Cut buffer
						var tempBuffer = new ArrayBuffer(count);
						var tempBufferView = new Uint8Array(tempBuffer);

						for (var _i4 = 0; _i4 < count; _i4++) {
							tempBufferView[_i4] = intTagNumberBuffer[_i4];
						}this.valueHex = new ArrayBuffer(count);
						intTagNumberBuffer = new Uint8Array(this.valueHex);
						intTagNumberBuffer.set(tempBufferView);
						//endregion

						//region Try to convert long tag number to short form
						if (this.blockLength <= 9) this.tagNumber = utilFromBase(intTagNumberBuffer, 7);else {
							this.isHexOnly = true;
							this.warnings.push("Tag too long, represented as hex-coded");
						}
						//endregion
					}
				//endregion
				//endregion

				//region Check if constructed encoding was using for primitive type
				if (this.tagClass === 1 && this.isConstructed) {
					switch (this.tagNumber) {
						case 1: // Boolean
						case 2: // REAL
						case 5: // Null
						case 6: // OBJECT IDENTIFIER
						case 9: // REAL
						case 14: // Time
						case 23:
						case 24:
						case 31:
						case 32:
						case 33:
						case 34:
							this.error = "Constructed encoding used for primitive type";
							return -1;
						default:
					}
				}
				//endregion

				return inputOffset + this.blockLength; // Return current offset in input buffer
			}
			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {{blockName: string,
    *  tagClass: number,
    *  tagNumber: number,
    *  isConstructed: boolean,
    *  isHexOnly: boolean,
    *  valueHex: ArrayBuffer,
    *  blockLength: number,
    *  error: string, warnings: Array.<string>,
    *  valueBeforeDecode: string}}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalIdentificationBlock.prototype.__proto__ || Object.getPrototypeOf(LocalIdentificationBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.blockName = this.constructor.blockName();
				object.tagClass = this.tagClass;
				object.tagNumber = this.tagNumber;
				object.isConstructed = this.isConstructed;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "identificationBlock";
			}
		}]);

		return LocalIdentificationBlock;
	}(LocalHexBlock(LocalBaseBlock));
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of length block class
	//**************************************************************************************


	var LocalLengthBlock = function (_LocalBaseBlock) {
		_inherits(LocalLengthBlock, _LocalBaseBlock);

		//**********************************************************************************
		/**
   * Constructor for "LocalLengthBlock" class
   * @param {Object} [parameters={}]
   * @property {Object} [lenBlock]
   */
		function LocalLengthBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalLengthBlock);

			var _this4 = _possibleConstructorReturn(this, (LocalLengthBlock.__proto__ || Object.getPrototypeOf(LocalLengthBlock)).call(this));

			if ("lenBlock" in parameters) {
				_this4.isIndefiniteForm = getParametersValue(parameters.lenBlock, "isIndefiniteForm", false);
				_this4.longFormUsed = getParametersValue(parameters.lenBlock, "longFormUsed", false);
				_this4.length = getParametersValue(parameters.lenBlock, "length", 0);
			} else {
				_this4.isIndefiniteForm = false;
				_this4.longFormUsed = false;
				_this4.length = 0;
			}
			return _this4;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(LocalLengthBlock, [{
			key: "fromBER",

			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number}
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				//region Basic check for parameters
				//noinspection JSCheckFunctionSignatures
				if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;
				//endregion

				//region Getting Uint8Array from ArrayBuffer
				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
				//endregion

				//region Initial checks
				if (intBuffer.length === 0) {
					this.error = "Zero buffer length";
					return -1;
				}

				if (intBuffer[0] === 0xFF) {
					this.error = "Length block 0xFF is reserved by standard";
					return -1;
				}
				//endregion

				//region Check for length form type
				this.isIndefiniteForm = intBuffer[0] === 0x80;
				//endregion

				//region Stop working in case of indefinite length form
				if (this.isIndefiniteForm === true) {
					this.blockLength = 1;
					return inputOffset + this.blockLength;
				}
				//endregion

				//region Check is long form of length encoding using
				this.longFormUsed = !!(intBuffer[0] & 0x80);
				//endregion

				//region Stop working in case of short form of length value
				if (this.longFormUsed === false) {
					this.length = intBuffer[0];
					this.blockLength = 1;
					return inputOffset + this.blockLength;
				}
				//endregion

				//region Calculate length value in case of long form
				var count = intBuffer[0] & 0x7F;

				if (count > 8) // Too big length value
					{
						this.error = "Too big integer";
						return -1;
					}

				if (count + 1 > intBuffer.length) {
					this.error = "End of input reached before message was fully decoded";
					return -1;
				}

				var lengthBufferView = new Uint8Array(count);

				for (var i = 0; i < count; i++) {
					lengthBufferView[i] = intBuffer[i + 1];
				}if (lengthBufferView[count - 1] === 0x00) this.warnings.push("Needlessly long encoded length");

				this.length = utilFromBase(lengthBufferView, 8);

				if (this.longFormUsed && this.length <= 127) this.warnings.push("Unneccesary usage of long length form");

				this.blockLength = count + 1;
				//endregion

				return inputOffset + this.blockLength; // Return current offset in input buffer
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				//region Initial variables
				var retBuf = void 0;
				var retView = void 0;
				//endregion

				if (this.length > 127) this.longFormUsed = true;

				if (this.isIndefiniteForm) {
					retBuf = new ArrayBuffer(1);

					if (sizeOnly === false) {
						retView = new Uint8Array(retBuf);
						retView[0] = 0x80;
					}

					return retBuf;
				}

				if (this.longFormUsed === true) {
					var encodedBuf = utilToBase(this.length, 8);

					if (encodedBuf.byteLength > 127) {
						this.error = "Too big length";
						return new ArrayBuffer(0);
					}

					retBuf = new ArrayBuffer(encodedBuf.byteLength + 1);

					if (sizeOnly === true) return retBuf;

					var encodedView = new Uint8Array(encodedBuf);
					retView = new Uint8Array(retBuf);

					retView[0] = encodedBuf.byteLength | 0x80;

					for (var i = 0; i < encodedBuf.byteLength; i++) {
						retView[i + 1] = encodedView[i];
					}return retBuf;
				}

				retBuf = new ArrayBuffer(1);

				if (sizeOnly === false) {
					retView = new Uint8Array(retBuf);

					retView[0] = this.length;
				}

				return retBuf;
			}
			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalLengthBlock.prototype.__proto__ || Object.getPrototypeOf(LocalLengthBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.blockName = this.constructor.blockName();
				object.isIndefiniteForm = this.isIndefiniteForm;
				object.longFormUsed = this.longFormUsed;
				object.length = this.length;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "lengthBlock";
			}
		}]);

		return LocalLengthBlock;
	}(LocalBaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of value block class
	//**************************************************************************************


	var LocalValueBlock = function (_LocalBaseBlock2) {
		_inherits(LocalValueBlock, _LocalBaseBlock2);

		//**********************************************************************************
		/**
   * Constructor for "LocalValueBlock" class
   * @param {Object} [parameters={}]
   */
		function LocalValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalValueBlock);

			//region Do not let a user to create abstract class
			if (new.target === LocalValueBlock) throw TypeError("new of abstract class \"LocalValueBlock\"");
			//endregion

			return _possibleConstructorReturn(this, (LocalValueBlock.__proto__ || Object.getPrototypeOf(LocalValueBlock)).call(this, parameters));
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(LocalValueBlock, [{
			key: "fromBER",

			//**********************************************************************************
			//noinspection JSUnusedLocalSymbols,JSUnusedLocalSymbols,JSUnusedLocalSymbols
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number}
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				//region Throw an exception for a function which needs to be specified in extended classes
				throw TypeError("User need to make a specific function in a class which extends \"LocalValueBlock\"");
				//endregion
			}
			//**********************************************************************************
			//noinspection JSUnusedLocalSymbols
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				//region Throw an exception for a function which needs to be specified in extended classes
				throw TypeError("User need to make a specific function in a class which extends \"LocalValueBlock\"");
				//endregion
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "valueBlock";
			}
		}]);

		return LocalValueBlock;
	}(LocalBaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of basic ASN.1 block class
	//**************************************************************************************


	var BaseBlock = function (_LocalBaseBlock3) {
		_inherits(BaseBlock, _LocalBaseBlock3);

		//**********************************************************************************
		/**
   * Constructor for "BaseBlock" class
   * @param {Object} [parameters={}]
   * @property {Object} [primitiveSchema]
   * @property {string} [name]
   * @property {boolean} [optional]
   * @param valueBlockType Type of value block
   */
		function BaseBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			var valueBlockType = arguments.length <= 1 || arguments[1] === undefined ? LocalValueBlock : arguments[1];

			_classCallCheck(this, BaseBlock);

			var _this6 = _possibleConstructorReturn(this, (BaseBlock.__proto__ || Object.getPrototypeOf(BaseBlock)).call(this, parameters));

			if ("name" in parameters) _this6.name = parameters.name;
			if ("optional" in parameters) _this6.optional = parameters.optional;
			if ("primitiveSchema" in parameters) _this6.primitiveSchema = parameters.primitiveSchema;

			_this6.idBlock = new LocalIdentificationBlock(parameters);
			_this6.lenBlock = new LocalLengthBlock(parameters);
			_this6.valueBlock = new valueBlockType(parameters);
			return _this6;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(BaseBlock, [{
			key: "fromBER",

			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number}
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				var retBuf = void 0;

				var idBlockBuf = this.idBlock.toBER(sizeOnly);
				var valueBlockSizeBuf = this.valueBlock.toBER(true);

				this.lenBlock.length = valueBlockSizeBuf.byteLength;
				var lenBlockBuf = this.lenBlock.toBER(sizeOnly);

				retBuf = utilConcatBuf(idBlockBuf, lenBlockBuf);

				var valueBlockBuf = void 0;

				if (sizeOnly === false) valueBlockBuf = this.valueBlock.toBER(sizeOnly);else valueBlockBuf = new ArrayBuffer(this.lenBlock.length);

				retBuf = utilConcatBuf(retBuf, valueBlockBuf);

				if (this.lenBlock.isIndefiniteForm === true) {
					var indefBuf = new ArrayBuffer(2);

					if (sizeOnly === false) {
						var indefView = new Uint8Array(indefBuf);

						indefView[0] = 0x00;
						indefView[1] = 0x00;
					}

					retBuf = utilConcatBuf(retBuf, indefBuf);
				}

				return retBuf;
			}
			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(BaseBlock.prototype.__proto__ || Object.getPrototypeOf(BaseBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.idBlock = this.idBlock.toJSON();
				object.lenBlock = this.lenBlock.toJSON();
				object.valueBlock = this.valueBlock.toJSON();

				if ("name" in this) object.name = this.name;
				if ("optional" in this) object.optional = this.optional;
				if ("primitiveSchema" in this) object.primitiveSchema = this.primitiveSchema.toJSON();

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "BaseBlock";
			}
		}]);

		return BaseBlock;
	}(LocalBaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of basic block for all PRIMITIVE types
	//**************************************************************************************


	var LocalPrimitiveValueBlock = function (_LocalValueBlock) {
		_inherits(LocalPrimitiveValueBlock, _LocalValueBlock);

		//**********************************************************************************
		/**
   * Constructor for "LocalPrimitiveValueBlock" class
   * @param {Object} [parameters={}]
   * @property {ArrayBuffer} [valueBeforeDecode]
   */
		function LocalPrimitiveValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalPrimitiveValueBlock);

			//region Variables from "hexBlock" class
			var _this7 = _possibleConstructorReturn(this, (LocalPrimitiveValueBlock.__proto__ || Object.getPrototypeOf(LocalPrimitiveValueBlock)).call(this, parameters));

			if ("valueHex" in parameters) _this7.valueHex = parameters.valueHex.slice(0);else _this7.valueHex = new ArrayBuffer(0);

			_this7.isHexOnly = getParametersValue(parameters, "isHexOnly", true);
			//endregion
			return _this7;
		}
		//**********************************************************************************
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number}
   */


		_createClass(LocalPrimitiveValueBlock, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				//region Basic check for parameters
				//noinspection JSCheckFunctionSignatures
				if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;
				//endregion

				//region Getting Uint8Array from ArrayBuffer
				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
				//endregion

				//region Initial checks
				if (intBuffer.length === 0) {
					this.warnings.push("Zero buffer length");
					return inputOffset;
				}
				//endregion

				//region Copy input buffer into internal buffer
				this.valueHex = new ArrayBuffer(intBuffer.length);
				var valueHexView = new Uint8Array(this.valueHex);

				for (var i = 0; i < intBuffer.length; i++) {
					valueHexView[i] = intBuffer[i];
				} //endregion

				this.blockLength = inputLength;

				return inputOffset + inputLength;
			}
			//**********************************************************************************
			//noinspection JSUnusedLocalSymbols
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				return this.valueHex.slice(0);
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}, {
			key: "toJSON",

			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalPrimitiveValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalPrimitiveValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.valueHex = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);
				object.isHexOnly = this.isHexOnly;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "PrimitiveValueBlock";
			}
		}]);

		return LocalPrimitiveValueBlock;
	}(LocalValueBlock);
	//**************************************************************************************


	var Primitive = function (_BaseBlock) {
		_inherits(Primitive, _BaseBlock);

		//**********************************************************************************
		/**
   * Constructor for "Primitive" class
   * @param {Object} [parameters={}]
   * @property {ArrayBuffer} [valueHex]
   */
		function Primitive() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Primitive);

			var _this8 = _possibleConstructorReturn(this, (Primitive.__proto__ || Object.getPrototypeOf(Primitive)).call(this, parameters, LocalPrimitiveValueBlock));

			_this8.idBlock.isConstructed = false;
			return _this8;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(Primitive, null, [{
			key: "blockName",
			value: function blockName() {
				return "PRIMITIVE";
			}
			//**********************************************************************************

		}]);

		return Primitive;
	}(BaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of basic block for all CONSTRUCTED types
	//**************************************************************************************


	var LocalConstructedValueBlock = function (_LocalValueBlock2) {
		_inherits(LocalConstructedValueBlock, _LocalValueBlock2);

		//**********************************************************************************
		/**
   * Constructor for "LocalConstructedValueBlock" class
   * @param {Object} [parameters={}]
   */
		function LocalConstructedValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalConstructedValueBlock);

			var _this9 = _possibleConstructorReturn(this, (LocalConstructedValueBlock.__proto__ || Object.getPrototypeOf(LocalConstructedValueBlock)).call(this, parameters));

			_this9.value = getParametersValue(parameters, "value", []);
			_this9.isIndefiniteForm = getParametersValue(parameters, "isIndefiniteForm", false);
			return _this9;
		}
		//**********************************************************************************
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number}
   */


		_createClass(LocalConstructedValueBlock, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				//region Store initial offset and length
				var initialOffset = inputOffset;
				var initialLength = inputLength;
				//endregion

				//region Basic check for parameters
				//noinspection JSCheckFunctionSignatures
				if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;
				//endregion

				//region Getting Uint8Array from ArrayBuffer
				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
				//endregion

				//region Initial checks
				if (intBuffer.length === 0) {
					this.warnings.push("Zero buffer length");
					return inputOffset;
				}
				//endregion

				//region Aux function
				function checkLen(indefiniteLength, length) {
					if (indefiniteLength === true) return 1;

					return length;
				}
				//endregion

				var currentOffset = inputOffset;

				while (checkLen(this.isIndefiniteForm, inputLength) > 0) {
					var returnObject = LocalFromBER(inputBuffer, currentOffset, inputLength);
					if (returnObject.offset === -1) {
						this.error = returnObject.result.error;
						this.warnings.concat(returnObject.result.warnings);
						return -1;
					}

					currentOffset = returnObject.offset;

					this.blockLength += returnObject.result.blockLength;
					inputLength -= returnObject.result.blockLength;

					this.value.push(returnObject.result);

					if (this.isIndefiniteForm === true && returnObject.result.constructor.blockName() === EndOfContent.blockName()) break;
				}

				if (this.isIndefiniteForm === true) {
					if (this.value[this.value.length - 1].constructor.blockName() === EndOfContent.blockName()) this.value.pop();else this.warnings.push("No EndOfContent block encoded");
				}

				//region Copy "inputBuffer" to "valueBeforeDecode"
				this.valueBeforeDecode = inputBuffer.slice(initialOffset, initialOffset + initialLength);
				//endregion

				return currentOffset;
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				var retBuf = new ArrayBuffer(0);

				for (var i = 0; i < this.value.length; i++) {
					var valueBuf = this.value[i].toBER(sizeOnly);
					retBuf = utilConcatBuf(retBuf, valueBuf);
				}

				return retBuf;
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}, {
			key: "toJSON",

			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalConstructedValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalConstructedValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.isIndefiniteForm = this.isIndefiniteForm;
				object.value = [];
				for (var i = 0; i < this.value.length; i++) {
					object.value.push(this.value[i].toJSON());
				}return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "ConstructedValueBlock";
			}
		}]);

		return LocalConstructedValueBlock;
	}(LocalValueBlock);
	//**************************************************************************************


	var Constructed = function (_BaseBlock2) {
		_inherits(Constructed, _BaseBlock2);

		//**********************************************************************************
		/**
   * Constructor for "Constructed" class
   * @param {Object} [parameters={}]
   */
		function Constructed() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Constructed);

			var _this10 = _possibleConstructorReturn(this, (Constructed.__proto__ || Object.getPrototypeOf(Constructed)).call(this, parameters, LocalConstructedValueBlock));

			_this10.idBlock.isConstructed = true;
			return _this10;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(Constructed, [{
			key: "fromBER",

			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number}
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm;

				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "CONSTRUCTED";
			}
		}]);

		return Constructed;
	}(BaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of ASN.1 EndOfContent type class
	//**************************************************************************************


	var LocalEndOfContentValueBlock = function (_LocalValueBlock3) {
		_inherits(LocalEndOfContentValueBlock, _LocalValueBlock3);

		//**********************************************************************************
		/**
   * Constructor for "LocalEndOfContentValueBlock" class
   * @param {Object} [parameters={}]
   */
		function LocalEndOfContentValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalEndOfContentValueBlock);

			return _possibleConstructorReturn(this, (LocalEndOfContentValueBlock.__proto__ || Object.getPrototypeOf(LocalEndOfContentValueBlock)).call(this, parameters));
		}
		//**********************************************************************************
		//noinspection JSUnusedLocalSymbols,JSUnusedLocalSymbols
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number}
   */


		_createClass(LocalEndOfContentValueBlock, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				//region There is no "value block" for EndOfContent type and we need to return the same offset
				return inputOffset;
				//endregion
			}
			//**********************************************************************************
			//noinspection JSUnusedLocalSymbols
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				return new ArrayBuffer(0);
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}], [{
			key: "blockName",
			value: function blockName() {
				return "EndOfContentValueBlock";
			}
			//**********************************************************************************

		}]);

		return LocalEndOfContentValueBlock;
	}(LocalValueBlock);
	//**************************************************************************************


	var EndOfContent = function (_BaseBlock3) {
		_inherits(EndOfContent, _BaseBlock3);

		//**********************************************************************************
		function EndOfContent() {
			var paramaters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, EndOfContent);

			var _this12 = _possibleConstructorReturn(this, (EndOfContent.__proto__ || Object.getPrototypeOf(EndOfContent)).call(this, paramaters, LocalEndOfContentValueBlock));

			_this12.idBlock.tagClass = 1; // UNIVERSAL
			_this12.idBlock.tagNumber = 0; // EndOfContent
			return _this12;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(EndOfContent, null, [{
			key: "blockName",
			value: function blockName() {
				return "EndOfContent";
			}
			//**********************************************************************************

		}]);

		return EndOfContent;
	}(BaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of ASN.1 Boolean type class
	//**************************************************************************************


	var LocalBooleanValueBlock = function (_LocalValueBlock4) {
		_inherits(LocalBooleanValueBlock, _LocalValueBlock4);

		//**********************************************************************************
		/**
   * Constructor for "LocalBooleanValueBlock" class
   * @param {Object} [parameters={}]
   */
		function LocalBooleanValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalBooleanValueBlock);

			var _this13 = _possibleConstructorReturn(this, (LocalBooleanValueBlock.__proto__ || Object.getPrototypeOf(LocalBooleanValueBlock)).call(this, parameters));

			_this13.value = getParametersValue(parameters, "value", false);
			_this13.isHexOnly = getParametersValue(parameters, "isHexOnly", false);

			if ("valueHex" in parameters) _this13.valueHex = parameters.valueHex.slice(0);else {
				_this13.valueHex = new ArrayBuffer(1);
				if (_this13.value === true) {
					var view = new Uint8Array(_this13.valueHex);
					view[0] = 0xFF;
				}
			}
			return _this13;
		}
		//**********************************************************************************
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number} Offset after least decoded byte
   */


		_createClass(LocalBooleanValueBlock, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				//region Basic check for parameters
				//noinspection JSCheckFunctionSignatures
				if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;
				//endregion

				//region Getting Uint8Array from ArrayBuffer
				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
				//endregion

				if (inputLength > 1) this.warnings.push("Boolean value encoded in more then 1 octet");

				this.value = intBuffer[0] !== 0x00;

				this.isHexOnly = true;

				//region Copy input buffer to internal array
				this.valueHex = new ArrayBuffer(intBuffer.length);
				var view = new Uint8Array(this.valueHex);

				for (var i = 0; i < intBuffer.length; i++) {
					view[i] = intBuffer[i];
				} //endregion

				this.blockLength = inputLength;

				return inputOffset + inputLength;
			}
			//**********************************************************************************
			//noinspection JSUnusedLocalSymbols
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				return this.valueHex;
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}, {
			key: "toJSON",

			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalBooleanValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalBooleanValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.value = this.value;
				object.isHexOnly = this.isHexOnly;
				object.valueHex = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "BooleanValueBlock";
			}
		}]);

		return LocalBooleanValueBlock;
	}(LocalValueBlock);
	//**************************************************************************************


	var Boolean = function (_BaseBlock4) {
		_inherits(Boolean, _BaseBlock4);

		//**********************************************************************************
		/**
   * Constructor for "Boolean" class
   * @param {Object} [parameters={}]
   */
		function Boolean() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Boolean);

			var _this14 = _possibleConstructorReturn(this, (Boolean.__proto__ || Object.getPrototypeOf(Boolean)).call(this, parameters, LocalBooleanValueBlock));

			_this14.idBlock.tagClass = 1; // UNIVERSAL
			_this14.idBlock.tagNumber = 1; // Boolean
			return _this14;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(Boolean, null, [{
			key: "blockName",
			value: function blockName() {
				return "Boolean";
			}
			//**********************************************************************************

		}]);

		return Boolean;
	}(BaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of ASN.1 Sequence and Set type classes
	//**************************************************************************************


	var Sequence = function (_Constructed) {
		_inherits(Sequence, _Constructed);

		//**********************************************************************************
		/**
   * Constructor for "Sequence" class
   * @param {Object} [parameters={}]
   */
		function Sequence() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Sequence);

			var _this15 = _possibleConstructorReturn(this, (Sequence.__proto__ || Object.getPrototypeOf(Sequence)).call(this, parameters));

			_this15.idBlock.tagClass = 1; // UNIVERSAL
			_this15.idBlock.tagNumber = 16; // Sequence
			return _this15;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(Sequence, null, [{
			key: "blockName",
			value: function blockName() {
				return "Sequence";
			}
			//**********************************************************************************

		}]);

		return Sequence;
	}(Constructed);
	//**************************************************************************************


	var Set = function (_Constructed2) {
		_inherits(Set, _Constructed2);

		//**********************************************************************************
		/**
   * Constructor for "Set" class
   * @param {Object} [parameters={}]
   */
		function Set() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Set);

			var _this16 = _possibleConstructorReturn(this, (Set.__proto__ || Object.getPrototypeOf(Set)).call(this, parameters));

			_this16.idBlock.tagClass = 1; // UNIVERSAL
			_this16.idBlock.tagNumber = 17; // Set
			return _this16;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(Set, null, [{
			key: "blockName",
			value: function blockName() {
				return "Set";
			}
			//**********************************************************************************

		}]);

		return Set;
	}(Constructed);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of ASN.1 Null type class
	//**************************************************************************************


	var Null = function (_BaseBlock5) {
		_inherits(Null, _BaseBlock5);

		//**********************************************************************************
		/**
   * Constructor for "Null" class
   * @param {Object} [parameters={}]
   */
		function Null() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Null);

			// We will not have a call to "Null value block" because of specified "fromBER" and "toBER" functions

			var _this17 = _possibleConstructorReturn(this, (Null.__proto__ || Object.getPrototypeOf(Null)).call(this, parameters, LocalBaseBlock));

			_this17.idBlock.tagClass = 1; // UNIVERSAL
			_this17.idBlock.tagNumber = 5; // Null
			return _this17;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(Null, [{
			key: "fromBER",

			//**********************************************************************************
			//noinspection JSUnusedLocalSymbols
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number} Offset after least decoded byte
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				if (this.lenBlock.length > 0) this.warnings.push("Non-zero length of value block for Null type");

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				this.blockLength += inputLength;

				return inputOffset + inputLength;
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				var retBuf = new ArrayBuffer(2);

				if (sizeOnly === true) return retBuf;

				var retView = new Uint8Array(retBuf);
				retView[0] = 0x05;
				retView[1] = 0x00;

				return retBuf;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "Null";
			}
		}]);

		return Null;
	}(BaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of ASN.1 OctetString type class
	//**************************************************************************************


	var LocalOctetStringValueBlock = function (_LocalHexBlock2) {
		_inherits(LocalOctetStringValueBlock, _LocalHexBlock2);

		//**********************************************************************************
		/**
   * Constructor for "LocalOctetStringValueBlock" class
   * @param {Object} [parameters={}]
   * @property {ArrayBuffer} [valueHex]
   */
		function LocalOctetStringValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalOctetStringValueBlock);

			var _this18 = _possibleConstructorReturn(this, (LocalOctetStringValueBlock.__proto__ || Object.getPrototypeOf(LocalOctetStringValueBlock)).call(this, parameters));

			_this18.isConstructed = getParametersValue(parameters, "isConstructed", false);
			return _this18;
		}
		//**********************************************************************************
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number} Offset after least decoded byte
   */


		_createClass(LocalOctetStringValueBlock, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = 0;

				if (this.isConstructed === true) {
					this.isHexOnly = false;

					resultOffset = LocalConstructedValueBlock.prototype.fromBER.call(this, inputBuffer, inputOffset, inputLength);
					if (resultOffset === -1) return resultOffset;

					for (var i = 0; i < this.value.length; i++) {
						var currentBlockName = this.value[i].constructor.blockName();

						if (currentBlockName === EndOfContent.blockName()) {
							if (this.isIndefiniteForm === true) break;else {
								this.error = "EndOfContent is unexpected, OCTET STRING may consists of OCTET STRINGs only";
								return -1;
							}
						}

						if (currentBlockName !== OctetString.blockName()) {
							this.error = "OCTET STRING may consists of OCTET STRINGs only";
							return -1;
						}
					}
				} else {
					this.isHexOnly = true;

					resultOffset = _get(LocalOctetStringValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalOctetStringValueBlock.prototype), "fromBER", this).call(this, inputBuffer, inputOffset, inputLength);
					this.blockLength = inputLength;
				}

				return resultOffset;
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				if (this.isConstructed === true) return LocalConstructedValueBlock.prototype.toBER.call(this, sizeOnly);

				var retBuf = new ArrayBuffer(this.valueHex.byteLength);

				if (sizeOnly === true) return retBuf;

				if (this.valueHex.byteLength === 0) return retBuf;

				retBuf = this.valueHex.slice(0);

				return retBuf;
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}, {
			key: "toJSON",

			//**********************************************************************************
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalOctetStringValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalOctetStringValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.isConstructed = this.isConstructed;
				object.isHexOnly = this.isHexOnly;
				object.valueHex = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "OctetStringValueBlock";
			}
		}]);

		return LocalOctetStringValueBlock;
	}(LocalHexBlock(LocalConstructedValueBlock));
	//**************************************************************************************


	var OctetString = function (_BaseBlock6) {
		_inherits(OctetString, _BaseBlock6);

		//**********************************************************************************
		/**
   * Constructor for "OctetString" class
   * @param {Object} [parameters={}]
   */
		function OctetString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, OctetString);

			var _this19 = _possibleConstructorReturn(this, (OctetString.__proto__ || Object.getPrototypeOf(OctetString)).call(this, parameters, LocalOctetStringValueBlock));

			_this19.idBlock.tagClass = 1; // UNIVERSAL
			_this19.idBlock.tagNumber = 4; // OctetString
			return _this19;
		}
		//**********************************************************************************
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number} Offset after least decoded byte
   */


		_createClass(OctetString, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				this.valueBlock.isConstructed = this.idBlock.isConstructed;
				this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm;

				//region Ability to encode empty OCTET STRING
				if (inputLength === 0) {
					if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

					if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

					return inputOffset;
				}
				//endregion

				return _get(OctetString.prototype.__proto__ || Object.getPrototypeOf(OctetString.prototype), "fromBER", this).call(this, inputBuffer, inputOffset, inputLength);
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}, {
			key: "isEqual",

			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Checking that two OCTETSTRINGs are equal
    * @param {OctetString} octetString
    */
			value: function isEqual(octetString) {
				//region Check input type
				if (octetString instanceof OctetString === false) return false;
				//endregion

				//region Compare two JSON strings
				if (JSON.stringify(this) !== JSON.stringify(octetString)) return false;
				//endregion

				return true;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "OctetString";
			}
		}]);

		return OctetString;
	}(BaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of ASN.1 BitString type class
	//**************************************************************************************


	var LocalBitStringValueBlock = function (_LocalHexBlock3) {
		_inherits(LocalBitStringValueBlock, _LocalHexBlock3);

		//**********************************************************************************
		/**
   * Constructor for "LocalBitStringValueBlock" class
   * @param {Object} [parameters={}]
   * @property {ArrayBuffer} [valueHex]
   */
		function LocalBitStringValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalBitStringValueBlock);

			var _this20 = _possibleConstructorReturn(this, (LocalBitStringValueBlock.__proto__ || Object.getPrototypeOf(LocalBitStringValueBlock)).call(this, parameters));

			_this20.unusedBits = getParametersValue(parameters, "unusedBits", 0);
			_this20.isConstructed = getParametersValue(parameters, "isConstructed", false);
			_this20.blockLength = _this20.valueHex.byteLength + 1; // "+1" for "unusedBits"
			return _this20;
		}
		//**********************************************************************************
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number} Offset after least decoded byte
   */


		_createClass(LocalBitStringValueBlock, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				//region Ability to decode zero-length BitString value
				if (inputLength === 0) return inputOffset;
				//endregion

				var resultOffset = -1;

				//region If the BISTRING supposed to be a constructed value
				if (this.isConstructed === true) {
					resultOffset = LocalConstructedValueBlock.prototype.fromBER.call(this, inputBuffer, inputOffset, inputLength);
					if (resultOffset === -1) return resultOffset;

					for (var i = 0; i < this.value.length; i++) {
						var currentBlockName = this.value[i].constructor.blockName();

						if (currentBlockName === EndOfContent.blockName()) {
							if (this.isIndefiniteForm === true) break;else {
								this.error = "EndOfContent is unexpected, BIT STRING may consists of BIT STRINGs only";
								return -1;
							}
						}

						if (currentBlockName !== BitString.blockName()) {
							this.error = "BIT STRING may consists of BIT STRINGs only";
							return -1;
						}

						if (this.unusedBits > 0 && this.value[i].unusedBits > 0) {
							this.error = "Usign of \"unused bits\" inside constructive BIT STRING allowed for least one only";
							return -1;
						}

						this.unusedBits = this.value[i].unusedBits;
						if (this.unusedBits > 7) {
							this.error = "Unused bits for BitString must be in range 0-7";
							return -1;
						}
					}

					return resultOffset;
				}
				//endregion
				//region If the BitString supposed to be a primitive value
				//region Basic check for parameters
				//noinspection JSCheckFunctionSignatures
				if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;
				//endregion

				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

				this.unusedBits = intBuffer[0];
				if (this.unusedBits > 7) {
					this.error = "Unused bits for BitString must be in range 0-7";
					return -1;
				}

				//region Copy input buffer to internal buffer
				this.valueHex = new ArrayBuffer(intBuffer.length - 1);
				var view = new Uint8Array(this.valueHex);
				for (var _i5 = 0; _i5 < inputLength - 1; _i5++) {
					view[_i5] = intBuffer[_i5 + 1];
				} //endregion

				this.blockLength = intBuffer.length;

				return inputOffset + inputLength;
				//endregion
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				if (this.isConstructed === true) return LocalConstructedValueBlock.prototype.toBER.call(this, sizeOnly);

				if (sizeOnly === true) return new ArrayBuffer(this.valueHex.byteLength + 1);

				if (this.valueHex.byteLength === 0) return new ArrayBuffer(0);

				var curView = new Uint8Array(this.valueHex);

				var retBuf = new ArrayBuffer(this.valueHex.byteLength + 1);
				var retView = new Uint8Array(retBuf);

				retView[0] = this.unusedBits;

				for (var i = 0; i < this.valueHex.byteLength; i++) {
					retView[i + 1] = curView[i];
				}return retBuf;
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}, {
			key: "toJSON",

			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {{blockName, blockLength, error, warnings, valueBeforeDecode}|{blockName: string, blockLength: number, error: string, warnings: Array.<string>, valueBeforeDecode: string}}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalBitStringValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalBitStringValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.unusedBits = this.unusedBits;
				object.isConstructed = this.isConstructed;
				object.isHexOnly = this.isHexOnly;
				object.valueHex = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "BitStringValueBlock";
			}
		}]);

		return LocalBitStringValueBlock;
	}(LocalHexBlock(LocalConstructedValueBlock));
	//**************************************************************************************


	var BitString = function (_BaseBlock7) {
		_inherits(BitString, _BaseBlock7);

		//**********************************************************************************
		/**
   * Constructor for "BitString" class
   * @param {Object} [parameters={}]
   */
		function BitString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, BitString);

			var _this21 = _possibleConstructorReturn(this, (BitString.__proto__ || Object.getPrototypeOf(BitString)).call(this, parameters, LocalBitStringValueBlock));

			_this21.idBlock.tagClass = 1; // UNIVERSAL
			_this21.idBlock.tagNumber = 3; // BitString
			return _this21;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(BitString, [{
			key: "fromBER",

			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number} Offset after least decoded byte
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				//region Ability to encode empty BitString
				if (inputLength === 0) return inputOffset;
				//endregion

				this.valueBlock.isConstructed = this.idBlock.isConstructed;
				this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm;

				return _get(BitString.prototype.__proto__ || Object.getPrototypeOf(BitString.prototype), "fromBER", this).call(this, inputBuffer, inputOffset, inputLength);
			}
			//**********************************************************************************
			/**
    * Checking that two BITSTRINGs are equal
    * @param {BitString} bitString
    */

		}, {
			key: "isEqual",
			value: function isEqual(bitString) {
				//region Check input type
				if (bitString instanceof BitString === false) return false;
				//endregion

				//region Compare two JSON strings
				if (JSON.stringify(this) !== JSON.stringify(bitString)) return false;
				//endregion

				return true;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "BitString";
			}
		}]);

		return BitString;
	}(BaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of ASN.1 Integer type class
	//**************************************************************************************
	/**
  * @extends LocalValueBlock
  */


	var LocalIntegerValueBlock = function (_LocalHexBlock4) {
		_inherits(LocalIntegerValueBlock, _LocalHexBlock4);

		//**********************************************************************************
		/**
   * Constructor for "LocalIntegerValueBlock" class
   * @param {Object} [parameters={}]
   * @property {ArrayBuffer} [valueHex]
   */
		function LocalIntegerValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalIntegerValueBlock);

			var _this22 = _possibleConstructorReturn(this, (LocalIntegerValueBlock.__proto__ || Object.getPrototypeOf(LocalIntegerValueBlock)).call(this, parameters));

			if ("value" in parameters) _this22.valueDec = parameters.value;
			return _this22;
		}
		//**********************************************************************************
		/**
   * Setter for "valueHex"
   * @param {ArrayBuffer} _value
   */


		_createClass(LocalIntegerValueBlock, [{
			key: "fromDER",

			//**********************************************************************************
			/**
    * Base function for converting block from DER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 DER encoded array
    * @param {!number} inputOffset Offset in ASN.1 DER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @param {number} [expectedLength=0] Expected length of converted "valueHex" buffer
    * @returns {number} Offset after least decoded byte
    */
			value: function fromDER(inputBuffer, inputOffset, inputLength) {
				var expectedLength = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

				var offset = this.fromBER(inputBuffer, inputOffset, inputLength);
				if (offset === -1) return offset;

				var view = new Uint8Array(this._valueHex);

				if (view[0] === 0x00 && (view[1] & 0x80) !== 0) {
					var updatedValueHex = new ArrayBuffer(this._valueHex.byteLength - 1);
					var updatedView = new Uint8Array(updatedValueHex);

					updatedView.set(new Uint8Array(this._valueHex, 1, this._valueHex.byteLength - 1));

					this._valueHex = updatedValueHex.slice(0);
				} else {
					if (expectedLength !== 0) {
						if (this._valueHex.byteLength < expectedLength) {
							if (expectedLength - this._valueHex.byteLength > 1) expectedLength = this._valueHex.byteLength + 1;

							var _updatedValueHex = new ArrayBuffer(expectedLength);
							var _updatedView = new Uint8Array(_updatedValueHex);

							_updatedView.set(view, expectedLength - this._valueHex.byteLength);

							this._valueHex = _updatedValueHex.slice(0);
						}
					}
				}

				return offset;
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (DER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toDER",
			value: function toDER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				var view = new Uint8Array(this._valueHex);

				switch (true) {
					case (view[0] & 0x80) !== 0:
						{
							var updatedValueHex = new ArrayBuffer(this._valueHex.byteLength + 1);
							var updatedView = new Uint8Array(updatedValueHex);

							updatedView[0] = 0x00;
							updatedView.set(view, 1);

							this._valueHex = updatedValueHex.slice(0);
						}
						break;
					case view[0] === 0x00 && (view[1] & 0x80) === 0:
						{
							var _updatedValueHex2 = new ArrayBuffer(this._valueHex.byteLength - 1);
							var _updatedView2 = new Uint8Array(_updatedValueHex2);

							_updatedView2.set(new Uint8Array(this._valueHex, 1, this._valueHex.byteLength - 1));

							this._valueHex = _updatedValueHex2.slice(0);
						}
						break;
					default:
				}

				return this.toBER(sizeOnly);
			}
			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number} Offset after least decoded byte
    */

		}, {
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = _get(LocalIntegerValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalIntegerValueBlock.prototype), "fromBER", this).call(this, inputBuffer, inputOffset, inputLength);
				if (resultOffset === -1) return resultOffset;

				this.blockLength = inputLength;

				return inputOffset + inputLength;
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				//noinspection JSCheckFunctionSignatures
				return this.valueHex.slice(0);
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}, {
			key: "toJSON",

			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Convertion for the block to JSON object
    * @returns {Object}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalIntegerValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalIntegerValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.valueDec = this.valueDec;

				return object;
			}
			//**********************************************************************************

		}, {
			key: "valueHex",
			set: function set(_value) {
				this._valueHex = _value.slice(0);

				if (_value.byteLength >= 4) {
					this.warnings.push("Too big Integer for decoding, hex only");
					this.isHexOnly = true;
					this._valueDec = 0;
				} else {
					this.isHexOnly = false;

					if (_value.byteLength > 0) this._valueDec = utilDecodeTC.call(this);
				}
			}
			//**********************************************************************************
			/**
    * Getter for "valueHex"
    * @returns {ArrayBuffer}
    */
			,
			get: function get() {
				return this._valueHex;
			}
			//**********************************************************************************
			/**
    * Getter for "valueDec"
    * @param {number} _value
    */

		}, {
			key: "valueDec",
			set: function set(_value) {
				this._valueDec = _value;

				this.isHexOnly = false;
				this._valueHex = utilEncodeTC(_value);
			}
			//**********************************************************************************
			/**
    * Getter for "valueDec"
    * @returns {number}
    */
			,
			get: function get() {
				return this._valueDec;
			}
		}], [{
			key: "blockName",
			value: function blockName() {
				return "IntegerValueBlock";
			}
		}]);

		return LocalIntegerValueBlock;
	}(LocalHexBlock(LocalValueBlock));
	//**************************************************************************************


	var Integer = function (_BaseBlock8) {
		_inherits(Integer, _BaseBlock8);

		//**********************************************************************************
		/**
   * Constructor for "Integer" class
   * @param {Object} [parameters={}]
   */
		function Integer() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Integer);

			var _this23 = _possibleConstructorReturn(this, (Integer.__proto__ || Object.getPrototypeOf(Integer)).call(this, parameters, LocalIntegerValueBlock));

			_this23.idBlock.tagClass = 1; // UNIVERSAL
			_this23.idBlock.tagNumber = 2; // Integer
			return _this23;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(Integer, [{
			key: "isEqual",

			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Compare two Integer object, or Integer and ArrayBuffer objects
    * @param {!Integer|ArrayBuffer} otherValue
    * @returns {boolean}
    */
			value: function isEqual(otherValue) {
				if (otherValue instanceof Integer) {
					if (this.valueBlock.isHexOnly && otherValue.valueBlock.isHexOnly) // Compare two ArrayBuffers
						return isEqualBuffer(this.valueBlock.valueHex, otherValue.valueBlock.valueHex);

					if (this.valueBlock.isHexOnly === otherValue.valueBlock.isHexOnly) return this.valueBlock.valueDec === otherValue.valueBlock.valueDec;

					return false;
				}

				if (otherValue instanceof ArrayBuffer) return isEqualBuffer(this.valueBlock.valueHex, otherValue);

				return false;
			}
			//**********************************************************************************
			/**
    * Convert current Integer value from BER into DER format
    * @returns {Integer}
    */

		}, {
			key: "convertToDER",
			value: function convertToDER() {
				var integer = new Integer({ valueHex: this.valueBlock.valueHex });
				integer.valueBlock.toDER();

				return integer;
			}
			//**********************************************************************************
			/**
    * Convert current Integer value from DER to BER format
    * @returns {Integer}
    */

		}, {
			key: "convertFromDER",
			value: function convertFromDER() {
				var expectedLength = Math.pow(2, nearestPowerOf2(this.valueBlock.valueHex.byteLength));
				var integer = new Integer({ valueHex: this.valueBlock.valueHex });
				integer.valueBlock.fromDER(integer.valueBlock.valueHex, 0, integer.valueBlock.valueHex.byteLength, expectedLength);

				return integer;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "Integer";
			}
		}]);

		return Integer;
	}(BaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of ASN.1 Enumerated type class
	//**************************************************************************************


	var Enumerated = function (_Integer) {
		_inherits(Enumerated, _Integer);

		//**********************************************************************************
		/**
   * Constructor for "Enumerated" class
   * @param {Object} [parameters={}]
   */
		function Enumerated() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Enumerated);

			var _this24 = _possibleConstructorReturn(this, (Enumerated.__proto__ || Object.getPrototypeOf(Enumerated)).call(this, parameters));

			_this24.idBlock.tagClass = 1; // UNIVERSAL
			_this24.idBlock.tagNumber = 10; // Enumerated
			return _this24;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(Enumerated, null, [{
			key: "blockName",
			value: function blockName() {
				return "Enumerated";
			}
			//**********************************************************************************

		}]);

		return Enumerated;
	}(Integer);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of ASN.1 ObjectIdentifier type class
	//**************************************************************************************


	var LocalSidValueBlock = function (_LocalHexBlock5) {
		_inherits(LocalSidValueBlock, _LocalHexBlock5);

		//**********************************************************************************
		/**
   * Constructor for "LocalSidValueBlock" class
   * @param {Object} [parameters={}]
   * @property {number} [valueDec]
   * @property {boolean} [isFirstSid]
   */
		function LocalSidValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalSidValueBlock);

			var _this25 = _possibleConstructorReturn(this, (LocalSidValueBlock.__proto__ || Object.getPrototypeOf(LocalSidValueBlock)).call(this, parameters));

			_this25.valueDec = getParametersValue(parameters, "valueDec", -1);
			_this25.isFirstSid = getParametersValue(parameters, "isFirstSid", false);
			return _this25;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(LocalSidValueBlock, [{
			key: "fromBER",

			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number} Offset after least decoded byte
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				if (inputLength === 0) return inputOffset;

				//region Basic check for parameters
				//noinspection JSCheckFunctionSignatures
				if (checkBufferParams(this, inputBuffer, inputOffset, inputLength) === false) return -1;
				//endregion

				var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);

				this.valueHex = new ArrayBuffer(inputLength);
				var view = new Uint8Array(this.valueHex);

				for (var i = 0; i < inputLength; i++) {
					view[i] = intBuffer[i] & 0x7F;

					this.blockLength++;

					if ((intBuffer[i] & 0x80) === 0x00) break;
				}

				//region Ajust size of valueHex buffer
				var tempValueHex = new ArrayBuffer(this.blockLength);
				var tempView = new Uint8Array(tempValueHex);

				for (var _i6 = 0; _i6 < this.blockLength; _i6++) {
					tempView[_i6] = view[_i6];
				} //noinspection JSCheckFunctionSignatures
				this.valueHex = tempValueHex.slice(0);
				view = new Uint8Array(this.valueHex);
				//endregion

				if ((intBuffer[this.blockLength - 1] & 0x80) !== 0x00) {
					this.error = "End of input reached before message was fully decoded";
					return -1;
				}

				if (view[0] === 0x00) this.warnings.push("Needlessly long format of SID encoding");

				if (this.blockLength <= 8) this.valueDec = utilFromBase(view, 7);else {
					this.isHexOnly = true;
					this.warnings.push("Too big SID for decoding, hex only");
				}

				return inputOffset + this.blockLength;
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				//region Initial variables
				var retBuf = void 0;
				var retView = void 0;
				//endregion

				if (this.isHexOnly) {
					if (sizeOnly === true) return new ArrayBuffer(this.valueHex.byteLength);

					var curView = new Uint8Array(this.valueHex);

					retBuf = new ArrayBuffer(this.blockLength);
					retView = new Uint8Array(retBuf);

					for (var i = 0; i < this.blockLength - 1; i++) {
						retView[i] = curView[i] | 0x80;
					}retView[this.blockLength - 1] = curView[this.blockLength - 1];

					return retBuf;
				}

				var encodedBuf = utilToBase(this.valueDec, 7);
				if (encodedBuf.byteLength === 0) {
					this.error = "Error during encoding SID value";
					return new ArrayBuffer(0);
				}

				retBuf = new ArrayBuffer(encodedBuf.byteLength);

				if (sizeOnly === false) {
					var encodedView = new Uint8Array(encodedBuf);
					retView = new Uint8Array(retBuf);

					for (var _i7 = 0; _i7 < encodedBuf.byteLength - 1; _i7++) {
						retView[_i7] = encodedView[_i7] | 0x80;
					}retView[encodedBuf.byteLength - 1] = encodedView[encodedBuf.byteLength - 1];
				}

				return retBuf;
			}
			//**********************************************************************************
			/**
    * Create string representation of current SID block
    * @returns {string}
    */

		}, {
			key: "toString",
			value: function toString() {
				var result = "";

				if (this.isHexOnly === true) result = bufferToHexCodes(this.valueHex, 0, this.valueHex.byteLength);else {
					if (this.isFirstSid) {
						var sidValue = this.valueDec;

						if (this.valueDec <= 39) result = "0.";else {
							if (this.valueDec <= 79) {
								result = "1.";
								sidValue -= 40;
							} else {
								result = "2.";
								sidValue -= 80;
							}
						}

						result = result + sidValue.toString();
					} else result = this.valueDec.toString();
				}

				return result;
			}
			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Convertion for the block to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalSidValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalSidValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.valueDec = this.valueDec;
				object.isFirstSid = this.isFirstSid;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "sidBlock";
			}
		}]);

		return LocalSidValueBlock;
	}(LocalHexBlock(LocalBaseBlock));
	//**************************************************************************************


	var LocalObjectIdentifierValueBlock = function (_LocalValueBlock5) {
		_inherits(LocalObjectIdentifierValueBlock, _LocalValueBlock5);

		//**********************************************************************************
		/**
   * Constructor for "LocalObjectIdentifierValueBlock" class
   * @param {Object} [parameters={}]
   * @property {ArrayBuffer} [valueHex]
   */
		function LocalObjectIdentifierValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalObjectIdentifierValueBlock);

			var _this26 = _possibleConstructorReturn(this, (LocalObjectIdentifierValueBlock.__proto__ || Object.getPrototypeOf(LocalObjectIdentifierValueBlock)).call(this, parameters));

			_this26.fromString(getParametersValue(parameters, "value", ""));
			return _this26;
		}
		//**********************************************************************************
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number} Offset after least decoded byte
   */


		_createClass(LocalObjectIdentifierValueBlock, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = inputOffset;

				while (inputLength > 0) {
					var sidBlock = new LocalSidValueBlock();
					resultOffset = sidBlock.fromBER(inputBuffer, resultOffset, inputLength);
					if (resultOffset === -1) {
						this.blockLength = 0;
						this.error = sidBlock.error;
						return resultOffset;
					}

					if (this.value.length === 0) sidBlock.isFirstSid = true;

					this.blockLength += sidBlock.blockLength;
					inputLength -= sidBlock.blockLength;

					this.value.push(sidBlock);
				}

				return resultOffset;
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				var retBuf = new ArrayBuffer(0);

				for (var i = 0; i < this.value.length; i++) {
					var valueBuf = this.value[i].toBER(sizeOnly);
					if (valueBuf.byteLength === 0) {
						this.error = this.value[i].error;
						return new ArrayBuffer(0);
					}

					retBuf = utilConcatBuf(retBuf, valueBuf);
				}

				return retBuf;
			}
			//**********************************************************************************
			/**
    * Create "LocalObjectIdentifierValueBlock" class from string
    * @param {string} string Input string to convert from
    * @returns {boolean}
    */

		}, {
			key: "fromString",
			value: function fromString(string) {
				this.value = []; // Clear existing SID values

				var pos1 = 0;
				var pos2 = 0;

				var sid = "";

				var flag = false;

				do {
					pos2 = string.indexOf(".", pos1);
					if (pos2 === -1) sid = string.substr(pos1);else sid = string.substr(pos1, pos2 - pos1);

					pos1 = pos2 + 1;

					if (flag) {
						var sidBlock = this.value[0];

						var plus = 0;

						switch (sidBlock.valueDec) {
							case 0:
								break;
							case 1:
								plus = 40;
								break;
							case 2:
								plus = 80;
								break;
							default:
								this.value = []; // clear SID array
								return false; // ???
						}

						var parsedSID = parseInt(sid, 10);
						if (isNaN(parsedSID)) return true;

						sidBlock.valueDec = parsedSID + plus;

						flag = false;
					} else {
						var _sidBlock = new LocalSidValueBlock();
						_sidBlock.valueDec = parseInt(sid, 10);
						if (isNaN(_sidBlock.valueDec)) return true;

						if (this.value.length === 0) {
							_sidBlock.isFirstSid = true;
							flag = true;
						}

						this.value.push(_sidBlock);
					}
				} while (pos2 !== -1);

				return true;
			}
			//**********************************************************************************
			/**
    * Converts "LocalObjectIdentifierValueBlock" class to string
    * @returns {string}
    */

		}, {
			key: "toString",
			value: function toString() {
				var result = "";
				var isHexOnly = false;

				for (var i = 0; i < this.value.length; i++) {
					isHexOnly = this.value[i].isHexOnly;

					var sidStr = this.value[i].toString();

					if (i !== 0) result = result + ".";

					if (isHexOnly) {
						sidStr = "{" + sidStr + "}";

						if (this.value[i].isFirstSid) result = "2.{" + sidStr + " - 80}";else result = result + sidStr;
					} else result = result + sidStr;
				}

				return result;
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}, {
			key: "toJSON",

			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {Object}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalObjectIdentifierValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalObjectIdentifierValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.value = this.toString();
				object.sidArray = [];
				for (var i = 0; i < this.value.length; i++) {
					object.sidArray.push(this.value[i].toJSON());
				}return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "ObjectIdentifierValueBlock";
			}
		}]);

		return LocalObjectIdentifierValueBlock;
	}(LocalValueBlock);
	//**************************************************************************************
	/**
  * @extends BaseBlock
  */


	var ObjectIdentifier = function (_BaseBlock9) {
		_inherits(ObjectIdentifier, _BaseBlock9);

		//**********************************************************************************
		/**
   * Constructor for "ObjectIdentifier" class
   * @param {Object} [parameters={}]
   * @property {ArrayBuffer} [valueHex]
   */
		function ObjectIdentifier() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, ObjectIdentifier);

			var _this27 = _possibleConstructorReturn(this, (ObjectIdentifier.__proto__ || Object.getPrototypeOf(ObjectIdentifier)).call(this, parameters, LocalObjectIdentifierValueBlock));

			_this27.idBlock.tagClass = 1; // UNIVERSAL
			_this27.idBlock.tagNumber = 6; // OBJECT IDENTIFIER
			return _this27;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(ObjectIdentifier, null, [{
			key: "blockName",
			value: function blockName() {
				return "ObjectIdentifier";
			}
			//**********************************************************************************

		}]);

		return ObjectIdentifier;
	}(BaseBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of all string's classes
	//**************************************************************************************


	var LocalUtf8StringValueBlock = function (_LocalHexBlock6) {
		_inherits(LocalUtf8StringValueBlock, _LocalHexBlock6);

		//**********************************************************************************
		//noinspection JSUnusedGlobalSymbols
		/**
   * Constructor for "LocalUtf8StringValueBlock" class
   * @param {Object} [parameters={}]
   */
		function LocalUtf8StringValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalUtf8StringValueBlock);

			var _this28 = _possibleConstructorReturn(this, (LocalUtf8StringValueBlock.__proto__ || Object.getPrototypeOf(LocalUtf8StringValueBlock)).call(this, parameters));

			_this28.isHexOnly = true;
			_this28.value = ""; // String representation of decoded ArrayBuffer
			return _this28;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(LocalUtf8StringValueBlock, [{
			key: "toJSON",

			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Convertion for the block to JSON object
    * @returns {Object}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalUtf8StringValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalUtf8StringValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.value = this.value;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "Utf8StringValueBlock";
			}
		}]);

		return LocalUtf8StringValueBlock;
	}(LocalHexBlock(LocalBaseBlock));
	//**************************************************************************************
	/**
  * @extends BaseBlock
  */


	var Utf8String = function (_BaseBlock10) {
		_inherits(Utf8String, _BaseBlock10);

		//**********************************************************************************
		/**
   * Constructor for "Utf8String" class
   * @param {Object} [parameters={}]
   * @property {ArrayBuffer} [valueHex]
   */
		function Utf8String() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Utf8String);

			var _this29 = _possibleConstructorReturn(this, (Utf8String.__proto__ || Object.getPrototypeOf(Utf8String)).call(this, parameters, LocalUtf8StringValueBlock));

			if ("value" in parameters) _this29.fromString(parameters.value);

			_this29.idBlock.tagClass = 1; // UNIVERSAL
			_this29.idBlock.tagNumber = 12; // Utf8String
			return _this29;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(Utf8String, [{
			key: "fromBER",

			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number} Offset after least decoded byte
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
			//**********************************************************************************
			/**
    * Function converting ArrayBuffer into ASN.1 internal string
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    */

		}, {
			key: "fromBuffer",
			value: function fromBuffer(inputBuffer) {
				this.valueBlock.value = String.fromCharCode.apply(null, new Uint8Array(inputBuffer));

				try {
					//noinspection JSDeprecatedSymbols
					this.valueBlock.value = decodeURIComponent(escape(this.valueBlock.value));
				} catch (ex) {
					this.warnings.push("Error during \"decodeURIComponent\": " + ex + ", using raw string");
				}
			}
			//**********************************************************************************
			/**
    * Function converting JavaScript string into ASN.1 internal class
    * @param {!string} inputString ASN.1 BER encoded array
    */

		}, {
			key: "fromString",
			value: function fromString(inputString) {
				//noinspection JSDeprecatedSymbols
				var str = unescape(encodeURIComponent(inputString));
				var strLen = str.length;

				this.valueBlock.valueHex = new ArrayBuffer(strLen);
				var view = new Uint8Array(this.valueBlock.valueHex);

				for (var i = 0; i < strLen; i++) {
					view[i] = str.charCodeAt(i);
				}this.valueBlock.value = inputString;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "Utf8String";
			}
		}]);

		return Utf8String;
	}(BaseBlock);
	//**************************************************************************************
	/**
  * @extends LocalBaseBlock
  * @extends LocalHexBlock
  */


	var LocalBmpStringValueBlock = function (_LocalHexBlock7) {
		_inherits(LocalBmpStringValueBlock, _LocalHexBlock7);

		//**********************************************************************************
		/**
   * Constructor for "LocalBmpStringValueBlock" class
   * @param {Object} [parameters={}]
   */
		function LocalBmpStringValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalBmpStringValueBlock);

			var _this30 = _possibleConstructorReturn(this, (LocalBmpStringValueBlock.__proto__ || Object.getPrototypeOf(LocalBmpStringValueBlock)).call(this, parameters));

			_this30.isHexOnly = true;
			_this30.value = "";
			return _this30;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(LocalBmpStringValueBlock, [{
			key: "toJSON",

			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Convertion for the block to JSON object
    * @returns {Object}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalBmpStringValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalBmpStringValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.value = this.value;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "BmpStringValueBlock";
			}
		}]);

		return LocalBmpStringValueBlock;
	}(LocalHexBlock(LocalBaseBlock));
	//**************************************************************************************
	/**
  * @extends BaseBlock
  */


	var BmpString = function (_BaseBlock11) {
		_inherits(BmpString, _BaseBlock11);

		//**********************************************************************************
		/**
   * Constructor for "BmpString" class
   * @param {Object} [parameters={}]
   */
		function BmpString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, BmpString);

			var _this31 = _possibleConstructorReturn(this, (BmpString.__proto__ || Object.getPrototypeOf(BmpString)).call(this, parameters, LocalBmpStringValueBlock));

			if ("value" in parameters) _this31.fromString(parameters.value);

			_this31.idBlock.tagClass = 1; // UNIVERSAL
			_this31.idBlock.tagNumber = 30; // BmpString
			return _this31;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(BmpString, [{
			key: "fromBER",

			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number} Offset after least decoded byte
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
			//**********************************************************************************
			/**
    * Function converting ArrayBuffer into ASN.1 internal string
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    */

		}, {
			key: "fromBuffer",
			value: function fromBuffer(inputBuffer) {
				//noinspection JSCheckFunctionSignatures
				var copyBuffer = inputBuffer.slice(0);
				var valueView = new Uint8Array(copyBuffer);

				for (var i = 0; i < valueView.length; i = i + 2) {
					var temp = valueView[i];

					valueView[i] = valueView[i + 1];
					valueView[i + 1] = temp;
				}

				this.valueBlock.value = String.fromCharCode.apply(null, new Uint16Array(copyBuffer));
			}
			//**********************************************************************************
			/**
    * Function converting JavaScript string into ASN.1 internal class
    * @param {!string} inputString ASN.1 BER encoded array
    */

		}, {
			key: "fromString",
			value: function fromString(inputString) {
				var strLength = inputString.length;

				this.valueBlock.valueHex = new ArrayBuffer(strLength * 2);
				var valueHexView = new Uint8Array(this.valueBlock.valueHex);

				for (var i = 0; i < strLength; i++) {
					var codeBuf = utilToBase(inputString.charCodeAt(i), 8);
					var codeView = new Uint8Array(codeBuf);
					if (codeView.length > 2) continue;

					var dif = 2 - codeView.length;

					for (var j = codeView.length - 1; j >= 0; j--) {
						valueHexView[i * 2 + j + dif] = codeView[j];
					}
				}

				this.valueBlock.value = inputString;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "BmpString";
			}
		}]);

		return BmpString;
	}(BaseBlock);
	//**************************************************************************************


	var LocalUniversalStringValueBlock = function (_LocalHexBlock8) {
		_inherits(LocalUniversalStringValueBlock, _LocalHexBlock8);

		//**********************************************************************************
		/**
   * Constructor for "LocalUniversalStringValueBlock" class
   * @param {Object} [parameters={}]
   */
		function LocalUniversalStringValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalUniversalStringValueBlock);

			var _this32 = _possibleConstructorReturn(this, (LocalUniversalStringValueBlock.__proto__ || Object.getPrototypeOf(LocalUniversalStringValueBlock)).call(this, parameters));

			_this32.isHexOnly = true;
			_this32.value = "";
			return _this32;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(LocalUniversalStringValueBlock, [{
			key: "toJSON",

			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Convertion for the block to JSON object
    * @returns {Object}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalUniversalStringValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalUniversalStringValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.value = this.value;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "UniversalStringValueBlock";
			}
		}]);

		return LocalUniversalStringValueBlock;
	}(LocalHexBlock(LocalBaseBlock));
	//**************************************************************************************
	/**
  * @extends BaseBlock
  */


	var UniversalString = function (_BaseBlock12) {
		_inherits(UniversalString, _BaseBlock12);

		//**********************************************************************************
		/**
   * Constructor for "UniversalString" class
   * @param {Object} [parameters={}]
   */
		function UniversalString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, UniversalString);

			var _this33 = _possibleConstructorReturn(this, (UniversalString.__proto__ || Object.getPrototypeOf(UniversalString)).call(this, parameters, LocalUniversalStringValueBlock));

			if ("value" in parameters) _this33.fromString(parameters.value);

			_this33.idBlock.tagClass = 1; // UNIVERSAL
			_this33.idBlock.tagNumber = 28; // UniversalString
			return _this33;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(UniversalString, [{
			key: "fromBER",

			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number} Offset after least decoded byte
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
			//**********************************************************************************
			/**
    * Function converting ArrayBuffer into ASN.1 internal string
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    */

		}, {
			key: "fromBuffer",
			value: function fromBuffer(inputBuffer) {
				//noinspection JSCheckFunctionSignatures
				var copyBuffer = inputBuffer.slice(0);
				var valueView = new Uint8Array(copyBuffer);

				for (var i = 0; i < valueView.length; i = i + 4) {
					valueView[i] = valueView[i + 3];
					valueView[i + 1] = valueView[i + 2];
					valueView[i + 2] = 0x00;
					valueView[i + 3] = 0x00;
				}

				this.valueBlock.value = String.fromCharCode.apply(null, new Uint32Array(copyBuffer));
			}
			//**********************************************************************************
			/**
    * Function converting JavaScript string into ASN.1 internal class
    * @param {!string} inputString ASN.1 BER encoded array
    */

		}, {
			key: "fromString",
			value: function fromString(inputString) {
				var strLength = inputString.length;

				this.valueBlock.valueHex = new ArrayBuffer(strLength * 4);
				var valueHexView = new Uint8Array(this.valueBlock.valueHex);

				for (var i = 0; i < strLength; i++) {
					var codeBuf = utilToBase(inputString.charCodeAt(i), 8);
					var codeView = new Uint8Array(codeBuf);
					if (codeView.length > 4) continue;

					var dif = 4 - codeView.length;

					for (var j = codeView.length - 1; j >= 0; j--) {
						valueHexView[i * 4 + j + dif] = codeView[j];
					}
				}

				this.valueBlock.value = inputString;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "UniversalString";
			}
		}]);

		return UniversalString;
	}(BaseBlock);
	//**************************************************************************************


	var LocalSimpleStringValueBlock = function (_LocalHexBlock9) {
		_inherits(LocalSimpleStringValueBlock, _LocalHexBlock9);

		//**********************************************************************************
		/**
   * Constructor for "LocalSimpleStringValueBlock" class
   * @param {Object} [parameters={}]
   */
		function LocalSimpleStringValueBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalSimpleStringValueBlock);

			var _this34 = _possibleConstructorReturn(this, (LocalSimpleStringValueBlock.__proto__ || Object.getPrototypeOf(LocalSimpleStringValueBlock)).call(this, parameters));

			_this34.value = "";
			_this34.isHexOnly = true;
			return _this34;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(LocalSimpleStringValueBlock, [{
			key: "toJSON",

			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Convertion for the block to JSON object
    * @returns {Object}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(LocalSimpleStringValueBlock.prototype.__proto__ || Object.getPrototypeOf(LocalSimpleStringValueBlock.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.value = this.value;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "SimpleStringValueBlock";
			}
		}]);

		return LocalSimpleStringValueBlock;
	}(LocalHexBlock(LocalBaseBlock));
	//**************************************************************************************
	/**
  * @extends BaseBlock
  */


	var LocalSimpleStringBlock = function (_BaseBlock13) {
		_inherits(LocalSimpleStringBlock, _BaseBlock13);

		//**********************************************************************************
		/**
   * Constructor for "LocalSimpleStringBlock" class
   * @param {Object} [parameters={}]
   */
		function LocalSimpleStringBlock() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, LocalSimpleStringBlock);

			var _this35 = _possibleConstructorReturn(this, (LocalSimpleStringBlock.__proto__ || Object.getPrototypeOf(LocalSimpleStringBlock)).call(this, parameters, LocalSimpleStringValueBlock));

			if ("value" in parameters) _this35.fromString(parameters.value);
			return _this35;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(LocalSimpleStringBlock, [{
			key: "fromBER",

			//**********************************************************************************
			/**
    * Base function for converting block from BER encoded array of bytes
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
    * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
    * @returns {number} Offset after least decoded byte
    */
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
			//**********************************************************************************
			/**
    * Function converting ArrayBuffer into ASN.1 internal string
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    */

		}, {
			key: "fromBuffer",
			value: function fromBuffer(inputBuffer) {
				this.valueBlock.value = String.fromCharCode.apply(null, new Uint8Array(inputBuffer));
			}
			//**********************************************************************************
			/**
    * Function converting JavaScript string into ASN.1 internal class
    * @param {!string} inputString ASN.1 BER encoded array
    */

		}, {
			key: "fromString",
			value: function fromString(inputString) {
				var strLen = inputString.length;

				this.valueBlock.valueHex = new ArrayBuffer(strLen);
				var view = new Uint8Array(this.valueBlock.valueHex);

				for (var i = 0; i < strLen; i++) {
					view[i] = inputString.charCodeAt(i);
				}this.valueBlock.value = inputString;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "SIMPLESTRING";
			}
		}]);

		return LocalSimpleStringBlock;
	}(BaseBlock);
	//**************************************************************************************
	/**
  * @extends LocalSimpleStringBlock
  */


	var NumericString = function (_LocalSimpleStringBlo) {
		_inherits(NumericString, _LocalSimpleStringBlo);

		//**********************************************************************************
		/**
   * Constructor for "NumericString" class
   * @param {Object} [parameters={}]
   */
		function NumericString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, NumericString);

			var _this36 = _possibleConstructorReturn(this, (NumericString.__proto__ || Object.getPrototypeOf(NumericString)).call(this, parameters));

			_this36.idBlock.tagClass = 1; // UNIVERSAL
			_this36.idBlock.tagNumber = 18; // NumericString
			return _this36;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(NumericString, null, [{
			key: "blockName",
			value: function blockName() {
				return "NumericString";
			}
			//**********************************************************************************

		}]);

		return NumericString;
	}(LocalSimpleStringBlock);
	//**************************************************************************************
	/**
  * @extends LocalSimpleStringBlock
  */


	var PrintableString = function (_LocalSimpleStringBlo2) {
		_inherits(PrintableString, _LocalSimpleStringBlo2);

		//**********************************************************************************
		/**
   * Constructor for "PrintableString" class
   * @param {Object} [parameters={}]
   */
		function PrintableString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, PrintableString);

			var _this37 = _possibleConstructorReturn(this, (PrintableString.__proto__ || Object.getPrototypeOf(PrintableString)).call(this, parameters));

			_this37.idBlock.tagClass = 1; // UNIVERSAL
			_this37.idBlock.tagNumber = 19; // PrintableString
			return _this37;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(PrintableString, null, [{
			key: "blockName",
			value: function blockName() {
				return "PrintableString";
			}
			//**********************************************************************************

		}]);

		return PrintableString;
	}(LocalSimpleStringBlock);
	//**************************************************************************************
	/**
  * @extends LocalSimpleStringBlock
  */


	var TeletexString = function (_LocalSimpleStringBlo3) {
		_inherits(TeletexString, _LocalSimpleStringBlo3);

		//**********************************************************************************
		/**
   * Constructor for "TeletexString" class
   * @param {Object} [parameters={}]
   */
		function TeletexString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, TeletexString);

			var _this38 = _possibleConstructorReturn(this, (TeletexString.__proto__ || Object.getPrototypeOf(TeletexString)).call(this, parameters));

			_this38.idBlock.tagClass = 1; // UNIVERSAL
			_this38.idBlock.tagNumber = 20; // TeletexString
			return _this38;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(TeletexString, null, [{
			key: "blockName",
			value: function blockName() {
				return "TeletexString";
			}
			//**********************************************************************************

		}]);

		return TeletexString;
	}(LocalSimpleStringBlock);
	//**************************************************************************************
	/**
  * @extends LocalSimpleStringBlock
  */


	var VideotexString = function (_LocalSimpleStringBlo4) {
		_inherits(VideotexString, _LocalSimpleStringBlo4);

		//**********************************************************************************
		/**
   * Constructor for "VideotexString" class
   * @param {Object} [parameters={}]
   */
		function VideotexString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, VideotexString);

			var _this39 = _possibleConstructorReturn(this, (VideotexString.__proto__ || Object.getPrototypeOf(VideotexString)).call(this, parameters));

			_this39.idBlock.tagClass = 1; // UNIVERSAL
			_this39.idBlock.tagNumber = 21; // VideotexString
			return _this39;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(VideotexString, null, [{
			key: "blockName",
			value: function blockName() {
				return "VideotexString";
			}
			//**********************************************************************************

		}]);

		return VideotexString;
	}(LocalSimpleStringBlock);
	//**************************************************************************************
	/**
  * @extends LocalSimpleStringBlock
  */


	var IA5String = function (_LocalSimpleStringBlo5) {
		_inherits(IA5String, _LocalSimpleStringBlo5);

		//**********************************************************************************
		/**
   * Constructor for "IA5String" class
   * @param {Object} [parameters={}]
   */
		function IA5String() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, IA5String);

			var _this40 = _possibleConstructorReturn(this, (IA5String.__proto__ || Object.getPrototypeOf(IA5String)).call(this, parameters));

			_this40.idBlock.tagClass = 1; // UNIVERSAL
			_this40.idBlock.tagNumber = 22; // IA5String
			return _this40;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(IA5String, null, [{
			key: "blockName",
			value: function blockName() {
				return "IA5String";
			}
			//**********************************************************************************

		}]);

		return IA5String;
	}(LocalSimpleStringBlock);
	//**************************************************************************************
	/**
  * @extends LocalSimpleStringBlock
  */


	var GraphicString = function (_LocalSimpleStringBlo6) {
		_inherits(GraphicString, _LocalSimpleStringBlo6);

		//**********************************************************************************
		/**
   * Constructor for "GraphicString" class
   * @param {Object} [parameters={}]
   */
		function GraphicString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, GraphicString);

			var _this41 = _possibleConstructorReturn(this, (GraphicString.__proto__ || Object.getPrototypeOf(GraphicString)).call(this, parameters));

			_this41.idBlock.tagClass = 1; // UNIVERSAL
			_this41.idBlock.tagNumber = 25; // GraphicString
			return _this41;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(GraphicString, null, [{
			key: "blockName",
			value: function blockName() {
				return "GraphicString";
			}
			//**********************************************************************************

		}]);

		return GraphicString;
	}(LocalSimpleStringBlock);
	//**************************************************************************************
	/**
  * @extends LocalSimpleStringBlock
  */


	var VisibleString = function (_LocalSimpleStringBlo7) {
		_inherits(VisibleString, _LocalSimpleStringBlo7);

		//**********************************************************************************
		/**
   * Constructor for "VisibleString" class
   * @param {Object} [parameters={}]
   */
		function VisibleString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, VisibleString);

			var _this42 = _possibleConstructorReturn(this, (VisibleString.__proto__ || Object.getPrototypeOf(VisibleString)).call(this, parameters));

			_this42.idBlock.tagClass = 1; // UNIVERSAL
			_this42.idBlock.tagNumber = 26; // VisibleString
			return _this42;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(VisibleString, null, [{
			key: "blockName",
			value: function blockName() {
				return "VisibleString";
			}
			//**********************************************************************************

		}]);

		return VisibleString;
	}(LocalSimpleStringBlock);
	//**************************************************************************************
	/**
  * @extends LocalSimpleStringBlock
  */


	var GeneralString = function (_LocalSimpleStringBlo8) {
		_inherits(GeneralString, _LocalSimpleStringBlo8);

		//**********************************************************************************
		/**
   * Constructor for "GeneralString" class
   * @param {Object} [parameters={}]
   */
		function GeneralString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, GeneralString);

			var _this43 = _possibleConstructorReturn(this, (GeneralString.__proto__ || Object.getPrototypeOf(GeneralString)).call(this, parameters));

			_this43.idBlock.tagClass = 1; // UNIVERSAL
			_this43.idBlock.tagNumber = 27; // GeneralString
			return _this43;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(GeneralString, null, [{
			key: "blockName",
			value: function blockName() {
				return "GeneralString";
			}
			//**********************************************************************************

		}]);

		return GeneralString;
	}(LocalSimpleStringBlock);
	//**************************************************************************************
	/**
  * @extends LocalSimpleStringBlock
  */


	var CharacterString = function (_LocalSimpleStringBlo9) {
		_inherits(CharacterString, _LocalSimpleStringBlo9);

		//**********************************************************************************
		/**
   * Constructor for "CharacterString" class
   * @param {Object} [parameters={}]
   */
		function CharacterString() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, CharacterString);

			var _this44 = _possibleConstructorReturn(this, (CharacterString.__proto__ || Object.getPrototypeOf(CharacterString)).call(this, parameters));

			_this44.idBlock.tagClass = 1; // UNIVERSAL
			_this44.idBlock.tagNumber = 29; // CharacterString
			return _this44;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(CharacterString, null, [{
			key: "blockName",
			value: function blockName() {
				return "CharacterString";
			}
			//**********************************************************************************

		}]);

		return CharacterString;
	}(LocalSimpleStringBlock);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of all date and time classes
	//**************************************************************************************
	/**
  * @extends VisibleString
  */


	var UTCTime = function (_VisibleString) {
		_inherits(UTCTime, _VisibleString);

		//**********************************************************************************
		/**
   * Constructor for "UTCTime" class
   * @param {Object} [parameters={}]
   * @property {string} [value] String representatio of the date
   * @property {Date} [valueDate] JavaScript "Date" object
   */
		function UTCTime() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, UTCTime);

			var _this45 = _possibleConstructorReturn(this, (UTCTime.__proto__ || Object.getPrototypeOf(UTCTime)).call(this, parameters));

			_this45.year = 0;
			_this45.month = 0;
			_this45.day = 0;
			_this45.hour = 0;
			_this45.minute = 0;
			_this45.second = 0;

			//region Create UTCTime from ASN.1 UTC string value
			if ("value" in parameters) {
				_this45.fromString(parameters.value);

				_this45.valueBlock.valueHex = new ArrayBuffer(parameters.value.length);
				var view = new Uint8Array(_this45.valueBlock.valueHex);

				for (var i = 0; i < parameters.value.length; i++) {
					view[i] = parameters.value.charCodeAt(i);
				}
			}
			//endregion
			//region Create GeneralizedTime from JavaScript Date type
			if ("valueDate" in parameters) {
				_this45.fromDate(parameters.valueDate);
				_this45.valueBlock.valueHex = _this45.toBuffer();
			}
			//endregion

			_this45.idBlock.tagClass = 1; // UNIVERSAL
			_this45.idBlock.tagNumber = 23; // UTCTime
			return _this45;
		}
		//**********************************************************************************
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number} Offset after least decoded byte
   */


		_createClass(UTCTime, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
			//**********************************************************************************
			/**
    * Function converting ArrayBuffer into ASN.1 internal string
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    */

		}, {
			key: "fromBuffer",
			value: function fromBuffer(inputBuffer) {
				this.fromString(String.fromCharCode.apply(null, new Uint8Array(inputBuffer)));
			}
			//**********************************************************************************
			/**
    * Function converting ASN.1 internal string into ArrayBuffer
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBuffer",
			value: function toBuffer() {
				var str = this.toString();

				var buffer = new ArrayBuffer(str.length);
				var view = new Uint8Array(buffer);

				for (var i = 0; i < str.length; i++) {
					view[i] = str.charCodeAt(i);
				}return buffer;
			}
			//**********************************************************************************
			/**
    * Function converting "Date" object into ASN.1 internal string
    * @param {!Date} inputDate JavaScript "Date" object
    */

		}, {
			key: "fromDate",
			value: function fromDate(inputDate) {
				this.year = inputDate.getUTCFullYear();
				this.month = inputDate.getUTCMonth() + 1;
				this.day = inputDate.getUTCDate();
				this.hour = inputDate.getUTCHours();
				this.minute = inputDate.getUTCMinutes();
				this.second = inputDate.getUTCSeconds();
			}
			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Function converting ASN.1 internal string into "Date" object
    * @returns {Date}
    */

		}, {
			key: "toDate",
			value: function toDate() {
				return new Date(Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.second));
			}
			//**********************************************************************************
			/**
    * Function converting JavaScript string into ASN.1 internal class
    * @param {!string} inputString ASN.1 BER encoded array
    */

		}, {
			key: "fromString",
			value: function fromString(inputString) {
				//region Parse input string
				var parser = /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z/ig;
				var parserArray = parser.exec(inputString);
				if (parserArray === null) {
					this.error = "Wrong input string for convertion";
					return;
				}
				//endregion

				//region Store parsed values
				var year = parseInt(parserArray[1], 10);
				if (year >= 50) this.year = 1900 + year;else this.year = 2000 + year;

				this.month = parseInt(parserArray[2], 10);
				this.day = parseInt(parserArray[3], 10);
				this.hour = parseInt(parserArray[4], 10);
				this.minute = parseInt(parserArray[5], 10);
				this.second = parseInt(parserArray[6], 10);
				//endregion
			}
			//**********************************************************************************
			/**
    * Function converting ASN.1 internal class into JavaScript string
    * @returns {string}
    */

		}, {
			key: "toString",
			value: function toString() {
				var outputArray = new Array(7);

				outputArray[0] = padNumber(this.year < 2000 ? this.year - 1900 : this.year - 2000, 2);
				outputArray[1] = padNumber(this.month, 2);
				outputArray[2] = padNumber(this.day, 2);
				outputArray[3] = padNumber(this.hour, 2);
				outputArray[4] = padNumber(this.minute, 2);
				outputArray[5] = padNumber(this.second, 2);
				outputArray[6] = "Z";

				return outputArray.join("");
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}, {
			key: "toJSON",

			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {Object}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(UTCTime.prototype.__proto__ || Object.getPrototypeOf(UTCTime.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.year = this.year;
				object.month = this.month;
				object.day = this.day;
				object.hour = this.hour;
				object.minute = this.minute;
				object.second = this.second;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "UTCTime";
			}
		}]);

		return UTCTime;
	}(VisibleString);
	//**************************************************************************************
	/**
  * @extends VisibleString
  */


	var GeneralizedTime = function (_VisibleString2) {
		_inherits(GeneralizedTime, _VisibleString2);

		//**********************************************************************************
		/**
   * Constructor for "GeneralizedTime" class
   * @param {Object} [parameters={}]
   * @property {string} [value] String representatio of the date
   * @property {Date} [valueDate] JavaScript "Date" object
   */
		function GeneralizedTime() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, GeneralizedTime);

			var _this46 = _possibleConstructorReturn(this, (GeneralizedTime.__proto__ || Object.getPrototypeOf(GeneralizedTime)).call(this, parameters));

			_this46.year = 0;
			_this46.month = 0;
			_this46.day = 0;
			_this46.hour = 0;
			_this46.minute = 0;
			_this46.second = 0;
			_this46.millisecond = 0;

			//region Create UTCTime from ASN.1 UTC string value
			if ("value" in parameters) {
				_this46.fromString(parameters.value);

				_this46.valueBlock.valueHex = new ArrayBuffer(parameters.value.length);
				var view = new Uint8Array(_this46.valueBlock.valueHex);

				for (var i = 0; i < parameters.value.length; i++) {
					view[i] = parameters.value.charCodeAt(i);
				}
			}
			//endregion
			//region Create GeneralizedTime from JavaScript Date type
			if ("valueDate" in parameters) {
				_this46.fromDate(parameters.valueDate);
				_this46.valueBlock.valueHex = _this46.toBuffer();
			}
			//endregion

			_this46.idBlock.tagClass = 1; // UNIVERSAL
			_this46.idBlock.tagNumber = 24; // GeneralizedTime
			return _this46;
		}
		//**********************************************************************************
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number} Offset after least decoded byte
   */


		_createClass(GeneralizedTime, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				var resultOffset = this.valueBlock.fromBER(inputBuffer, inputOffset, this.lenBlock.isIndefiniteForm === true ? inputLength : this.lenBlock.length);
				if (resultOffset === -1) {
					this.error = this.valueBlock.error;
					return resultOffset;
				}

				this.fromBuffer(this.valueBlock.valueHex);

				if (this.idBlock.error.length === 0) this.blockLength += this.idBlock.blockLength;

				if (this.lenBlock.error.length === 0) this.blockLength += this.lenBlock.blockLength;

				if (this.valueBlock.error.length === 0) this.blockLength += this.valueBlock.blockLength;

				return resultOffset;
			}
			//**********************************************************************************
			/**
    * Function converting ArrayBuffer into ASN.1 internal string
    * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
    */

		}, {
			key: "fromBuffer",
			value: function fromBuffer(inputBuffer) {
				this.fromString(String.fromCharCode.apply(null, new Uint8Array(inputBuffer)));
			}
			//**********************************************************************************
			/**
    * Function converting ASN.1 internal string into ArrayBuffer
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBuffer",
			value: function toBuffer() {
				var str = this.toString();

				var buffer = new ArrayBuffer(str.length);
				var view = new Uint8Array(buffer);

				for (var i = 0; i < str.length; i++) {
					view[i] = str.charCodeAt(i);
				}return buffer;
			}
			//**********************************************************************************
			/**
    * Function converting "Date" object into ASN.1 internal string
    * @param {!Date} inputDate JavaScript "Date" object
    */

		}, {
			key: "fromDate",
			value: function fromDate(inputDate) {
				this.year = inputDate.getUTCFullYear();
				this.month = inputDate.getUTCMonth() + 1;
				this.day = inputDate.getUTCDate();
				this.hour = inputDate.getUTCHours();
				this.minute = inputDate.getUTCMinutes();
				this.second = inputDate.getUTCSeconds();
				this.millisecond = inputDate.getUTCMilliseconds();
			}
			//**********************************************************************************
			//noinspection JSUnusedGlobalSymbols
			/**
    * Function converting ASN.1 internal string into "Date" object
    * @returns {Date}
    */

		}, {
			key: "toDate",
			value: function toDate() {
				return new Date(Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.second, this.millisecond));
			}
			//**********************************************************************************
			/**
    * Function converting JavaScript string into ASN.1 internal class
    * @param {!string} inputString ASN.1 BER encoded array
    */

		}, {
			key: "fromString",
			value: function fromString(inputString) {
				//region Initial variables
				var isUTC = false;

				var timeString = "";
				var dateTimeString = "";
				var fractionPart = 0;

				var parser = void 0;

				var hourDifference = 0;
				var minuteDifference = 0;
				//endregion

				//region Convert as UTC time
				if (inputString[inputString.length - 1] === "Z") {
					timeString = inputString.substr(0, inputString.length - 1);

					isUTC = true;
				}
				//endregion
				//region Convert as local time
				else {
						//noinspection JSPrimitiveTypeWrapperUsage
						var number = new Number(inputString[inputString.length - 1]);

						if (isNaN(number.valueOf())) throw new Error("Wrong input string for convertion");

						timeString = inputString;
					}
				//endregion

				//region Check that we do not have a "+" and "-" symbols inside UTC time
				if (isUTC) {
					if (timeString.indexOf("+") !== -1) throw new Error("Wrong input string for convertion");

					if (timeString.indexOf("-") !== -1) throw new Error("Wrong input string for convertion");
				}
				//endregion
				//region Get "UTC time difference" in case of local time
				else {
						var multiplier = 1;
						var differencePosition = timeString.indexOf("+");
						var differenceString = "";

						if (differencePosition === -1) {
							differencePosition = timeString.indexOf("-");
							multiplier = -1;
						}

						if (differencePosition !== -1) {
							differenceString = timeString.substr(differencePosition + 1);
							timeString = timeString.substr(0, differencePosition);

							if (differenceString.length !== 2 && differenceString.length !== 4) throw new Error("Wrong input string for convertion");

							//noinspection JSPrimitiveTypeWrapperUsage
							var _number = new Number(differenceString.substr(0, 2));

							if (isNaN(_number.valueOf())) throw new Error("Wrong input string for convertion");

							hourDifference = multiplier * _number;

							if (differenceString.length === 4) {
								//noinspection JSPrimitiveTypeWrapperUsage
								_number = new Number(differenceString.substr(2, 2));

								if (isNaN(_number.valueOf())) throw new Error("Wrong input string for convertion");

								minuteDifference = multiplier * _number;
							}
						}
					}
				//endregion

				//region Get position of fraction point
				var fractionPointPosition = timeString.indexOf("."); // Check for "full stop" symbol
				if (fractionPointPosition === -1) fractionPointPosition = timeString.indexOf(","); // Check for "comma" symbol
				//endregion

				//region Get fraction part
				if (fractionPointPosition !== -1) {
					//noinspection JSPrimitiveTypeWrapperUsage
					var fractionPartCheck = new Number("0" + timeString.substr(fractionPointPosition));

					if (isNaN(fractionPartCheck.valueOf())) throw new Error("Wrong input string for convertion");

					fractionPart = fractionPartCheck.valueOf();

					dateTimeString = timeString.substr(0, fractionPointPosition);
				} else dateTimeString = timeString;
				//endregion

				//region Parse internal date
				switch (true) {
					case dateTimeString.length === 8:
						// "YYYYMMDD"
						parser = /(\d{4})(\d{2})(\d{2})/ig;
						if (fractionPointPosition !== -1) throw new Error("Wrong input string for convertion"); // Here we should not have a "fraction point"
						break;
					case dateTimeString.length === 10:
						// "YYYYMMDDHH"
						parser = /(\d{4})(\d{2})(\d{2})(\d{2})/ig;

						if (fractionPointPosition !== -1) {
							var fractionResult = 60 * fractionPart;
							this.minute = Math.floor(fractionResult);

							fractionResult = 60 * (fractionResult - this.minute);
							this.second = Math.floor(fractionResult);

							fractionResult = 1000 * (fractionResult - this.second);
							this.millisecond = Math.floor(fractionResult);
						}
						break;
					case dateTimeString.length === 12:
						// "YYYYMMDDHHMM"
						parser = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/ig;

						if (fractionPointPosition !== -1) {
							var _fractionResult = 60 * fractionPart;
							this.second = Math.floor(_fractionResult);

							_fractionResult = 1000 * (_fractionResult - this.second);
							this.millisecond = Math.floor(_fractionResult);
						}
						break;
					case dateTimeString.length === 14:
						// "YYYYMMDDHHMMSS"
						parser = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/ig;

						if (fractionPointPosition !== -1) {
							var _fractionResult2 = 1000 * fractionPart;
							this.millisecond = Math.floor(_fractionResult2);
						}
						break;
					default:
						throw new Error("Wrong input string for convertion");
				}
				//endregion

				//region Put parsed values at right places
				var parserArray = parser.exec(dateTimeString);
				if (parserArray === null) throw new Error("Wrong input string for convertion");

				for (var j = 1; j < parserArray.length; j++) {
					switch (j) {
						case 1:
							this.year = parseInt(parserArray[j], 10);
							break;
						case 2:
							this.month = parseInt(parserArray[j], 10);
							break;
						case 3:
							this.day = parseInt(parserArray[j], 10);
							break;
						case 4:
							this.hour = parseInt(parserArray[j], 10) + hourDifference;
							break;
						case 5:
							this.minute = parseInt(parserArray[j], 10) + minuteDifference;
							break;
						case 6:
							this.second = parseInt(parserArray[j], 10);
							break;
						default:
							throw new Error("Wrong input string for convertion");
					}
				}
				//endregion

				//region Get final date
				if (isUTC === false) {
					var tempDate = new Date(this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);

					this.year = tempDate.getUTCFullYear();
					this.month = tempDate.getUTCMonth();
					this.day = tempDate.getUTCDay();
					this.hour = tempDate.getUTCHours();
					this.minute = tempDate.getUTCMinutes();
					this.second = tempDate.getUTCSeconds();
					this.millisecond = tempDate.getUTCMilliseconds();
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Function converting ASN.1 internal class into JavaScript string
    * @returns {string}
    */

		}, {
			key: "toString",
			value: function toString() {
				var outputArray = [];

				outputArray.push(padNumber(this.year, 4));
				outputArray.push(padNumber(this.month, 2));
				outputArray.push(padNumber(this.day, 2));
				outputArray.push(padNumber(this.hour, 2));
				outputArray.push(padNumber(this.minute, 2));
				outputArray.push(padNumber(this.second, 2));
				if (this.millisecond !== 0) {
					outputArray.push(".");
					outputArray.push(padNumber(this.millisecond, 3));
				}
				outputArray.push("Z");

				return outputArray.join("");
			}
			//**********************************************************************************
			/**
    * Aux function, need to get a block name. Need to have it here for inhiritence
    * @returns {string}
    */

		}, {
			key: "toJSON",

			//**********************************************************************************
			/**
    * Convertion for the block to JSON object
    * @returns {Object}
    */
			value: function toJSON() {
				var object = {};

				//region Seems at the moment (Sep 2016) there is no way how to check method is supported in "super" object
				try {
					object = _get(GeneralizedTime.prototype.__proto__ || Object.getPrototypeOf(GeneralizedTime.prototype), "toJSON", this).call(this);
				} catch (ex) {}
				//endregion

				object.year = this.year;
				object.month = this.month;
				object.day = this.day;
				object.hour = this.hour;
				object.minute = this.minute;
				object.second = this.second;
				object.millisecond = this.millisecond;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "blockName",
			value: function blockName() {
				return "GeneralizedTime";
			}
		}]);

		return GeneralizedTime;
	}(VisibleString);
	//**************************************************************************************
	/**
  * @extends Utf8String
  */


	var DATE = function (_Utf8String) {
		_inherits(DATE, _Utf8String);

		//**********************************************************************************
		/**
   * Constructor for "DATE" class
   * @param {Object} [parameters={}]
   */
		function DATE() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, DATE);

			var _this47 = _possibleConstructorReturn(this, (DATE.__proto__ || Object.getPrototypeOf(DATE)).call(this, parameters));

			_this47.idBlock.tagClass = 1; // UNIVERSAL
			_this47.idBlock.tagNumber = 31; // DATE
			return _this47;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(DATE, null, [{
			key: "blockName",
			value: function blockName() {
				return "DATE";
			}
			//**********************************************************************************

		}]);

		return DATE;
	}(Utf8String);
	//**************************************************************************************
	/**
  * @extends Utf8String
  */


	var TimeOfDay = function (_Utf8String2) {
		_inherits(TimeOfDay, _Utf8String2);

		//**********************************************************************************
		/**
   * Constructor for "TimeOfDay" class
   * @param {Object} [parameters={}]
   */
		function TimeOfDay() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, TimeOfDay);

			var _this48 = _possibleConstructorReturn(this, (TimeOfDay.__proto__ || Object.getPrototypeOf(TimeOfDay)).call(this, parameters));

			_this48.idBlock.tagClass = 1; // UNIVERSAL
			_this48.idBlock.tagNumber = 32; // TimeOfDay
			return _this48;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(TimeOfDay, null, [{
			key: "blockName",
			value: function blockName() {
				return "TimeOfDay";
			}
			//**********************************************************************************

		}]);

		return TimeOfDay;
	}(Utf8String);
	//**************************************************************************************
	/**
  * @extends Utf8String
  */


	var DateTime = function (_Utf8String3) {
		_inherits(DateTime, _Utf8String3);

		//**********************************************************************************
		/**
   * Constructor for "DateTime" class
   * @param {Object} [parameters={}]
   */
		function DateTime() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, DateTime);

			var _this49 = _possibleConstructorReturn(this, (DateTime.__proto__ || Object.getPrototypeOf(DateTime)).call(this, parameters));

			_this49.idBlock.tagClass = 1; // UNIVERSAL
			_this49.idBlock.tagNumber = 33; // DateTime
			return _this49;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(DateTime, null, [{
			key: "blockName",
			value: function blockName() {
				return "DateTime";
			}
			//**********************************************************************************

		}]);

		return DateTime;
	}(Utf8String);
	//**************************************************************************************
	/**
  * @extends Utf8String
  */


	var Duration = function (_Utf8String4) {
		_inherits(Duration, _Utf8String4);

		//**********************************************************************************
		/**
   * Constructor for "Duration" class
   * @param {Object} [parameters={}]
   */
		function Duration() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Duration);

			var _this50 = _possibleConstructorReturn(this, (Duration.__proto__ || Object.getPrototypeOf(Duration)).call(this, parameters));

			_this50.idBlock.tagClass = 1; // UNIVERSAL
			_this50.idBlock.tagNumber = 34; // Duration
			return _this50;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(Duration, null, [{
			key: "blockName",
			value: function blockName() {
				return "Duration";
			}
			//**********************************************************************************

		}]);

		return Duration;
	}(Utf8String);
	//**************************************************************************************
	/**
  * @extends Utf8String
  */


	var TIME = function (_Utf8String5) {
		_inherits(TIME, _Utf8String5);

		//**********************************************************************************
		/**
   * Constructor for "Time" class
   * @param {Object} [parameters={}]
   */
		function TIME() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, TIME);

			var _this51 = _possibleConstructorReturn(this, (TIME.__proto__ || Object.getPrototypeOf(TIME)).call(this, parameters));

			_this51.idBlock.tagClass = 1; // UNIVERSAL
			_this51.idBlock.tagNumber = 14; // Time
			return _this51;
		}
		//**********************************************************************************
		/**
   * Aux function, need to get a block name. Need to have it here for inhiritence
   * @returns {string}
   */


		_createClass(TIME, null, [{
			key: "blockName",
			value: function blockName() {
				return "TIME";
			}
			//**********************************************************************************

		}]);

		return TIME;
	}(Utf8String);
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of special ASN.1 schema type Choice
	//**************************************************************************************


	var Choice =
	//**********************************************************************************
	/**
  * Constructor for "Choice" class
  * @param {Object} [parameters={}]
  * @property {Array} [value] Array of ASN.1 types for make a choice from
  * @property {boolean} [optional]
  */
	function Choice() {
		var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, Choice);

		this.value = getParametersValue(parameters, "value", []);
		this.optional = getParametersValue(parameters, "optional", false);
	}
	//**********************************************************************************
	;
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of special ASN.1 schema type Any
	//**************************************************************************************


	var Any =
	//**********************************************************************************
	/**
  * Constructor for "Any" class
  * @param {Object} [parameters={}]
  * @property {string} [name]
  * @property {boolean} [optional]
  */
	function Any() {
		var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, Any);

		this.name = getParametersValue(parameters, "name", "");
		this.optional = getParametersValue(parameters, "optional", false);
	}
	//**********************************************************************************
	;
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of special ASN.1 schema type Repeated
	//**************************************************************************************


	var Repeated =
	//**********************************************************************************
	/**
  * Constructor for "Repeated" class
  * @param {Object} [parameters={}]
  * @property {string} [name]
  * @property {boolean} [optional]
  */
	function Repeated() {
		var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, Repeated);

		this.name = getParametersValue(parameters, "name", "");
		this.optional = getParametersValue(parameters, "optional", false);
		this.value = getParametersValue(parameters, "value", new Any());
		this.local = getParametersValue(parameters, "local", false); // Could local or global array to store elements
	}
	//**********************************************************************************
	;
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of special ASN.1 schema type RawData
	//**************************************************************************************
	/**
  * @description Special class providing ability to have "toBER/fromBER" for raw ArrayBuffer
  */


	var RawData = function () {
		//**********************************************************************************
		/**
   * Constructor for "Repeated" class
   * @param {Object} [parameters={}]
   * @property {string} [name]
   * @property {boolean} [optional]
   */
		function RawData() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, RawData);

			this.data = getParametersValue(parameters, "data", new ArrayBuffer(0));
		}
		//**********************************************************************************
		/**
   * Base function for converting block from BER encoded array of bytes
   * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
   * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
   * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
   * @returns {number} Offset after least decoded byte
   */


		_createClass(RawData, [{
			key: "fromBER",
			value: function fromBER(inputBuffer, inputOffset, inputLength) {
				this.data = inputBuffer.slice(inputOffset, inputLength);
			}
			//**********************************************************************************
			/**
    * Encoding of current ASN.1 block into ASN.1 encoded array (BER rules)
    * @param {boolean} [sizeOnly=false] Flag that we need only a size of encoding, not a real array of bytes
    * @returns {ArrayBuffer}
    */

		}, {
			key: "toBER",
			value: function toBER() {
				var sizeOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				return this.data;
			}
			//**********************************************************************************

		}]);

		return RawData;
	}();
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Major ASN.1 BER decoding function
	//**************************************************************************************
	/**
  * Internal library function for decoding ASN.1 BER
  * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array
  * @param {!number} inputOffset Offset in ASN.1 BER encoded array where decoding should be started
  * @param {!number} inputLength Maximum length of array of bytes which can be using in this function
  * @returns {{offset: number, result: Object}}
  */


	function LocalFromBER(inputBuffer, inputOffset, inputLength) {
		var incomingOffset = inputOffset; // Need to store initial offset since "inputOffset" is changing in the function

		//region Local function changing a type for ASN.1 classes
		function localChangeType(inputObject, newType) {
			if (inputObject instanceof newType) return inputObject;

			var newObject = new newType();
			newObject.idBlock = inputObject.idBlock;
			newObject.lenBlock = inputObject.lenBlock;
			newObject.warnings = inputObject.warnings;
			//noinspection JSCheckFunctionSignatures
			newObject.valueBeforeDecode = inputObject.valueBeforeDecode.slice(0);

			return newObject;
		}
		//endregion

		//region Create a basic ASN.1 type since we need to return errors and warnings from the function
		var returnObject = new BaseBlock({}, Object);
		//endregion

		//region Basic check for parameters
		if (checkBufferParams(new LocalBaseBlock(), inputBuffer, inputOffset, inputLength) === false) {
			returnObject.error = "Wrong input parameters";
			return {
				offset: -1,
				result: returnObject
			};
		}
		//endregion

		//region Getting Uint8Array from ArrayBuffer
		var intBuffer = new Uint8Array(inputBuffer, inputOffset, inputLength);
		//endregion

		//region Initial checks
		if (intBuffer.length === 0) {
			this.error = "Zero buffer length";
			return {
				offset: -1,
				result: returnObject
			};
		}
		//endregion

		//region Decode indentifcation block of ASN.1 BER structure
		var resultOffset = returnObject.idBlock.fromBER(inputBuffer, inputOffset, inputLength);
		returnObject.warnings.concat(returnObject.idBlock.warnings);
		if (resultOffset === -1) {
			returnObject.error = returnObject.idBlock.error;
			return {
				offset: -1,
				result: returnObject
			};
		}

		inputOffset = resultOffset;
		inputLength -= returnObject.idBlock.blockLength;
		//endregion

		//region Decode length block of ASN.1 BER structure
		resultOffset = returnObject.lenBlock.fromBER(inputBuffer, inputOffset, inputLength);
		returnObject.warnings.concat(returnObject.lenBlock.warnings);
		if (resultOffset === -1) {
			returnObject.error = returnObject.lenBlock.error;
			return {
				offset: -1,
				result: returnObject
			};
		}

		inputOffset = resultOffset;
		inputLength -= returnObject.lenBlock.blockLength;
		//endregion

		//region Check for usign indefinite length form in encoding for primitive types
		if (returnObject.idBlock.isConstructed === false && returnObject.lenBlock.isIndefiniteForm === true) {
			returnObject.error = "Indefinite length form used for primitive encoding form";
			return {
				offset: -1,
				result: returnObject
			};
		}
		//endregion

		//region Switch ASN.1 block type
		var newASN1Type = BaseBlock;

		switch (returnObject.idBlock.tagClass) {
			//region UNIVERSAL
			case 1:
				//region Check for reserved tag numbers
				if (returnObject.idBlock.tagNumber >= 37 && returnObject.idBlock.isHexOnly === false) {
					returnObject.error = "UNIVERSAL 37 and upper tags are reserved by ASN.1 standard";
					return {
						offset: -1,
						result: returnObject
					};
				}
				//endregion

				switch (returnObject.idBlock.tagNumber) {
					//region EndOfContent type
					case 0:
						//region Check for EndOfContent type
						if (returnObject.idBlock.isConstructed === true && returnObject.lenBlock.length > 0) {
							returnObject.error = "Type [UNIVERSAL 0] is reserved";
							return {
								offset: -1,
								result: returnObject
							};
						}
						//endregion

						newASN1Type = EndOfContent;

						break;
					//endregion
					//region Boolean type
					case 1:
						newASN1Type = Boolean;
						break;
					//endregion
					//region Integer type
					case 2:
						newASN1Type = Integer;
						break;
					//endregion
					//region BitString type
					case 3:
						newASN1Type = BitString;
						break;
					//endregion
					//region OctetString type
					case 4:
						newASN1Type = OctetString;
						break;
					//endregion
					//region Null type
					case 5:
						newASN1Type = Null;
						break;
					//endregion
					//region OBJECT IDENTIFIER type
					case 6:
						newASN1Type = ObjectIdentifier;
						break;
					//endregion
					//region Enumerated type
					case 10:
						newASN1Type = Enumerated;
						break;
					//endregion
					//region Utf8String type
					case 12:
						newASN1Type = Utf8String;
						break;
					//endregion
					//region Time type
					case 14:
						newASN1Type = TIME;
						break;
					//endregion
					//region ASN.1 reserved type
					case 15:
						returnObject.error = "[UNIVERSAL 15] is reserved by ASN.1 standard";
						return {
							offset: -1,
							result: returnObject
						};
					//endregion
					//region Sequence type
					case 16:
						newASN1Type = Sequence;
						break;
					//endregion
					//region Set type
					case 17:
						newASN1Type = Set;
						break;
					//endregion
					//region NumericString type
					case 18:
						newASN1Type = NumericString;
						break;
					//endregion
					//region PrintableString type
					case 19:
						newASN1Type = PrintableString;
						break;
					//endregion
					//region TeletexString type
					case 20:
						newASN1Type = TeletexString;
						break;
					//endregion
					//region VideotexString type
					case 21:
						newASN1Type = VideotexString;
						break;
					//endregion
					//region IA5String type
					case 22:
						newASN1Type = IA5String;
						break;
					//endregion
					//region UTCTime type
					case 23:
						newASN1Type = UTCTime;
						break;
					//endregion
					//region GeneralizedTime type
					case 24:
						newASN1Type = GeneralizedTime;
						break;
					//endregion
					//region GraphicString type
					case 25:
						newASN1Type = GraphicString;
						break;
					//endregion
					//region VisibleString type
					case 26:
						newASN1Type = VisibleString;
						break;
					//endregion
					//region GeneralString type
					case 27:
						newASN1Type = GeneralString;
						break;
					//endregion
					//region UniversalString type
					case 28:
						newASN1Type = UniversalString;
						break;
					//endregion
					//region CharacterString type
					case 29:
						newASN1Type = CharacterString;
						break;
					//endregion
					//region BmpString type
					case 30:
						newASN1Type = BmpString;
						break;
					//endregion
					//region DATE type
					case 31:
						newASN1Type = DATE;
						break;
					//endregion
					//region TimeOfDay type
					case 32:
						newASN1Type = TimeOfDay;
						break;
					//endregion
					//region Date-Time type
					case 33:
						newASN1Type = DateTime;
						break;
					//endregion
					//region Duration type
					case 34:
						newASN1Type = Duration;
						break;
					//endregion
					//region default
					default:
						{
							var newObject = void 0;

							if (returnObject.idBlock.isConstructed === true) newObject = new Constructed();else newObject = new Primitive();

							newObject.idBlock = returnObject.idBlock;
							newObject.lenBlock = returnObject.lenBlock;
							newObject.warnings = returnObject.warnings;

							returnObject = newObject;

							resultOffset = returnObject.fromBER(inputBuffer, inputOffset, inputLength);
						}
					//endregion
				}
				break;
			//endregion
			//region All other tag classes
			case 2: // APPLICATION
			case 3: // CONTEXT-SPECIFIC
			case 4: // PRIVATE
			default:
				{
					if (returnObject.idBlock.isConstructed === true) newASN1Type = Constructed;else newASN1Type = Primitive;
				}
			//endregion
		}
		//endregion

		//region Change type and perform BER decoding
		returnObject = localChangeType(returnObject, newASN1Type);
		resultOffset = returnObject.fromBER(inputBuffer, inputOffset, returnObject.lenBlock.isIndefiniteForm === true ? inputLength : returnObject.lenBlock.length);
		//endregion

		//region Coping incoming buffer for entire ASN.1 block
		returnObject.valueBeforeDecode = inputBuffer.slice(incomingOffset, incomingOffset + returnObject.blockLength);
		//endregion

		return {
			offset: resultOffset,
			result: returnObject
		};
	}
	//**************************************************************************************
	/**
  * Major function for decoding ASN.1 BER array into internal library structuries
  * @param {!ArrayBuffer} inputBuffer ASN.1 BER encoded array of bytes
  */
	function fromBER(inputBuffer) {
		if (inputBuffer.byteLength === 0) {
			var result = new BaseBlock({}, Object);
			result.error = "Input buffer has zero length";

			return {
				offset: -1,
				result: result
			};
		}

		return LocalFromBER(inputBuffer, 0, inputBuffer.byteLength);
	}
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Major scheme verification function
	//**************************************************************************************
	/**
  * Compare of two ASN.1 object trees
  * @param {!Object} root Root of input ASN.1 object tree
  * @param {!Object} inputData Input ASN.1 object tree
  * @param {!Object} inputSchema Input ASN.1 schema to compare with
  * @return {{verified: boolean}|{verified:boolean, result: Object}}
  */
	function compareSchema(root, inputData, inputSchema) {
		//region Special case for Choice schema element type
		if (inputSchema instanceof Choice) {
			var choiceResult = false;

			for (var j = 0; j < inputSchema.value.length; j++) {
				var result = compareSchema(root, inputData, inputSchema.value[j]);
				if (result.verified === true) {
					return {
						verified: true,
						result: root
					};
				}
			}

			if (choiceResult === false) {
				var _result = {
					verified: false,
					result: {
						error: "Wrong values for Choice type"
					}
				};

				if (inputSchema.hasOwnProperty("name")) _result.name = inputSchema.name;

				return _result;
			}
		}
		//endregion

		//region Special case for Any schema element type
		if (inputSchema instanceof Any) {
			//region Add named component of ASN.1 schema
			if (inputSchema.hasOwnProperty("name")) root[inputSchema.name] = inputData;
			//endregion

			return {
				verified: true,
				result: root
			};
		}
		//endregion

		//region Initial check
		if (root instanceof Object === false) {
			return {
				verified: false,
				result: { error: "Wrong root object" }
			};
		}

		if (inputData instanceof Object === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 data" }
			};
		}

		if (inputSchema instanceof Object === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}

		if ("idBlock" in inputSchema === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}
		//endregion

		//region Comparing idBlock properties in ASN.1 data and ASN.1 schema
		//region Encode and decode ASN.1 schema idBlock
		/// <remarks>This encoding/decoding is neccessary because could be an errors in schema definition</remarks>
		if ("fromBER" in inputSchema.idBlock === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}

		if ("toBER" in inputSchema.idBlock === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}

		var encodedId = inputSchema.idBlock.toBER(false);
		if (encodedId.byteLength === 0) {
			return {
				verified: false,
				result: { error: "Error encoding idBlock for ASN.1 schema" }
			};
		}

		var decodedOffset = inputSchema.idBlock.fromBER(encodedId, 0, encodedId.byteLength);
		if (decodedOffset === -1) {
			return {
				verified: false,
				result: { error: "Error decoding idBlock for ASN.1 schema" }
			};
		}
		//endregion

		//region tagClass
		if (inputSchema.idBlock.hasOwnProperty("tagClass") === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}

		if (inputSchema.idBlock.tagClass !== inputData.idBlock.tagClass) {
			return {
				verified: false,
				result: root
			};
		}
		//endregion
		//region tagNumber
		if (inputSchema.idBlock.hasOwnProperty("tagNumber") === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}

		if (inputSchema.idBlock.tagNumber !== inputData.idBlock.tagNumber) {
			return {
				verified: false,
				result: root
			};
		}
		//endregion
		//region isConstructed
		if (inputSchema.idBlock.hasOwnProperty("isConstructed") === false) {
			return {
				verified: false,
				result: { error: "Wrong ASN.1 schema" }
			};
		}

		if (inputSchema.idBlock.isConstructed !== inputData.idBlock.isConstructed) {
			return {
				verified: false,
				result: root
			};
		}
		//endregion
		//region isHexOnly
		if ("isHexOnly" in inputSchema.idBlock === false) // Since 'isHexOnly' is an inhirited property
			{
				return {
					verified: false,
					result: { error: "Wrong ASN.1 schema" }
				};
			}

		if (inputSchema.idBlock.isHexOnly !== inputData.idBlock.isHexOnly) {
			return {
				verified: false,
				result: root
			};
		}
		//endregion
		//region valueHex
		if (inputSchema.idBlock.isHexOnly === true) {
			if ("valueHex" in inputSchema.idBlock === false) // Since 'valueHex' is an inhirited property
				{
					return {
						verified: false,
						result: { error: "Wrong ASN.1 schema" }
					};
				}

			var schemaView = new Uint8Array(inputSchema.idBlock.valueHex);
			var asn1View = new Uint8Array(inputData.idBlock.valueHex);

			if (schemaView.length !== asn1View.length) {
				return {
					verified: false,
					result: root
				};
			}

			for (var i = 0; i < schemaView.length; i++) {
				if (schemaView[i] !== asn1View[1]) {
					return {
						verified: false,
						result: root
					};
				}
			}
		}
		//endregion
		//endregion

		//region Add named component of ASN.1 schema
		if (inputSchema.hasOwnProperty("name")) {
			inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
			if (inputSchema.name !== "") root[inputSchema.name] = inputData;
		}
		//endregion

		//region Getting next ASN.1 block for comparition
		if (inputSchema.idBlock.isConstructed === true) {
			var admission = 0;
			var _result2 = { verified: false };

			var maxLength = inputSchema.valueBlock.value.length;

			if (maxLength > 0) {
				if (inputSchema.valueBlock.value[0] instanceof Repeated) maxLength = inputData.valueBlock.value.length;
			}

			//region Special case when constructive value has no elements
			if (maxLength === 0) {
				return {
					verified: true,
					result: root
				};
			}
			//endregion

			//region Special case when "inputData" has no values and "inputSchema" has all optional values
			if (inputData.valueBlock.value.length === 0 && inputSchema.valueBlock.value.length !== 0) {
				var _optional = true;

				for (var _i8 = 0; _i8 < inputSchema.valueBlock.value.length; _i8++) {
					_optional = _optional && (inputSchema.valueBlock.value[_i8].optional || false);
				}if (_optional === true) {
					return {
						verified: true,
						result: root
					};
				}

				//region Delete early added name of block
				if (inputSchema.hasOwnProperty("name")) {
					inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
					if (inputSchema.name !== "") delete root[inputSchema.name];
				}
				//endregion

				root.error = "Inconsistent object length";

				return {
					verified: false,
					result: root
				};
			}
			//endregion

			for (var _i9 = 0; _i9 < maxLength; _i9++) {
				//region Special case when there is an "optional" element of ASN.1 schema at the end
				if (_i9 - admission >= inputData.valueBlock.value.length) {
					if (inputSchema.valueBlock.value[_i9].optional === false) {
						var _result3 = {
							verified: false,
							result: root
						};

						root.error = "Inconsistent length between ASN.1 data and schema";

						//region Delete early added name of block
						if (inputSchema.hasOwnProperty("name")) {
							inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
							if (inputSchema.name !== "") {
								delete root[inputSchema.name];
								_result3.name = inputSchema.name;
							}
						}
						//endregion

						return _result3;
					}
				}
				//endregion
				else {
						//region Special case for Repeated type of ASN.1 schema element
						if (inputSchema.valueBlock.value[0] instanceof Repeated) {
							_result2 = compareSchema(root, inputData.valueBlock.value[_i9], inputSchema.valueBlock.value[0].value);
							if (_result2.verified === false) {
								if (inputSchema.valueBlock.value[0].optional === true) admission++;else {
									//region Delete early added name of block
									if (inputSchema.hasOwnProperty("name")) {
										inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
										if (inputSchema.name !== "") delete root[inputSchema.name];
									}
									//endregion

									return _result2;
								}
							}

							if ("name" in inputSchema.valueBlock.value[0] && inputSchema.valueBlock.value[0].name.length > 0) {
								var arrayRoot = {};

								if ("local" in inputSchema.valueBlock.value[0] && inputSchema.valueBlock.value[0].local === true) arrayRoot = inputData;else arrayRoot = root;

								if (typeof arrayRoot[inputSchema.valueBlock.value[0].name] === "undefined") arrayRoot[inputSchema.valueBlock.value[0].name] = [];

								arrayRoot[inputSchema.valueBlock.value[0].name].push(inputData.valueBlock.value[_i9]);
							}
						}
						//endregion
						else {
								_result2 = compareSchema(root, inputData.valueBlock.value[_i9 - admission], inputSchema.valueBlock.value[_i9]);
								if (_result2.verified === false) {
									if (inputSchema.valueBlock.value[_i9].optional === true) admission++;else {
										//region Delete early added name of block
										if (inputSchema.hasOwnProperty("name")) {
											inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
											if (inputSchema.name !== "") delete root[inputSchema.name];
										}
										//endregion

										return _result2;
									}
								}
							}
					}
			}

			if (_result2.verified === false) // The situation may take place if last element is "optional" and verification failed
				{
					var _result4 = {
						verified: false,
						result: root
					};

					//region Delete early added name of block
					if (inputSchema.hasOwnProperty("name")) {
						inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
						if (inputSchema.name !== "") {
							delete root[inputSchema.name];
							_result4.name = inputSchema.name;
						}
					}
					//endregion

					return _result4;
				}

			return {
				verified: true,
				result: root
			};
		}
		//endregion
		//region Ability to parse internal value for primitive-encoded value (value of OctetString, for example)
		if ("primitiveSchema" in inputSchema && "valueHex" in inputData.valueBlock) {
			//region Decoding of raw ASN.1 data
			var asn1 = fromBER(inputData.valueBlock.valueHex);
			if (asn1.offset === -1) {
				var _result5 = {
					verified: false,
					result: asn1.result
				};

				//region Delete early added name of block
				if (inputSchema.hasOwnProperty("name")) {
					inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, "");
					if (inputSchema.name !== "") {
						delete root[inputSchema.name];
						_result5.name = inputSchema.name;
					}
				}
				//endregion

				return _result5;
			}
			//endregion

			return compareSchema(root, asn1.result, inputSchema.primitiveSchema);
		}

		return {
			verified: true,
			result: root
		};
		//endregion
	}

	//**************************************************************************************
	/**
  * Class from RFC5280
  */

	var AlgorithmIdentifier = function () {
		//**********************************************************************************
		/**
   * Constructor for AlgorithmIdentifier class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   * @property {string} [algorithmId] ObjectIdentifier for algorithm (string representation)
   */
		function AlgorithmIdentifier() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, AlgorithmIdentifier);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description ObjectIdentifier for algorithm (string representation)
    */
			this.algorithmId = getParametersValue(parameters, "algorithmId", AlgorithmIdentifier.defaultValues("algorithmId"));

			if ("algorithmParams" in parameters)
				/**
     * @type {Object}
     * @description Any algorithm parameters
     */
				this.algorithmParams = getParametersValue(parameters, "algorithmParams", AlgorithmIdentifier.defaultValues("algorithmParams"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(AlgorithmIdentifier, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				/**
     * @type {{verified: boolean}|{verified: boolean, result: {algorithm: Object, params: Object}}}
     */
				var asn1 = compareSchema(schema, schema, AlgorithmIdentifier.schema({
					names: {
						algorithmIdentifier: "algorithm",
						algorithmParams: "params"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for AlgorithmIdentifier");
				//endregion

				//region Get internal properties from parsed schema
				this.algorithmId = asn1.result.algorithm.valueBlock.toString();
				if ("params" in asn1.result) this.algorithmParams = asn1.result.params;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				outputArray.push(new ObjectIdentifier({ value: this.algorithmId }));
				if ("algorithmParams" in this && this.algorithmParams instanceof Any === false) outputArray.push(this.algorithmParams);
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {
					algorithmId: this.algorithmId
				};

				if ("algorithmParams" in this && this.algorithmParams instanceof Any === false) object.algorithmParams = this.algorithmParams.toJSON();

				return object;
			}
			//**********************************************************************************
			/**
    * Check that two "AlgorithmIdentifiers" are equal
    * @param {AlgorithmIdentifier} algorithmIdentifier
    * @returns {boolean}
    */

		}, {
			key: "isEqual",
			value: function isEqual(algorithmIdentifier) {
				//region Check input type
				if (algorithmIdentifier instanceof AlgorithmIdentifier === false) return false;
				//endregion

				//region Check "algorithm_id"
				if (this.algorithmId !== algorithmIdentifier.algorithmId) return false;
				//endregion

				//region Check "algorithm_params"
				if ("algorithmParams" in this) {
					if ("algorithmParams" in algorithmIdentifier) return JSON.stringify(this.algorithmParams) === JSON.stringify(algorithmIdentifier.algorithmParams);

					return false;
				}

				if ("algorithmParams" in algorithmIdentifier) return false;
				//endregion

				return true;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "algorithmId":
						return "";
					case "algorithmParams":
						return new Any();
					default:
						throw new Error("Invalid member name for AlgorithmIdentifier class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "algorithmId":
						return memberValue === "";
					case "algorithmParams":
						return memberValue instanceof Any;
					default:
						throw new Error("Invalid member name for AlgorithmIdentifier class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//AlgorithmIdentifier  ::=  Sequence  {
				//    algorithm               OBJECT IDENTIFIER,
				//    parameters              ANY DEFINED BY algorithm OPTIONAL  }

				/**
     * @type {Object}
     * @property {string} algorithmIdentifier ObjectIdentifier for the algorithm
     * @property {string} algorithmParams Any algorithm parameters
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					optional: names.optional || false,
					value: [new ObjectIdentifier({ name: names.algorithmIdentifier || "" }), new Any({ name: names.algorithmParams || "", optional: true })]
				});
			}
		}]);

		return AlgorithmIdentifier;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC4055
  */


	var RSASSAPSSParams = function () {
		//**********************************************************************************
		/**
   * Constructor for RSASSAPSSParams class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function RSASSAPSSParams() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, RSASSAPSSParams);

			//region Internal properties of the object
			/**
    * @type {AlgorithmIdentifier}
    * @description Algorithms of hashing (DEFAULT sha1)
    */
			this.hashAlgorithm = getParametersValue(parameters, "hashAlgorithm", RSASSAPSSParams.defaultValues("hashAlgorithm"));
			/**
    * @type {AlgorithmIdentifier}
    * @description Algorithm of "mask generaion function (MGF)" (DEFAULT mgf1SHA1)
    */
			this.maskGenAlgorithm = getParametersValue(parameters, "maskGenAlgorithm", RSASSAPSSParams.defaultValues("maskGenAlgorithm"));
			/**
    * @type {number}
    * @description Salt length (DEFAULT 20)
    */
			this.saltLength = getParametersValue(parameters, "saltLength", RSASSAPSSParams.defaultValues("saltLength"));
			/**
    * @type {number}
    * @description (DEFAULT 1)
    */
			this.trailerField = getParametersValue(parameters, "trailerField", RSASSAPSSParams.defaultValues("trailerField"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(RSASSAPSSParams, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, RSASSAPSSParams.schema({
					names: {
						hashAlgorithm: {
							names: {
								blockName: "hashAlgorithm"
							}
						},
						maskGenAlgorithm: {
							names: {
								blockName: "maskGenAlgorithm"
							}
						},
						saltLength: "saltLength",
						trailerField: "trailerField"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for RSASSA_PSS_params");
				//endregion

				//region Get internal properties from parsed schema
				if ("hashAlgorithm" in asn1.result) this.hashAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.hashAlgorithm });

				if ("maskGenAlgorithm" in asn1.result) this.maskGenAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.maskGenAlgorithm });

				if ("saltLength" in asn1.result) this.saltLength = asn1.result.saltLength.valueBlock.valueDec;

				if ("trailerField" in asn1.result) this.trailerField = asn1.result.trailerField.valueBlock.valueDec;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				if (!this.hashAlgorithm.isEqual(RSASSAPSSParams.defaultValues("hashAlgorithm"))) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [this.hashAlgorithm.toSchema()]
					}));
				}

				if (!this.maskGenAlgorithm.isEqual(RSASSAPSSParams.defaultValues("maskGenAlgorithm"))) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [this.maskGenAlgorithm.toSchema()]
					}));
				}

				if (this.saltLength !== RSASSAPSSParams.defaultValues("saltLength")) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						},
						value: [new Integer({ value: this.saltLength })]
					}));
				}

				if (this.trailerField !== RSASSAPSSParams.defaultValues("trailerField")) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 3 // [3]
						},
						value: [new Integer({ value: this.trailerField })]
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				if (!this.hashAlgorithm.isEqual(RSASSAPSSParams.defaultValues("hashAlgorithm"))) object.hashAlgorithm = this.hashAlgorithm.toJSON();

				if (!this.maskGenAlgorithm.isEqual(RSASSAPSSParams.defaultValues("maskGenAlgorithm"))) object.maskGenAlgorithm = this.maskGenAlgorithm.toJSON();

				if (this.saltLength !== RSASSAPSSParams.defaultValues("saltLength")) object.saltLength = this.saltLength;

				if (this.trailerField !== RSASSAPSSParams.defaultValues("trailerField")) object.trailerField = this.trailerField;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "hashAlgorithm":
						return new AlgorithmIdentifier({
							algorithmId: "1.3.14.3.2.26", // SHA-1
							algorithmParams: new Null()
						});
					case "maskGenAlgorithm":
						return new AlgorithmIdentifier({
							algorithmId: "1.2.840.113549.1.1.8", // MGF1
							algorithmParams: new AlgorithmIdentifier({
								algorithmId: "1.3.14.3.2.26", // SHA-1
								algorithmParams: new Null()
							}).toSchema()
						});
					case "saltLength":
						return 20;
					case "trailerField":
						return 1;
					default:
						throw new Error("Invalid member name for RSASSAPSSParams class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//RSASSA-PSS-params  ::=  Sequence  {
				//    hashAlgorithm      [0] HashAlgorithm DEFAULT sha1Identifier,
				//    maskGenAlgorithm   [1] MaskGenAlgorithm DEFAULT mgf1SHA1Identifier,
				//    saltLength         [2] Integer DEFAULT 20,
				//    trailerField       [3] Integer DEFAULT 1  }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [hashAlgorithm]
     * @property {string} [maskGenAlgorithm]
     * @property {string} [saltLength]
     * @property {string} [trailerField]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						optional: true,
						value: [AlgorithmIdentifier.schema(names.hashAlgorithm || {})]
					}), new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						optional: true,
						value: [AlgorithmIdentifier.schema(names.maskGenAlgorithm || {})]
					}), new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						},
						optional: true,
						value: [new Integer({ name: names.saltLength || "" })]
					}), new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 3 // [3]
						},
						optional: true,
						value: [new Integer({ name: names.trailerField || "" })]
					})]
				});
			}
		}]);

		return RSASSAPSSParams;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5480
  */


	var ECPublicKey = function () {
		//**********************************************************************************
		/**
   * Constructor for ECCPublicKey class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function ECPublicKey() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, ECPublicKey);

			//region Internal properties of the object
			/**
    * @type {ArrayBuffer}
    * @description type
    */
			this.x = getParametersValue(parameters, "x", ECPublicKey.defaultValues("x"));
			/**
    * @type {ArrayBuffer}
    * @description values
    */
			this.y = getParametersValue(parameters, "y", ECPublicKey.defaultValues("y"));
			/**
    * @type {string}
    * @description namedCurve
    */
			this.namedCurve = getParametersValue(parameters, "namedCurve", ECPublicKey.defaultValues("namedCurve"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
			//region If input argument array contains "json" for this object
			if ("json" in parameters) this.fromJSON(parameters.json);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(ECPublicKey, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert ArrayBuffer into current class
    * @param {!ArrayBuffer} schema Special case: schema is an ArrayBuffer
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				if (schema instanceof ArrayBuffer === false) throw new Error("Object's schema was not verified against input data for ECPublicKey");

				var view = new Uint8Array(schema);
				if (view[0] !== 0x04) throw new Error("Object's schema was not verified against input data for ECPublicKey");
				//endregion

				//region Get internal properties from parsed schema
				var coordinateLength = void 0;

				switch (this.namedCurve) {
					case "1.2.840.10045.3.1.7":
						// P-256
						coordinateLength = 32;
						break;
					case "1.3.132.0.34":
						// P-384
						coordinateLength = 48;
						break;
					case "1.3.132.0.35":
						// P-521
						coordinateLength = 66;
						break;
					default:
						throw new Error("Incorrect curve OID: " + this.namedCurve);
				}

				if (schema.byteLength !== coordinateLength * 2 + 1) throw new Error("Object's schema was not verified against input data for ECPublicKey");

				this.x = schema.slice(1, coordinateLength + 1);
				this.y = schema.slice(1 + coordinateLength, coordinateLength * 2 + 1);
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				return new RawData({ data: utilConcatBuf(new Uint8Array([0x04]).buffer, this.x, this.y)
				});
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var crvName = "";

				switch (this.namedCurve) {
					case "1.2.840.10045.3.1.7":
						// P-256
						crvName = "P-256";
						break;
					case "1.3.132.0.34":
						// P-384
						crvName = "P-384";
						break;
					case "1.3.132.0.35":
						// P-521
						crvName = "P-521";
						break;
					default:
				}

				return {
					crv: crvName,
					x: toBase64(arrayBufferToString(this.x), true, true),
					y: toBase64(arrayBufferToString(this.y), true, true)
				};
			}
			//**********************************************************************************
			/**
    * Convert JSON value into current object
    * @param {Object} json
    */

		}, {
			key: "fromJSON",
			value: function fromJSON(json) {
				var coodinateLength = 0;

				if ("crv" in json) {
					switch (json.crv.toUpperCase()) {
						case "P-256":
							this.namedCurve = "1.2.840.10045.3.1.7";
							coodinateLength = 32;
							break;
						case "P-384":
							this.namedCurve = "1.3.132.0.34";
							coodinateLength = 48;
							break;
						case "P-521":
							this.namedCurve = "1.3.132.0.35";
							coodinateLength = 66;
							break;
						default:
					}
				} else throw new Error("Absent mandatory parameter \"crv\"");

				if ("x" in json) this.x = stringToArrayBuffer(fromBase64(json.x, true)).slice(0, coodinateLength);else throw new Error("Absent mandatory parameter \"x\"");

				if ("y" in json) this.y = stringToArrayBuffer(fromBase64(json.y, true)).slice(0, coodinateLength);else throw new Error("Absent mandatory parameter \"y\"");
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "x":
					case "y":
						return new ArrayBuffer(0);
					case "namedCurve":
						return "";
					default:
						throw new Error("Invalid member name for ECCPublicKey class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "x":
					case "y":
						return isEqualBuffer(memberValue, ECPublicKey.defaultValues(memberName));
					case "namedCurve":
						return memberValue === "";
					default:
						throw new Error("Invalid member name for ECCPublicKey class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				return new RawData();
			}
		}]);

		return ECPublicKey;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC3447
  */


	var RSAPublicKey = function () {
		//**********************************************************************************
		/**
   * Constructor for RSAPublicKey class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   * @property {Integer} [modulus]
   * @property {Integer} [publicExponent]
   */
		function RSAPublicKey() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, RSAPublicKey);

			//region Internal properties of the object
			/**
    * @type {Integer}
    * @description Modulus part of RSA public key
    */
			this.modulus = getParametersValue(parameters, "modulus", RSAPublicKey.defaultValues("modulus"));
			/**
    * @type {Integer}
    * @description Public exponent of RSA public key
    */
			this.publicExponent = getParametersValue(parameters, "publicExponent", RSAPublicKey.defaultValues("publicExponent"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
			//region If input argument array contains "json" for this object
			if ("json" in parameters) this.fromJSON(parameters.json);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(RSAPublicKey, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, RSAPublicKey.schema({
					names: {
						modulus: "modulus",
						publicExponent: "publicExponent"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for RSAPublicKey");
				//endregion

				//region Get internal properties from parsed schema
				this.modulus = asn1.result.modulus.convertFromDER(256);
				this.publicExponent = asn1.result.publicExponent;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [this.modulus.convertToDER(), this.publicExponent]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					n: toBase64(arrayBufferToString(this.modulus.valueBlock.valueHex), true, true),
					e: toBase64(arrayBufferToString(this.publicExponent.valueBlock.valueHex), true, true)
				};
			}
			//**********************************************************************************
			/**
    * Convert JSON value into current object
    * @param {Object} json
    */

		}, {
			key: "fromJSON",
			value: function fromJSON(json) {
				if ("n" in json) this.modulus = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.n, true)).slice(0, 256) });else throw new Error("Absent mandatory parameter \"n\"");

				if ("e" in json) this.publicExponent = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.e, true)).slice(0, 3) });else throw new Error("Absent mandatory parameter \"e\"");
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "modulus":
						return new Integer();
					case "publicExponent":
						return new Integer();
					default:
						throw new Error("Invalid member name for RSAPublicKey class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//RSAPublicKey ::= Sequence {
				//    modulus           Integer,  -- n
				//    publicExponent    Integer   -- e
				//}

				/**
     * @type {Object}
     * @property {string} utcTimeName Name for "utcTimeName" choice
     * @property {string} generalTimeName Name for "generalTimeName" choice
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.modulus || "" }), new Integer({ name: names.publicExponent || "" })]
				});
			}
		}]);

		return RSAPublicKey;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var PublicKeyInfo = function () {
		//**********************************************************************************
		/**
   * Constructor for PublicKeyInfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function PublicKeyInfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, PublicKeyInfo);

			//region Internal properties of the object
			/**
    * @type {AlgorithmIdentifier}
    * @description Algorithm identifier
    */
			this.algorithm = getParametersValue(parameters, "algorithm", PublicKeyInfo.defaultValues("algorithm"));
			/**
    * @type {BitString}
    * @description Subject public key value
    */
			this.subjectPublicKey = getParametersValue(parameters, "subjectPublicKey", PublicKeyInfo.defaultValues("subjectPublicKey"));

			if ("parsedKey" in parameters)
				/**
     * @type {ECPublicKey|RSAPublicKey}
     * @description Parsed public key value
     */
				this.parsedKey = getParametersValue(parameters, "parsedKey", PublicKeyInfo.defaultValues("parsedKey"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
			//region If input argument array contains "json" for this object
			if ("json" in parameters) this.fromJSON(parameters.json);
			//endregion
		}

		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(PublicKeyInfo, [{
			key: "fromSchema",


			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, PublicKeyInfo.schema({
					names: {
						algorithm: {
							names: {
								blockName: "algorithm"
							}
						},
						subjectPublicKey: "subjectPublicKey"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PUBLIC_KEY_INFO");
				//endregion

				//region Get internal properties from parsed schema
				this.algorithm = new AlgorithmIdentifier({ schema: asn1.result.algorithm });
				this.subjectPublicKey = asn1.result.subjectPublicKey;

				switch (this.algorithm.algorithmId) {
					case "1.2.840.10045.2.1":
						// ECDSA
						if ("algorithmParams" in this.algorithm) {
							if (this.algorithm.algorithmParams instanceof ObjectIdentifier) {
								this.parsedKey = new ECPublicKey({
									namedCurve: this.algorithm.algorithmParams.valueBlock.toString(),
									schema: this.subjectPublicKey.valueBlock.valueHex
								});
							}
						}
						break;
					case "1.2.840.113549.1.1.1":
						// RSA
						{
							var publicKeyASN1 = fromBER(this.subjectPublicKey.valueBlock.valueHex);
							if (publicKeyASN1.offset !== -1) this.parsedKey = new RSAPublicKey({ schema: publicKeyASN1.result });
						}
						break;
					default:
				}
				//endregion
			}

			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [this.algorithm.toSchema(), this.subjectPublicKey]
				});
				//endregion
			}

			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				//region Return common value in case we do not have enough info fo making JWK
				if ("parsedKey" in this === false) {
					return {
						algorithm: this.algorithm.toJSON(),
						subjectPublicKey: this.subjectPublicKey.toJSON()
					};
				}
				//endregion

				//region Making JWK
				var jwk = {};

				switch (this.algorithm.algorithmId) {
					case "1.2.840.10045.2.1":
						// ECDSA
						jwk.kty = "EC";
						break;
					case "1.2.840.113549.1.1.1":
						// RSA
						jwk.kty = "RSA";
						break;
					default:
				}

				var publicKeyJWK = this.parsedKey.toJSON();

				var _iteratorNormalCompletion5 = true;
				var _didIteratorError5 = false;
				var _iteratorError5 = undefined;

				try {
					for (var _iterator5 = Object.keys(publicKeyJWK)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
						var key = _step5.value;

						jwk[key] = publicKeyJWK[key];
					}
				} catch (err) {
					_didIteratorError5 = true;
					_iteratorError5 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion5 && _iterator5.return) {
							_iterator5.return();
						}
					} finally {
						if (_didIteratorError5) {
							throw _iteratorError5;
						}
					}
				}

				return jwk;
				//endregion
			}

			//**********************************************************************************
			/**
    * Convert JSON value into current object
    * @param {Object} json
    */

		}, {
			key: "fromJSON",
			value: function fromJSON(json) {
				if ("kty" in json) {
					switch (json.kty.toUpperCase()) {
						case "EC":
							this.parsedKey = new ECPublicKey({ json: json });

							this.algorithm = new AlgorithmIdentifier({
								algorithmId: "1.2.840.10045.2.1",
								algorithmParams: new ObjectIdentifier({ value: this.parsedKey.namedCurve })
							});
							break;
						case "RSA":
							this.parsedKey = new RSAPublicKey({ json: json });

							this.algorithm = new AlgorithmIdentifier({
								algorithmId: "1.2.840.113549.1.1.1",
								algorithmParams: new Null()
							});
							break;
						default:
							throw new Error("Invalid value for \"kty\" parameter: " + json.kty);
					}

					this.subjectPublicKey = new BitString({ valueHex: this.parsedKey.toSchema().toBER(false) });
				}
			}

			//**********************************************************************************

		}, {
			key: "importKey",
			value: function importKey(publicKey) {
				//region Initial variables
				var sequence = Promise.resolve();
				var _this = this;
				//endregion

				//region Initial check
				if (typeof publicKey === "undefined") return Promise.reject("Need to provide publicKey input parameter");
				//endregion

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				//region Export public key
				sequence = sequence.then(function () {
					return crypto.exportKey("spki", publicKey);
				});
				//endregion

				//region Initialize internal variables by parsing exported value
				sequence = sequence.then(function (exportedKey) {
					var asn1 = fromBER(exportedKey);
					try {
						_this.fromSchema(asn1.result);
					} catch (exception) {
						return Promise.reject("Error during initializing object from schema");
					}

					return undefined;
				}, function (error) {
					return Promise.reject("Error during exporting public key: " + error);
				});
				//endregion

				return sequence;
			}

			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "algorithm":
						return new AlgorithmIdentifier();
					case "subjectPublicKey":
						return new BitString();
					default:
						throw new Error("Invalid member name for PublicKeyInfo class: " + memberName);
				}
			}

			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//SubjectPublicKeyInfo  ::=  Sequence  {
				//    algorithm            AlgorithmIdentifier,
				//    subjectPublicKey     BIT STRING  }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [algorithm]
     * @property {string} [subjectPublicKey]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [AlgorithmIdentifier.schema(names.algorithm || {}), new BitString({ name: names.subjectPublicKey || "" })]
				});
			}
		}]);

		return PublicKeyInfo;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC2986
  */


	var Attribute = function () {
		//**********************************************************************************
		/**
   * Constructor for Attribute class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function Attribute() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Attribute);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description type
    */
			this.type = getParametersValue(parameters, "type", Attribute.defaultValues("type"));
			/**
    * @type {Array}
    * @description values
    */
			this.values = getParametersValue(parameters, "values", Attribute.defaultValues("values"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}

		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(Attribute, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, Attribute.schema({
					names: {
						type: "type",
						values: "values"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for ATTRIBUTE");
				//endregion

				//region Get internal properties from parsed schema
				this.type = asn1.result.type.valueBlock.toString();
				this.values = asn1.result.values;
				//endregion
			}

			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [new ObjectIdentifier({ value: this.type }), new Set({
						value: this.values
					})]
				});
				//endregion
			}

			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					type: this.type,
					values: Array.from(this.values, function (element) {
						return element.toJSON();
					})
				};
			}

			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "type":
						return "";
					case "values":
						return [];
					default:
						throw new Error("Invalid member name for Attribute class: " + memberName);
				}
			}

			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "type":
						return memberValue === "";
					case "values":
						return memberValue.length === 0;
					default:
						throw new Error("Invalid member name for Attribute class: " + memberName);
				}
			}

			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// Attribute { ATTRIBUTE:IOSet } ::= SEQUENCE {
				//    type   ATTRIBUTE.&id({IOSet}),
				//    values SET SIZE(1..MAX) OF ATTRIBUTE.&Type({IOSet}{@type})
				//}

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [type]
     * @property {string} [setName]
     * @property {string} [values]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.type || "" }), new Set({
						name: names.setName || "",
						value: [new Repeated({
							name: names.values || "",
							value: new Any()
						})]
					})]
				});
			}
		}]);

		return Attribute;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5915
  */


	var ECPrivateKey = function () {
		//**********************************************************************************
		/**
   * Constructor for ECCPrivateKey class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function ECPrivateKey() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, ECPrivateKey);

			//region Internal properties of the object
			/**
    * @type {number}
    * @description version
    */
			this.version = getParametersValue(parameters, "version", ECPrivateKey.defaultValues("version"));
			/**
    * @type {OctetString}
    * @description privateKey
    */
			this.privateKey = getParametersValue(parameters, "privateKey", ECPrivateKey.defaultValues("privateKey"));

			if ("namedCurve" in parameters)
				/**
     * @type {string}
     * @description namedCurve
     */
				this.namedCurve = getParametersValue(parameters, "namedCurve", ECPrivateKey.defaultValues("namedCurve"));

			if ("publicKey" in parameters)
				/**
     * @type {ECPublicKey}
     * @description publicKey
     */
				this.publicKey = getParametersValue(parameters, "publicKey", ECPrivateKey.defaultValues("publicKey"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
			//region If input argument array contains "json" for this object
			if ("json" in parameters) this.fromJSON(parameters.json);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(ECPrivateKey, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, ECPrivateKey.schema({
					names: {
						version: "version",
						privateKey: "privateKey",
						namedCurve: "namedCurve",
						publicKey: "publicKey"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for ECPrivateKey");
				//endregion

				//region Get internal properties from parsed schema
				this.version = asn1.result.version.valueBlock.valueDec;
				this.privateKey = asn1.result.privateKey;

				if ("namedCurve" in asn1.result) this.namedCurve = asn1.result.namedCurve.valueBlock.toString();

				if ("publicKey" in asn1.result) {
					var publicKeyData = { schema: asn1.result.publicKey.valueBlock.valueHex };
					if ("namedCurve" in this) publicKeyData.namedCurve = this.namedCurve;

					this.publicKey = new ECPublicKey(publicKeyData);
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				var outputArray = [new Integer({ value: this.version }), this.privateKey];

				if ("namedCurve" in this) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new ObjectIdentifier({ value: this.namedCurve })]
					}));
				}

				if ("publicKey" in this) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [new BitString({ valueHex: this.publicKey.toSchema().toBER(false) })]
					}));
				}

				return new Sequence({
					value: outputArray
				});
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				if ("namedCurve" in this === false || ECPrivateKey.compareWithDefault("namedCurve", this.namedCurve)) throw new Error("Not enough information for making JSON: absent \"namedCurve\" value");

				var crvName = "";

				switch (this.namedCurve) {
					case "1.2.840.10045.3.1.7":
						// P-256
						crvName = "P-256";
						break;
					case "1.3.132.0.34":
						// P-384
						crvName = "P-384";
						break;
					case "1.3.132.0.35":
						// P-521
						crvName = "P-521";
						break;
					default:
				}

				var privateKeyJSON = {
					crv: crvName,
					d: toBase64(arrayBufferToString(this.privateKey.valueBlock.valueHex), true, true)
				};

				if ("publicKey" in this) {
					var publicKeyJSON = this.publicKey.toJSON();

					privateKeyJSON.x = publicKeyJSON.x;
					privateKeyJSON.y = publicKeyJSON.y;
				}

				return privateKeyJSON;
			}
			//**********************************************************************************
			/**
    * Convert JSON value into current object
    * @param {Object} json
    */

		}, {
			key: "fromJSON",
			value: function fromJSON(json) {
				var coodinateLength = 0;

				if ("crv" in json) {
					switch (json.crv.toUpperCase()) {
						case "P-256":
							this.namedCurve = "1.2.840.10045.3.1.7";
							coodinateLength = 32;
							break;
						case "P-384":
							this.namedCurve = "1.3.132.0.34";
							coodinateLength = 48;
							break;
						case "P-521":
							this.namedCurve = "1.3.132.0.35";
							coodinateLength = 66;
							break;
						default:
					}
				} else throw new Error("Absent mandatory parameter \"crv\"");

				if ("d" in json) this.privateKey = new OctetString({ valueHex: stringToArrayBuffer(fromBase64(json.d, true)).slice(0, coodinateLength) });else throw new Error("Absent mandatory parameter \"d\"");

				if ("x" in json && "y" in json) this.publicKey = new ECPublicKey({ json: json });
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "version":
						return 1;
					case "privateKey":
						return new OctetString();
					case "namedCurve":
						return "";
					case "publicKey":
						return new ECPublicKey();
					default:
						throw new Error("Invalid member name for ECCPrivateKey class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "version":
						return memberValue === ECPrivateKey.defaultValues(memberName);
					case "privateKey":
						return memberValue.isEqual(ECPrivateKey.defaultValues(memberName));
					case "namedCurve":
						return memberValue === "";
					case "publicKey":
						return ECPublicKey.compareWithDefault("namedCurve", memberValue.namedCurve) && ECPublicKey.compareWithDefault("x", memberValue.x) && ECPublicKey.compareWithDefault("y", memberValue.y);
					default:
						throw new Error("Invalid member name for ECCPrivateKey class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// ECPrivateKey ::= SEQUENCE {
				// version        INTEGER { ecPrivkeyVer1(1) } (ecPrivkeyVer1),
				// privateKey     OCTET STRING,
				// parameters [0] ECParameters {{ NamedCurve }} OPTIONAL,
				// publicKey  [1] BIT STRING OPTIONAL
				// }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [version]
     * @property {string} [privateKey]
     * @property {string} [namedCurve]
     * @property {string} [publicKey]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.version || "" }), new OctetString({ name: names.privateKey || "" }), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new ObjectIdentifier({ name: names.namedCurve || "" })]
					}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [new BitString({ name: names.publicKey || "" })]
					})]
				});
			}
		}]);

		return ECPrivateKey;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC3447
  */


	var OtherPrimeInfo = function () {
		//**********************************************************************************
		/**
   * Constructor for OtherPrimeInfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function OtherPrimeInfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, OtherPrimeInfo);

			//region Internal properties of the object
			/**
    * @type {Integer}
    * @description prime
    */
			this.prime = getParametersValue(parameters, "prime", OtherPrimeInfo.defaultValues("prime"));
			/**
    * @type {Integer}
    * @description exponent
    */
			this.exponent = getParametersValue(parameters, "exponent", OtherPrimeInfo.defaultValues("exponent"));
			/**
    * @type {Integer}
    * @description coefficient
    */
			this.coefficient = getParametersValue(parameters, "coefficient", OtherPrimeInfo.defaultValues("coefficient"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
			//region If input argument array contains "json" for this object
			if ("json" in parameters) this.fromJSON(parameters.json);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(OtherPrimeInfo, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, OtherPrimeInfo.schema({
					names: {
						prime: "prime",
						exponent: "exponent",
						coefficient: "coefficient"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for OtherPrimeInfo");
				//endregion

				//region Get internal properties from parsed schema
				this.prime = asn1.result.prime.convertFromDER();
				this.exponent = asn1.result.exponent.convertFromDER();
				this.coefficient = asn1.result.coefficient.convertFromDER();
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [this.prime.convertToDER(), this.exponent.convertToDER(), this.coefficient.convertToDER()]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					r: toBase64(arrayBufferToString(this.prime.valueBlock.valueHex), true, true),
					d: toBase64(arrayBufferToString(this.exponent.valueBlock.valueHex), true, true),
					t: toBase64(arrayBufferToString(this.coefficient.valueBlock.valueHex), true, true)
				};
			}
			//**********************************************************************************
			/**
    * Convert JSON value into current object
    * @param {Object} json
    */

		}, {
			key: "fromJSON",
			value: function fromJSON(json) {
				if ("r" in json) this.prime = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.r, true)) });else throw new Error("Absent mandatory parameter \"r\"");

				if ("d" in json) this.exponent = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.d, true)) });else throw new Error("Absent mandatory parameter \"d\"");

				if ("t" in json) this.coefficient = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.t, true)) });else throw new Error("Absent mandatory parameter \"t\"");
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "prime":
						return new Integer();
					case "exponent":
						return new Integer();
					case "coefficient":
						return new Integer();
					default:
						throw new Error("Invalid member name for OtherPrimeInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//OtherPrimeInfo ::= Sequence {
				//    prime             Integer,  -- ri
				//    exponent          Integer,  -- di
				//    coefficient       Integer   -- ti
				//}

				/**
     * @type {Object}
     * @property {string} prime
     * @property {string} exponent
     * @property {string} coefficient
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.prime || "" }), new Integer({ name: names.exponent || "" }), new Integer({ name: names.coefficient || "" })]
				});
			}
		}]);

		return OtherPrimeInfo;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC3447
  */


	var RSAPrivateKey = function () {
		//**********************************************************************************
		/**
   * Constructor for RSAPrivateKey class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function RSAPrivateKey() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, RSAPrivateKey);

			//region Internal properties of the object
			/**
    * @type {number}
    * @description version
    */
			this.version = getParametersValue(parameters, "version", RSAPrivateKey.defaultValues("version"));
			/**
    * @type {Integer}
    * @description modulus
    */
			this.modulus = getParametersValue(parameters, "modulus", RSAPrivateKey.defaultValues("modulus"));
			/**
    * @type {Integer}
    * @description publicExponent
    */
			this.publicExponent = getParametersValue(parameters, "publicExponent", RSAPrivateKey.defaultValues("publicExponent"));
			/**
    * @type {Integer}
    * @description privateExponent
    */
			this.privateExponent = getParametersValue(parameters, "privateExponent", RSAPrivateKey.defaultValues("privateExponent"));
			/**
    * @type {Integer}
    * @description prime1
    */
			this.prime1 = getParametersValue(parameters, "prime1", RSAPrivateKey.defaultValues("prime1"));
			/**
    * @type {Integer}
    * @description prime2
    */
			this.prime2 = getParametersValue(parameters, "prime2", RSAPrivateKey.defaultValues("prime2"));
			/**
    * @type {Integer}
    * @description exponent1
    */
			this.exponent1 = getParametersValue(parameters, "exponent1", RSAPrivateKey.defaultValues("exponent1"));
			/**
    * @type {Integer}
    * @description exponent2
    */
			this.exponent2 = getParametersValue(parameters, "exponent2", RSAPrivateKey.defaultValues("exponent2"));
			/**
    * @type {Integer}
    * @description coefficient
    */
			this.coefficient = getParametersValue(parameters, "coefficient", RSAPrivateKey.defaultValues("coefficient"));

			if ("otherPrimeInfos" in parameters)
				/**
     * @type {Array.<OtherPrimeInfo>}
     * @description otherPrimeInfos
     */
				this.otherPrimeInfos = getParametersValue(parameters, "otherPrimeInfos", RSAPrivateKey.defaultValues("otherPrimeInfos"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
			//region If input argument array contains "json" for this object
			if ("json" in parameters) this.fromJSON(parameters.json);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(RSAPrivateKey, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, RSAPrivateKey.schema({
					names: {
						version: "version",
						modulus: "modulus",
						publicExponent: "publicExponent",
						privateExponent: "privateExponent",
						prime1: "prime1",
						prime2: "prime2",
						exponent1: "exponent1",
						exponent2: "exponent2",
						coefficient: "coefficient",
						otherPrimeInfo: {
							names: {
								blockName: "otherPrimeInfos"
							}
						}
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for RSAPrivateKey");
				//endregion

				//region Get internal properties from parsed schema
				this.version = asn1.result.version.valueBlock.valueDec;
				this.modulus = asn1.result.modulus.convertFromDER(256);
				this.publicExponent = asn1.result.publicExponent;
				this.privateExponent = asn1.result.privateExponent.convertFromDER(256);
				this.prime1 = asn1.result.prime1.convertFromDER(128);
				this.prime2 = asn1.result.prime2.convertFromDER(128);
				this.exponent1 = asn1.result.exponent1.convertFromDER(128);
				this.exponent2 = asn1.result.exponent2.convertFromDER(128);
				this.coefficient = asn1.result.coefficient.convertFromDER(128);

				if ("otherPrimeInfos" in asn1.result) this.otherPrimeInfos = Array.from(asn1.result.otherPrimeInfos, function (element) {
					return new OtherPrimeInfo({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				outputArray.push(new Integer({ value: this.version }));
				outputArray.push(this.modulus.convertToDER());
				outputArray.push(this.publicExponent);
				outputArray.push(this.privateExponent.convertToDER());
				outputArray.push(this.prime1.convertToDER());
				outputArray.push(this.prime2.convertToDER());
				outputArray.push(this.exponent1.convertToDER());
				outputArray.push(this.exponent2.convertToDER());
				outputArray.push(this.coefficient.convertToDER());

				if ("otherPrimeInfos" in this) {
					outputArray.push(new Sequence({
						value: Array.from(this.otherPrimeInfos, function (element) {
							return element.toSchema();
						})
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var jwk = {
					n: toBase64(arrayBufferToString(this.modulus.valueBlock.valueHex), true, true),
					e: toBase64(arrayBufferToString(this.publicExponent.valueBlock.valueHex), true, true),
					d: toBase64(arrayBufferToString(this.privateExponent.valueBlock.valueHex), true, true),
					p: toBase64(arrayBufferToString(this.prime1.valueBlock.valueHex), true, true),
					q: toBase64(arrayBufferToString(this.prime2.valueBlock.valueHex), true, true),
					dp: toBase64(arrayBufferToString(this.exponent1.valueBlock.valueHex), true, true),
					dq: toBase64(arrayBufferToString(this.exponent2.valueBlock.valueHex), true, true),
					qi: toBase64(arrayBufferToString(this.coefficient.valueBlock.valueHex), true, true)
				};

				if ("otherPrimeInfos" in this) jwk.oth = Array.from(this.otherPrimeInfos, function (element) {
					return element.toJSON();
				});

				return jwk;
			}
			//**********************************************************************************
			/**
    * Convert JSON value into current object
    * @param {Object} json
    */

		}, {
			key: "fromJSON",
			value: function fromJSON(json) {
				if ("n" in json) this.modulus = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.n, true, true)) });else throw new Error("Absent mandatory parameter \"n\"");

				if ("e" in json) this.publicExponent = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.e, true, true)) });else throw new Error("Absent mandatory parameter \"e\"");

				if ("d" in json) this.privateExponent = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.d, true, true)) });else throw new Error("Absent mandatory parameter \"d\"");

				if ("p" in json) this.prime1 = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.p, true, true)) });else throw new Error("Absent mandatory parameter \"p\"");

				if ("q" in json) this.prime2 = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.q, true, true)) });else throw new Error("Absent mandatory parameter \"q\"");

				if ("dp" in json) this.exponent1 = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.dp, true, true)) });else throw new Error("Absent mandatory parameter \"dp\"");

				if ("dq" in json) this.exponent2 = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.dq, true, true)) });else throw new Error("Absent mandatory parameter \"dq\"");

				if ("qi" in json) this.coefficient = new Integer({ valueHex: stringToArrayBuffer(fromBase64(json.qi, true, true)) });else throw new Error("Absent mandatory parameter \"qi\"");

				if ("oth" in json) this.otherPrimeInfos = Array.from(json.oth, function (element) {
					return new OtherPrimeInfo({ json: element });
				});
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "version":
						return 0;
					case "modulus":
						return new Integer();
					case "publicExponent":
						return new Integer();
					case "privateExponent":
						return new Integer();
					case "prime1":
						return new Integer();
					case "prime2":
						return new Integer();
					case "exponent1":
						return new Integer();
					case "exponent2":
						return new Integer();
					case "coefficient":
						return new Integer();
					case "otherPrimeInfos":
						return [];
					default:
						throw new Error("Invalid member name for RSAPrivateKey class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//RSAPrivateKey ::= Sequence {
				//    version           Version,
				//    modulus           Integer,  -- n
				//    publicExponent    Integer,  -- e
				//    privateExponent   Integer,  -- d
				//    prime1            Integer,  -- p
				//    prime2            Integer,  -- q
				//    exponent1         Integer,  -- d mod (p-1)
				//    exponent2         Integer,  -- d mod (q-1)
				//    coefficient       Integer,  -- (inverse of q) mod p
				//    otherPrimeInfos   OtherPrimeInfos OPTIONAL
				//}
				//
				//OtherPrimeInfos ::= Sequence SIZE(1..MAX) OF OtherPrimeInfo

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [version]
     * @property {string} [modulus]
     * @property {string} [publicExponent]
     * @property {string} [privateExponent]
     * @property {string} [prime1]
     * @property {string} [prime2]
     * @property {string} [exponent1]
     * @property {string} [exponent2]
     * @property {string} [coefficient]
     * @property {string} [otherPrimeInfosName]
     * @property {Object} [otherPrimeInfo]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.version || "" }), new Integer({ name: names.modulus || "" }), new Integer({ name: names.publicExponent || "" }), new Integer({ name: names.privateExponent || "" }), new Integer({ name: names.prime1 || "" }), new Integer({ name: names.prime2 || "" }), new Integer({ name: names.exponent1 || "" }), new Integer({ name: names.exponent2 || "" }), new Integer({ name: names.coefficient || "" }), new Sequence({
						optional: true,
						value: [new Repeated({
							name: names.otherPrimeInfosName || "",
							value: OtherPrimeInfo.schema(names.otherPrimeInfo || {})
						})]
					})]
				});
			}
		}]);

		return RSAPrivateKey;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5208
  */


	var PrivateKeyInfo = function () {
		//**********************************************************************************
		/**
   * Constructor for PrivateKeyInfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function PrivateKeyInfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, PrivateKeyInfo);

			//region Internal properties of the object
			/**
    * @type {number}
    * @description version
    */
			this.version = getParametersValue(parameters, "version", PrivateKeyInfo.defaultValues("version"));
			/**
    * @type {AlgorithmIdentifier}
    * @description privateKeyAlgorithm
    */
			this.privateKeyAlgorithm = getParametersValue(parameters, "privateKeyAlgorithm", PrivateKeyInfo.defaultValues("privateKeyAlgorithm"));
			/**
    * @type {OctetString}
    * @description privateKey
    */
			this.privateKey = getParametersValue(parameters, "privateKey", PrivateKeyInfo.defaultValues("privateKey"));

			if ("attributes" in parameters)
				/**
     * @type {Array.<Attribute>}
     * @description attributes
     */
				this.attributes = getParametersValue(parameters, "attributes", PrivateKeyInfo.defaultValues("attributes"));

			if ("parsedKey" in parameters)
				/**
     * @type {ECPrivateKey|RSAPrivateKey}
     * @description Parsed public key value
     */
				this.parsedKey = getParametersValue(parameters, "parsedKey", PrivateKeyInfo.defaultValues("parsedKey"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
			//region If input argument array contains "json" for this object
			if ("json" in parameters) this.fromJSON(parameters.json);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(PrivateKeyInfo, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, PrivateKeyInfo.schema({
					names: {
						version: "version",
						privateKeyAlgorithm: {
							names: {
								blockName: "privateKeyAlgorithm"
							}
						},
						privateKey: "privateKey",
						attributes: "attributes"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PKCS8");
				//endregion

				//region Get internal properties from parsed schema
				this.version = asn1.result.version.valueBlock.valueDec;
				this.privateKeyAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.privateKeyAlgorithm });
				this.privateKey = asn1.result.privateKey;

				if ("attributes" in asn1.result) this.attributes = Array.from(asn1.result.attributes, function (element) {
					return new Attribute({ schema: element });
				});

				switch (this.privateKeyAlgorithm.algorithmId) {
					case "1.2.840.113549.1.1.1":
						// RSA
						{
							var privateKeyASN1 = fromBER(this.privateKey.valueBlock.valueHex);
							if (privateKeyASN1.offset !== -1) this.parsedKey = new RSAPrivateKey({ schema: privateKeyASN1.result });
						}
						break;
					case "1.2.840.10045.2.1":
						// ECDSA
						if ("algorithmParams" in this.privateKeyAlgorithm) {
							if (this.privateKeyAlgorithm.algorithmParams instanceof ObjectIdentifier) {
								var _privateKeyASN = fromBER(this.privateKey.valueBlock.valueHex);
								if (_privateKeyASN.offset !== -1) {
									this.parsedKey = new ECPrivateKey({
										namedCurve: this.privateKeyAlgorithm.algorithmParams.valueBlock.toString(),
										schema: _privateKeyASN.result
									});
								}
							}
						}
						break;
					default:
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [new Integer({ value: this.version }), this.privateKeyAlgorithm.toSchema(), this.privateKey];

				if ("attributes" in this) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: Array.from(this.attributes, function (element) {
							return element.toSchema();
						})
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				//region Return common value in case we do not have enough info fo making JWK
				if ("parsedKey" in this === false) {
					var object = {
						version: this.version,
						privateKeyAlgorithm: this.privateKeyAlgorithm.toJSON(),
						privateKey: this.privateKey.toJSON()
					};

					if ("attributes" in this) object.attributes = Array.from(this.attributes, function (element) {
						return element.toJSON();
					});

					return object;
				}
				//endregion

				//region Making JWK
				var jwk = {};

				switch (this.privateKeyAlgorithm.algorithmId) {
					case "1.2.840.10045.2.1":
						// ECDSA
						jwk.kty = "EC";
						break;
					case "1.2.840.113549.1.1.1":
						// RSA
						jwk.kty = "RSA";
						break;
					default:
				}

				var publicKeyJWK = this.parsedKey.toJSON();

				var _iteratorNormalCompletion6 = true;
				var _didIteratorError6 = false;
				var _iteratorError6 = undefined;

				try {
					for (var _iterator6 = Object.keys(publicKeyJWK)[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
						var key = _step6.value;

						jwk[key] = publicKeyJWK[key];
					}
				} catch (err) {
					_didIteratorError6 = true;
					_iteratorError6 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion6 && _iterator6.return) {
							_iterator6.return();
						}
					} finally {
						if (_didIteratorError6) {
							throw _iteratorError6;
						}
					}
				}

				return jwk;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert JSON value into current object
    * @param {Object} json
    */

		}, {
			key: "fromJSON",
			value: function fromJSON(json) {
				if ("kty" in json) {
					switch (json.kty.toUpperCase()) {
						case "EC":
							this.parsedKey = new ECPrivateKey({ json: json });

							this.privateKeyAlgorithm = new AlgorithmIdentifier({
								algorithmId: "1.2.840.10045.2.1",
								algorithmParams: new ObjectIdentifier({ value: this.parsedKey.namedCurve })
							});
							break;
						case "RSA":
							this.parsedKey = new RSAPrivateKey({ json: json });

							this.privateKeyAlgorithm = new AlgorithmIdentifier({
								algorithmId: "1.2.840.113549.1.1.1",
								algorithmParams: new Null()
							});
							break;
						default:
							throw new Error("Invalid value for \"kty\" parameter: " + json.kty);
					}

					this.privateKey = new OctetString({ valueHex: this.parsedKey.toSchema().toBER(false) });
				}
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "version":
						return 0;
					case "privateKeyAlgorithm":
						return new AlgorithmIdentifier();
					case "privateKey":
						return new OctetString();
					case "attributes":
						return [];
					default:
						throw new Error("Invalid member name for PrivateKeyInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//PrivateKeyInfo ::= SEQUENCE {
				//    version Version,
				//    privateKeyAlgorithm AlgorithmIdentifier {{PrivateKeyAlgorithms}},
				//    privateKey PrivateKey,
				//    attributes [0] Attributes OPTIONAL }
				//
				//Version ::= INTEGER {v1(0)} (v1,...)
				//
				//PrivateKey ::= OCTET STRING
				//
				//Attributes ::= SET OF Attribute

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [version]
     * @property {string} [privateKeyAlgorithm]
     * @property {string} [privateKey]
     * @property {string} [attributes]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.version || "" }), AlgorithmIdentifier.schema(names.privateKeyAlgorithm || {}), new OctetString({ name: names.privateKey || "" }), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new Repeated({
							name: names.attributes || "",
							value: Attribute.schema()
						})]
					})]
				});
			}
		}]);

		return PrivateKeyInfo;
	}();
	//**************************************************************************************

	//**************************************************************************************


	var CryptoEngine = function () {
		//**********************************************************************************
		/**
   * Constructor for CryptoEngine class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function CryptoEngine() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, CryptoEngine);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description Usually here we are expecting "window.crypto.subtle" or an equivalent from custom "crypto engine"
    */
			this.crypto = getParametersValue(parameters, "crypto", {});

			/**
    * @type {string}
    * @description Name of the "crypto engine"
    */
			this.name = getParametersValue(parameters, "name", "");
			//endregion
		}
		//**********************************************************************************
		/**
   * Import WebCrypto keys from different formats
   * @param {string} format
   * @param {ArrayBuffer|Object} keyData
   * @param {Object} algorithm
   * @param {boolean} extractable
   * @param {Array} keyUsages
   * @returns {Promise}
   */


		_createClass(CryptoEngine, [{
			key: "importKey",
			value: function importKey(format, keyData, algorithm, extractable, keyUsages) {
				//region Initial variables
				var jwk = {};
				//endregion

				//region Change "keyData" type if needed
				if (keyData instanceof Uint8Array) keyData = keyData.buffer;
				//endregion

				switch (format.toLowerCase()) {
					case "raw":
						return this.crypto.importKey("raw", keyData, algorithm, extractable, keyUsages);
					case "spki":
						{
							var asn1 = fromBER(keyData);
							if (asn1.offset === -1) return Promise.reject("Incorrect keyData");

							var publicKeyInfo = new PublicKeyInfo();
							try {
								publicKeyInfo.fromSchema(asn1.result);
							} catch (ex) {
								return Promise.reject("Incorrect keyData");
							}

							switch (algorithm.name.toUpperCase()) {
								case "RSA-PSS":
									{
										//region Get information about used hash function
										switch (algorithm.hash.name.toUpperCase()) {
											case "SHA-1":
												jwk.alg = "PS1";
												break;
											case "SHA-256":
												jwk.alg = "PS256";
												break;
											case "SHA-384":
												jwk.alg = "PS384";
												break;
											case "SHA-512":
												jwk.alg = "PS512";
												break;
											default:
												return Promise.reject("Incorrect hash algorithm: " + algorithm.hash.name.toUpperCase());
										}
										//endregion
									}
								case "RSASSA-PKCS1-V1_5":
									{
										keyUsages = ["verify"]; // Override existing keyUsages value since the key is a public key

										jwk.kty = "RSA";
										jwk.ext = extractable;
										jwk.key_ops = keyUsages;

										if (publicKeyInfo.algorithm.algorithmId !== "1.2.840.113549.1.1.1") return Promise.reject("Incorrect public key algorithm: " + publicKeyInfo.algorithm.algorithmId);

										//region Get information about used hash function
										if ("alg" in jwk === false) {
											switch (algorithm.hash.name.toUpperCase()) {
												case "SHA-1":
													jwk.alg = "RS1";
													break;
												case "SHA-256":
													jwk.alg = "RS256";
													break;
												case "SHA-384":
													jwk.alg = "RS384";
													break;
												case "SHA-512":
													jwk.alg = "RS512";
													break;
												default:
													return Promise.reject("Incorrect public key algorithm: " + publicKeyInfo.algorithm.algorithmId);
											}
										}
										//endregion

										//region Create RSA Public Key elements
										var publicKeyJSON = publicKeyInfo.toJSON();

										var _iteratorNormalCompletion7 = true;
										var _didIteratorError7 = false;
										var _iteratorError7 = undefined;

										try {
											for (var _iterator7 = Object.keys(publicKeyJSON)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
												var key = _step7.value;

												jwk[key] = publicKeyJSON[key];
											} //endregion
										} catch (err) {
											_didIteratorError7 = true;
											_iteratorError7 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion7 && _iterator7.return) {
													_iterator7.return();
												}
											} finally {
												if (_didIteratorError7) {
													throw _iteratorError7;
												}
											}
										}
									}
									break;
								case "ECDSA":
									keyUsages = ["verify"]; // Override existing keyUsages value since the key is a public key
								case "ECDH":
									{
										//region Initial variables
										jwk = {
											kty: "EC",
											ext: extractable,
											key_ops: keyUsages
										};
										//endregion

										//region Get information about algorithm
										if (publicKeyInfo.algorithm.algorithmId !== "1.2.840.10045.2.1") return Promise.reject("Incorrect public key algorithm: " + publicKeyInfo.algorithm.algorithmId);
										//endregion

										//region Create ECDSA Public Key elements
										var _publicKeyJSON = publicKeyInfo.toJSON();

										var _iteratorNormalCompletion8 = true;
										var _didIteratorError8 = false;
										var _iteratorError8 = undefined;

										try {
											for (var _iterator8 = Object.keys(_publicKeyJSON)[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
												var _key2 = _step8.value;

												jwk[_key2] = _publicKeyJSON[_key2];
											} //endregion
										} catch (err) {
											_didIteratorError8 = true;
											_iteratorError8 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion8 && _iterator8.return) {
													_iterator8.return();
												}
											} finally {
												if (_didIteratorError8) {
													throw _iteratorError8;
												}
											}
										}
									}
									break;
								case "RSA-OAEP":
									{
										jwk.kty = "RSA";
										jwk.ext = extractable;
										jwk.key_ops = keyUsages;

										if (this.name.toLowerCase() === "safari") jwk.alg = "RSA-OAEP";else {
											switch (algorithm.hash.name.toUpperCase()) {
												case "SHA-1":
													jwk.alg = "RSA-OAEP-1";
													break;
												case "SHA-256":
													jwk.alg = "RSA-OAEP-256";
													break;
												case "SHA-384":
													jwk.alg = "RSA-OAEP-384";
													break;
												case "SHA-512":
													jwk.alg = "RSA-OAEP-512";
													break;
												default:
													return Promise.reject("Incorrect public key algorithm: " + publicKeyInfo.algorithm.algorithmId);
											}
										}

										//region Create ECDSA Public Key elements
										var _publicKeyJSON2 = publicKeyInfo.toJSON();

										var _iteratorNormalCompletion9 = true;
										var _didIteratorError9 = false;
										var _iteratorError9 = undefined;

										try {
											for (var _iterator9 = Object.keys(_publicKeyJSON2)[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
												var _key3 = _step9.value;

												jwk[_key3] = _publicKeyJSON2[_key3];
											} //endregion
										} catch (err) {
											_didIteratorError9 = true;
											_iteratorError9 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion9 && _iterator9.return) {
													_iterator9.return();
												}
											} finally {
												if (_didIteratorError9) {
													throw _iteratorError9;
												}
											}
										}
									}
									break;
								default:
									return Promise.reject("Incorrect algorithm name: " + algorithm.name.toUpperCase());
							}
						}
						break;
					case "pkcs8":
						{
							var privateKeyInfo = new PrivateKeyInfo();

							//region Parse "PrivateKeyInfo" object
							var _asn = fromBER(keyData);
							if (_asn.offset === -1) return Promise.reject("Incorrect keyData");

							try {
								privateKeyInfo.fromSchema(_asn.result);
							} catch (ex) {
								return Promise.reject("Incorrect keyData");
							}
							//endregion

							switch (algorithm.name.toUpperCase()) {
								case "RSA-PSS":
									{
										//region Get information about used hash function
										switch (algorithm.hash.name.toUpperCase()) {
											case "SHA-1":
												jwk.alg = "PS1";
												break;
											case "SHA-256":
												jwk.alg = "PS256";
												break;
											case "SHA-384":
												jwk.alg = "PS384";
												break;
											case "SHA-512":
												jwk.alg = "PS512";
												break;
											default:
												return Promise.reject("Incorrect hash algorithm: " + algorithm.hash.name.toUpperCase());
										}
										//endregion
									}
								case "RSASSA-PKCS1-V1_5":
									{
										keyUsages = ["sign"]; // Override existing keyUsages value since the key is a private key

										jwk.kty = "RSA";
										jwk.ext = extractable;
										jwk.key_ops = keyUsages;

										//region Get information about used hash function
										if (privateKeyInfo.privateKeyAlgorithm.algorithmId !== "1.2.840.113549.1.1.1") return Promise.reject("Incorrect private key algorithm: " + privateKeyInfo.privateKeyAlgorithm.algorithmId);
										//endregion

										//region Get information about used hash function
										if ("alg" in jwk === false) {
											switch (algorithm.hash.name.toUpperCase()) {
												case "SHA-1":
													jwk.alg = "RS1";
													break;
												case "SHA-256":
													jwk.alg = "RS256";
													break;
												case "SHA-384":
													jwk.alg = "RS384";
													break;
												case "SHA-512":
													jwk.alg = "RS512";
													break;
												default:
													return Promise.reject("Incorrect hash algorithm: " + algorithm.hash.name.toUpperCase());
											}
										}
										//endregion

										//region Create RSA Private Key elements
										var privateKeyJSON = privateKeyInfo.toJSON();

										var _iteratorNormalCompletion10 = true;
										var _didIteratorError10 = false;
										var _iteratorError10 = undefined;

										try {
											for (var _iterator10 = Object.keys(privateKeyJSON)[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
												var _key4 = _step10.value;

												jwk[_key4] = privateKeyJSON[_key4];
											} //endregion
										} catch (err) {
											_didIteratorError10 = true;
											_iteratorError10 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion10 && _iterator10.return) {
													_iterator10.return();
												}
											} finally {
												if (_didIteratorError10) {
													throw _iteratorError10;
												}
											}
										}
									}
									break;
								case "ECDSA":
									keyUsages = ["sign"]; // Override existing keyUsages value since the key is a private key
								case "ECDH":
									{
										//region Initial variables
										jwk = {
											kty: "EC",
											ext: extractable,
											key_ops: keyUsages
										};
										//endregion

										//region Get information about used hash function
										if (privateKeyInfo.privateKeyAlgorithm.algorithmId !== "1.2.840.10045.2.1") return Promise.reject("Incorrect algorithm: " + privateKeyInfo.privateKeyAlgorithm.algorithmId);
										//endregion

										//region Create ECDSA Private Key elements
										var _privateKeyJSON = privateKeyInfo.toJSON();

										var _iteratorNormalCompletion11 = true;
										var _didIteratorError11 = false;
										var _iteratorError11 = undefined;

										try {
											for (var _iterator11 = Object.keys(_privateKeyJSON)[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
												var _key5 = _step11.value;

												jwk[_key5] = _privateKeyJSON[_key5];
											} //endregion
										} catch (err) {
											_didIteratorError11 = true;
											_iteratorError11 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion11 && _iterator11.return) {
													_iterator11.return();
												}
											} finally {
												if (_didIteratorError11) {
													throw _iteratorError11;
												}
											}
										}
									}
									break;
								case "RSA-OAEP":
									{
										jwk.kty = "RSA";
										jwk.ext = extractable;
										jwk.key_ops = keyUsages;

										//region Get information about used hash function
										if (this.name.toLowerCase() === "safari") jwk.alg = "RSA-OAEP";else {
											switch (algorithm.hash.name.toUpperCase()) {
												case "SHA-1":
													jwk.alg = "RSA-OAEP-1";
													break;
												case "SHA-256":
													jwk.alg = "RSA-OAEP-256";
													break;
												case "SHA-384":
													jwk.alg = "RSA-OAEP-384";
													break;
												case "SHA-512":
													jwk.alg = "RSA-OAEP-512";
													break;
												default:
													return Promise.reject("Incorrect hash algorithm: " + algorithm.hash.name.toUpperCase());
											}
										}
										//endregion

										//region Create RSA Private Key elements
										var _privateKeyJSON2 = privateKeyInfo.toJSON();

										var _iteratorNormalCompletion12 = true;
										var _didIteratorError12 = false;
										var _iteratorError12 = undefined;

										try {
											for (var _iterator12 = Object.keys(_privateKeyJSON2)[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
												var _key6 = _step12.value;

												jwk[_key6] = _privateKeyJSON2[_key6];
											} //endregion
										} catch (err) {
											_didIteratorError12 = true;
											_iteratorError12 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion12 && _iterator12.return) {
													_iterator12.return();
												}
											} finally {
												if (_didIteratorError12) {
													throw _iteratorError12;
												}
											}
										}
									}
									break;
								default:
									return Promise.reject("Incorrect algorithm name: " + algorithm.name.toUpperCase());
							}
						}
						break;
					case "jwk":
						jwk = keyData;
						break;
					default:
						return Promise.reject("Incorrect format: " + format);
				}

				//region Special case for Safari browser (since its acting not as WebCrypto standard describes)
				if (this.name.toLowerCase() === "safari") {
					if (jwk instanceof ArrayBuffer === false) jwk = stringToArrayBuffer(JSON.stringify(jwk));
				}
				//endregion

				return this.crypto.importKey("jwk", jwk, algorithm, extractable, keyUsages);
			}
			//**********************************************************************************
			/**
    * Export WebCrypto keys to different formats
    * @param {string} format
    * @param {Object} key
    * @returns {Promise}
    */

		}, {
			key: "exportKey",
			value: function exportKey(format, key) {
				var sequence = this.crypto.exportKey("jwk", key);

				//region Currently Safari returns ArrayBuffer as JWK thus we need an additional transformation
				if (this.name.toLowerCase() === "safari") sequence = sequence.then(function (result) {
					return JSON.parse(arrayBufferToString(result));
				});
				//endregion

				switch (format.toLowerCase()) {
					case "raw":
						return this.crypto.exportKey("raw", key);
					case "spki":
						sequence = sequence.then(function (result) {
							var publicKeyInfo = new PublicKeyInfo();

							try {
								publicKeyInfo.fromJSON(result);
							} catch (ex) {
								return Promise.reject("Incorrect key data");
							}

							return publicKeyInfo.toSchema().toBER(false);
						});
						break;
					case "pkcs8":
						sequence = sequence.then(function (result) {
							var privateKeyInfo = new PrivateKeyInfo();

							try {
								privateKeyInfo.fromJSON(result);
							} catch (ex) {
								return Promise.reject("Incorrect key data");
							}

							return privateKeyInfo.toSchema().toBER(false);
						});
						break;
					case "jwk":
						break;
					default:
						return Promise.reject("Incorrect format: " + format);
				}

				return sequence;
			}
			//**********************************************************************************
			/**
    * Convert WebCrypto keys between different export formats
    * @param {string} inputFormat
    * @param {string} outputFormat
    * @param {ArrayBuffer|Object} keyData
    * @param {Object} algorithm
    * @param {boolean} extractable
    * @param {Array} keyUsages
    * @returns {Promise}
    */

		}, {
			key: "convert",
			value: function convert(inputFormat, outputFormat, keyData, algorithm, extractable, keyUsages) {
				var _this52 = this;

				switch (inputFormat.toLowerCase()) {
					case "raw":
						switch (outputFormat.toLowerCase()) {
							case "raw":
								return Promise.resolve(keyData);
							case "spki":
								return Promise.resolve().then(function () {
									return _this52.importKey("raw", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this52.exportKey("spki", result);
								});
							case "pkcs8":
								return Promise.resolve().then(function () {
									return _this52.importKey("raw", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this52.exportKey("pkcs8", result);
								});
							case "jwk":
								return Promise.resolve().then(function () {
									return _this52.importKey("raw", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this52.exportKey("jwk", result);
								});
							default:
								return Promise.reject("Incorrect outputFormat: " + outputFormat);
						}
					case "spki":
						switch (outputFormat.toLowerCase()) {
							case "raw":
								return Promise.resolve().then(function () {
									return _this52.importKey("spki", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this52.exportKey("raw", result);
								});
							case "spki":
								return Promise.resolve(keyData);
							case "pkcs8":
								return Promise.reject("Impossible to convert between SPKI/PKCS8");
							case "jwk":
								return Promise.resolve().then(function () {
									return _this52.importKey("spki", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this52.exportKey("jwk", result);
								});
							default:
								return Promise.reject("Incorrect outputFormat: " + outputFormat);
						}
					case "pkcs8":
						switch (outputFormat.toLowerCase()) {
							case "raw":
								return Promise.resolve().then(function () {
									return _this52.importKey("pkcs8", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this52.exportKey("raw", result);
								});
							case "spki":
								return Promise.reject("Impossible to convert between SPKI/PKCS8");
							case "pkcs8":
								return Promise.resolve(keyData);
							case "jwk":
								return Promise.resolve().then(function () {
									return _this52.importKey("pkcs8", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this52.exportKey("jwk", result);
								});
							default:
								return Promise.reject("Incorrect outputFormat: " + outputFormat);
						}
					case "jwk":
						switch (outputFormat.toLowerCase()) {
							case "raw":
								return Promise.resolve().then(function () {
									return _this52.importKey("jwk", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this52.exportKey("raw", result);
								});
							case "spki":
								return Promise.resolve().then(function () {
									return _this52.importKey("jwk", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this52.exportKey("spki", result);
								});
							case "pkcs8":
								return Promise.resolve().then(function () {
									return _this52.importKey("jwk", keyData, algorithm, extractable, keyUsages);
								}).then(function (result) {
									return _this52.exportKey("pkcs8", result);
								});
							case "jwk":
								return Promise.resolve(keyData);
							default:
								return Promise.reject("Incorrect outputFormat: " + outputFormat);
						}
					default:
						return Promise.reject("Incorrect inputFormat: " + inputFormat);
				}
			}
			//**********************************************************************************
			/**
    * Wrapper for standard function "encrypt"
    * @param args
    * @returns {Promise}
    */

		}, {
			key: "encrypt",
			value: function encrypt() {
				var _crypto;

				return (_crypto = this.crypto).encrypt.apply(_crypto, arguments);
			}
			//**********************************************************************************
			/**
    * Wrapper for standard function "decrypt"
    * @param args
    * @returns {Promise}
    */

		}, {
			key: "decrypt",
			value: function decrypt() {
				var _crypto2;

				return (_crypto2 = this.crypto).decrypt.apply(_crypto2, arguments);
			}
			//**********************************************************************************
			/**
    * Wrapper for standard function "sign"
    * @param args
    * @returns {Promise}
    */

		}, {
			key: "sign",
			value: function sign() {
				var _crypto3;

				return (_crypto3 = this.crypto).sign.apply(_crypto3, arguments);
			}
			//**********************************************************************************
			/**
    * Wrapper for standard function "verify"
    * @param args
    * @returns {Promise}
    */

		}, {
			key: "verify",
			value: function verify() {
				var _crypto4;

				return (_crypto4 = this.crypto).verify.apply(_crypto4, arguments);
			}
			//**********************************************************************************
			/**
    * Wrapper for standard function "digest"
    * @param args
    * @returns {Promise}
    */

		}, {
			key: "digest",
			value: function digest() {
				var _crypto5;

				return (_crypto5 = this.crypto).digest.apply(_crypto5, arguments);
			}
			//**********************************************************************************
			/**
    * Wrapper for standard function "generateKey"
    * @param args
    * @returns {Promise}
    */

		}, {
			key: "generateKey",
			value: function generateKey() {
				var _crypto6;

				return (_crypto6 = this.crypto).generateKey.apply(_crypto6, arguments);
			}
			//**********************************************************************************
			/**
    * Wrapper for standard function "deriveKey"
    * @param args
    * @returns {Promise}
    */

		}, {
			key: "deriveKey",
			value: function deriveKey() {
				var _crypto7;

				return (_crypto7 = this.crypto).deriveKey.apply(_crypto7, arguments);
			}
			//**********************************************************************************
			/**
    * Wrapper for standard function "deriveBits"
    * @param args
    * @returns {Promise}
    */

		}, {
			key: "deriveBits",
			value: function deriveBits() {
				var _crypto8;

				return (_crypto8 = this.crypto).deriveBits.apply(_crypto8, arguments);
			}
			//**********************************************************************************
			/**
    * Wrapper for standard function "wrapKey"
    * @param args
    * @returns {Promise}
    */

		}, {
			key: "wrapKey",
			value: function wrapKey() {
				var _crypto9;

				return (_crypto9 = this.crypto).wrapKey.apply(_crypto9, arguments);
			}
			//**********************************************************************************
			/**
    * Wrapper for standard function "unwrapKey"
    * @param args
    * @returns {Promise}
    */

		}, {
			key: "unwrapKey",
			value: function unwrapKey() {
				var _crypto10;

				return (_crypto10 = this.crypto).unwrapKey.apply(_crypto10, arguments);
			}
			//**********************************************************************************

		}]);

		return CryptoEngine;
	}();
	//**************************************************************************************

	//**************************************************************************************
	//region Crypto engine related function
	//**************************************************************************************


	var engine = {
		name: "none",
		crypto: null,
		subtle: null
	};
	//**************************************************************************************
	(function initCryptoEngine() {
		if (typeof self !== "undefined") {
			if ("crypto" in self) {
				var engineName = "webcrypto";

				/**
     * Standard crypto object
     * @type {Object}
     * @property {Object} [webkitSubtle] Subtle object from Apple
     */
				var cryptoObject = self.crypto;
				var subtleObject = null;

				// Apple Safari support
				if ("webkitSubtle" in self.crypto) {
					subtleObject = self.crypto.webkitSubtle;
					engineName = "safari";
				}

				if ("subtle" in self.crypto) subtleObject = self.crypto.subtle;

				engine = {
					name: engineName,
					crypto: cryptoObject,
					subtle: new CryptoEngine({ name: engineName, crypto: subtleObject })
				};
			}
		}
	})();
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	//region Declaration of common functions
	//**************************************************************************************
	/**
  * Get crypto subtle from current "crypto engine" or "undefined"
  * @returns {({decrypt, deriveKey, digest, encrypt, exportKey, generateKey, importKey, sign, unwrapKey, verify, wrapKey}|null)}
  */
	function getCrypto() {
		if (engine.subtle !== null) return engine.subtle;

		return undefined;
	}
	//**************************************************************************************
	/**
  * Initialize input Uint8Array by random values (with help from current "crypto engine")
  * @param {!Uint8Array} view
  * @returns {*}
  */
	function getRandomValues(view) {
		if (engine.crypto !== null) return engine.crypto.getRandomValues(view);

		throw new Error("No support for Web Cryptography API");
	}
	//**************************************************************************************
	/**
  * Get OID for each specific WebCrypto algorithm
  * @param {Object} algorithm WebCrypto algorithm
  * @returns {string}
  */
	function getOIDByAlgorithm(algorithm) {
		var result = "";

		switch (algorithm.name.toUpperCase()) {
			case "RSASSA-PKCS1-V1_5":
				switch (algorithm.hash.name.toUpperCase()) {
					case "SHA-1":
						result = "1.2.840.113549.1.1.5";
						break;
					case "SHA-256":
						result = "1.2.840.113549.1.1.11";
						break;
					case "SHA-384":
						result = "1.2.840.113549.1.1.12";
						break;
					case "SHA-512":
						result = "1.2.840.113549.1.1.13";
						break;
					default:
				}
				break;
			case "RSA-PSS":
				result = "1.2.840.113549.1.1.10";
				break;
			case "RSA-OAEP":
				result = "1.2.840.113549.1.1.7";
				break;
			case "ECDSA":
				switch (algorithm.hash.name.toUpperCase()) {
					case "SHA-1":
						result = "1.2.840.10045.4.1";
						break;
					case "SHA-256":
						result = "1.2.840.10045.4.3.2";
						break;
					case "SHA-384":
						result = "1.2.840.10045.4.3.3";
						break;
					case "SHA-512":
						result = "1.2.840.10045.4.3.4";
						break;
					default:
				}
				break;
			case "ECDH":
				switch (algorithm.kdf.toUpperCase()) {// Non-standard addition - hash algorithm of KDF function
					case "SHA-1":
						result = "1.3.133.16.840.63.0.2"; // dhSinglePass-stdDH-sha1kdf-scheme
						break;
					case "SHA-256":
						result = "1.3.132.1.11.1"; // dhSinglePass-stdDH-sha256kdf-scheme
						break;
					case "SHA-384":
						result = "1.3.132.1.11.2"; // dhSinglePass-stdDH-sha384kdf-scheme
						break;
					case "SHA-512":
						result = "1.3.132.1.11.3"; // dhSinglePass-stdDH-sha512kdf-scheme
						break;
					default:
				}
				break;
			case "AES-CTR":
				break;
			case "AES-CBC":
				switch (algorithm.length) {
					case 128:
						result = "2.16.840.1.101.3.4.1.2";
						break;
					case 192:
						result = "2.16.840.1.101.3.4.1.22";
						break;
					case 256:
						result = "2.16.840.1.101.3.4.1.42";
						break;
					default:
				}
				break;
			case "AES-CMAC":
				break;
			case "AES-GCM":
				switch (algorithm.length) {
					case 128:
						result = "2.16.840.1.101.3.4.1.6";
						break;
					case 192:
						result = "2.16.840.1.101.3.4.1.26";
						break;
					case 256:
						result = "2.16.840.1.101.3.4.1.46";
						break;
					default:
				}
				break;
			case "AES-CFB":
				switch (algorithm.length) {
					case 128:
						result = "2.16.840.1.101.3.4.1.4";
						break;
					case 192:
						result = "2.16.840.1.101.3.4.1.24";
						break;
					case 256:
						result = "2.16.840.1.101.3.4.1.44";
						break;
					default:
				}
				break;
			case "AES-KW":
				switch (algorithm.length) {
					case 128:
						result = "2.16.840.1.101.3.4.1.5";
						break;
					case 192:
						result = "2.16.840.1.101.3.4.1.25";
						break;
					case 256:
						result = "2.16.840.1.101.3.4.1.45";
						break;
					default:
				}
				break;
			case "HMAC":
				switch (algorithm.hash.name.toUpperCase()) {
					case "SHA-1":
						result = "1.2.840.113549.2.7";
						break;
					case "SHA-256":
						result = "1.2.840.113549.2.9";
						break;
					case "SHA-384":
						result = "1.2.840.113549.2.10";
						break;
					case "SHA-512":
						result = "1.2.840.113549.2.11";
						break;
					default:
				}
				break;
			case "DH":
				result = "1.2.840.113549.1.9.16.3.5";
				break;
			case "SHA-1":
				result = "1.3.14.3.2.26";
				break;
			case "SHA-256":
				result = "2.16.840.1.101.3.4.2.1";
				break;
			case "SHA-384":
				result = "2.16.840.1.101.3.4.2.2";
				break;
			case "SHA-512":
				result = "2.16.840.1.101.3.4.2.3";
				break;
			case "CONCAT":
				break;
			case "HKDF":
				break;
			case "PBKDF2":
				result = "1.2.840.113549.1.5.12";
				break;
			//region Special case - OIDs for ECC curves
			case "P-256":
				result = "1.2.840.10045.3.1.7";
				break;
			case "P-384":
				result = "1.3.132.0.34";
				break;
			case "P-521":
				result = "1.3.132.0.35";
				break;
			//endregion
			default:
		}

		return result;
	}
	//**************************************************************************************
	/**
  * Get default algorithm parameters for each kind of operation
  * @param {string} algorithmName Algorithm name to get common parameters for
  * @param {string} operation Kind of operation: "sign", "encrypt", "generatekey", "importkey", "exportkey", "verify"
  * @returns {*}
  */
	function getAlgorithmParameters(algorithmName, operation) {
		var result = {
			algorithm: {},
			usages: []
		};

		switch (algorithmName.toUpperCase()) {
			case "RSASSA-PKCS1-V1_5":
				switch (operation.toLowerCase()) {
					case "generatekey":
						result = {
							algorithm: {
								name: "RSASSA-PKCS1-v1_5",
								modulusLength: 2048,
								publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
								hash: {
									name: "SHA-256"
								}
							},
							usages: ["sign", "verify"]
						};
						break;
					case "verify":
					case "sign":
					case "importkey":
						result = {
							algorithm: {
								name: "RSASSA-PKCS1-v1_5",
								hash: {
									name: "SHA-256"
								}
							},
							usages: ["verify"] // For importKey("pkcs8") usage must be "sign" only
						};
						break;
					case "exportkey":
					default:
						return {
							algorithm: {
								name: "RSASSA-PKCS1-v1_5"
							},
							usages: []
						};
				}
				break;
			case "RSA-PSS":
				switch (operation.toLowerCase()) {
					case "sign":
					case "verify":
						result = {
							algorithm: {
								name: "RSA-PSS",
								hash: {
									name: "SHA-1"
								},
								saltLength: 20
							},
							usages: ["sign", "verify"]
						};
						break;
					case "generatekey":
						result = {
							algorithm: {
								name: "RSA-PSS",
								modulusLength: 2048,
								publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
								hash: {
									name: "SHA-1"
								}
							},
							usages: ["sign", "verify"]
						};
						break;
					case "importkey":
						result = {
							algorithm: {
								name: "RSA-PSS",
								hash: {
									name: "SHA-1"
								}
							},
							usages: ["verify"] // For importKey("pkcs8") usage must be "sign" only
						};
						break;
					case "exportkey":
					default:
						return {
							algorithm: {
								name: "RSA-PSS"
							},
							usages: []
						};
				}
				break;
			case "RSA-OAEP":
				switch (operation.toLowerCase()) {
					case "encrypt":
					case "decrypt":
						result = {
							algorithm: {
								name: "RSA-OAEP"
							},
							usages: ["encrypt", "decrypt"]
						};
						break;
					case "generatekey":
						result = {
							algorithm: {
								name: "RSA-OAEP",
								modulusLength: 2048,
								publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
								hash: {
									name: "SHA-256"
								}
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					case "importkey":
						result = {
							algorithm: {
								name: "RSA-OAEP",
								hash: {
									name: "SHA-256"
								}
							},
							usages: ["encrypt"] // encrypt for "spki" and decrypt for "pkcs8"
						};
						break;
					case "exportkey":
					default:
						return {
							algorithm: {
								name: "RSA-OAEP"
							},
							usages: []
						};
				}
				break;
			case "ECDSA":
				switch (operation.toLowerCase()) {
					case "generatekey":
						result = {
							algorithm: {
								name: "ECDSA",
								namedCurve: "P-256"
							},
							usages: ["sign", "verify"]
						};
						break;
					case "importkey":
						result = {
							algorithm: {
								name: "ECDSA",
								namedCurve: "P-256"
							},
							usages: ["verify"] // "sign" for "pkcs8"
						};
						break;
					case "verify":
					case "sign":
						result = {
							algorithm: {
								name: "ECDSA",
								hash: {
									name: "SHA-256"
								}
							},
							usages: ["sign"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "ECDSA"
							},
							usages: []
						};
				}
				break;
			case "ECDH":
				switch (operation.toLowerCase()) {
					case "exportkey":
					case "importkey":
					case "generatekey":
						result = {
							algorithm: {
								name: "ECDH",
								namedCurve: "P-256"
							},
							usages: ["deriveKey", "deriveBits"]
						};
						break;
					case "derivekey":
					case "derivebits":
						result = {
							algorithm: {
								name: "ECDH",
								namedCurve: "P-256",
								public: [] // Must be a "publicKey"
							},
							usages: ["encrypt", "decrypt"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "ECDH"
							},
							usages: []
						};
				}
				break;
			case "AES-CTR":
				switch (operation.toLowerCase()) {
					case "importkey":
					case "exportkey":
					case "generatekey":
						result = {
							algorithm: {
								name: "AES-CTR",
								length: 256
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					case "decrypt":
					case "encrypt":
						result = {
							algorithm: {
								name: "AES-CTR",
								counter: new Uint8Array(16),
								length: 10
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "AES-CTR"
							},
							usages: []
						};
				}
				break;
			case "AES-CBC":
				switch (operation.toLowerCase()) {
					case "importkey":
					case "exportkey":
					case "generatekey":
						result = {
							algorithm: {
								name: "AES-CBC",
								length: 256
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					case "decrypt":
					case "encrypt":
						result = {
							algorithm: {
								name: "AES-CBC",
								iv: getRandomValues(new Uint8Array(16)) // For "decrypt" the value should be replaced with value got on "encrypt" step
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "AES-CBC"
							},
							usages: []
						};
				}
				break;
			case "AES-GCM":
				switch (operation.toLowerCase()) {
					case "importkey":
					case "exportkey":
					case "generatekey":
						result = {
							algorithm: {
								name: "AES-GCM",
								length: 256
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					case "decrypt":
					case "encrypt":
						result = {
							algorithm: {
								name: "AES-GCM",
								iv: getRandomValues(new Uint8Array(16)) // For "decrypt" the value should be replaced with value got on "encrypt" step
							},
							usages: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "AES-GCM"
							},
							usages: []
						};
				}
				break;
			case "AES-KW":
				switch (operation.toLowerCase()) {
					case "importkey":
					case "exportkey":
					case "generatekey":
					case "wrapkey":
					case "unwrapkey":
						result = {
							algorithm: {
								name: "AES-KW",
								length: 256
							},
							usages: ["wrapKey", "unwrapKey"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "AES-KW"
							},
							usages: []
						};
				}
				break;
			case "HMAC":
				switch (operation.toLowerCase()) {
					case "sign":
					case "verify":
						result = {
							algorithm: {
								name: "HMAC"
							},
							usages: ["sign", "verify"]
						};
						break;
					case "importkey":
					case "exportkey":
					case "generatekey":
						result = {
							algorithm: {
								name: "HMAC",
								length: 32,
								hash: {
									name: "SHA-256"
								}
							},
							usages: ["sign", "verify"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "HMAC"
							},
							usages: []
						};
				}
				break;
			case "HKDF":
				switch (operation.toLowerCase()) {
					case "derivekey":
						result = {
							algorithm: {
								name: "HKDF",
								hash: "SHA-256",
								salt: new Uint8Array([]),
								info: new Uint8Array([])
							},
							usages: ["encrypt", "decrypt"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "HKDF"
							},
							usages: []
						};
				}
				break;
			case "PBKDF2":
				switch (operation.toLowerCase()) {
					case "derivekey":
						result = {
							algorithm: {
								name: "PBKDF2",
								hash: { name: "SHA-256" },
								salt: new Uint8Array([]),
								iterations: 1000
							},
							usages: ["encrypt", "decrypt"]
						};
						break;
					default:
						return {
							algorithm: {
								name: "PBKDF2"
							},
							usages: []
						};
				}
				break;
			default:
		}

		return result;
	}
	//**************************************************************************************
	/**
  * Create CMS ECDSA signature from WebCrypto ECDSA signature
  * @param {ArrayBuffer} signatureBuffer WebCrypto result of "sign" function
  * @returns {ArrayBuffer}
  */
	function createCMSECDSASignature(signatureBuffer) {
		// #region Initial check for correct length
		if (signatureBuffer.byteLength % 2 !== 0) return new ArrayBuffer(0);
		// #endregion

		// #region Initial variables
		var length = signatureBuffer.byteLength / 2; // There are two equal parts inside incoming ArrayBuffer

		var rBuffer = new ArrayBuffer(length);
		var rView = new Uint8Array(rBuffer);
		rView.set(new Uint8Array(signatureBuffer, 0, length));

		var rInteger = new Integer({ valueHex: rBuffer });

		var sBuffer = new ArrayBuffer(length);
		var sView = new Uint8Array(sBuffer);
		sView.set(new Uint8Array(signatureBuffer, length, length));

		var sInteger = new Integer({ valueHex: sBuffer });
		// #endregion

		return new Sequence({
			value: [rInteger.convertToDER(), sInteger.convertToDER()]
		}).toBER(false);
	}
	//**************************************************************************************
	/**
  * String preparation function. In a future here will be realization of algorithm from RFC4518
  * @param {string} inputString JavaScript string. As soon as for each ASN.1 string type we have a specific transformation function here we will work with pure JavaScript string
  * @returns {string} Formated string
  */
	function stringPrep(inputString) {
		var result = inputString.replace(/^\s+|\s+$/g, ""); // Trim input string
		result = result.replace(/\s+/g, " "); // Change all sequence of SPACE down to SPACE char
		result = result.toLowerCase();

		return result;
	}
	//**************************************************************************************
	/**
  * Create a single ArrayBuffer from CMS ECDSA signature
  * @param {Sequence} cmsSignature ASN.1 SEQUENCE contains CMS ECDSA signature
  * @returns {ArrayBuffer}
  */
	function createECDSASignatureFromCMS(cmsSignature) {
		// #region Check input variables
		if (cmsSignature instanceof Sequence === false) return new ArrayBuffer(0);

		if (cmsSignature.valueBlock.value.length !== 2) return new ArrayBuffer(0);

		if (cmsSignature.valueBlock.value[0] instanceof Integer === false) return new ArrayBuffer(0);

		if (cmsSignature.valueBlock.value[1] instanceof Integer === false) return new ArrayBuffer(0);
		// #endregion 

		var rValue = cmsSignature.valueBlock.value[0].convertFromDER();
		var sValue = cmsSignature.valueBlock.value[1].convertFromDER();

		return utilConcatBuf(rValue.valueBlock.valueHex, sValue.valueBlock.valueHex);
	}
	//**************************************************************************************
	/**
  * Get WebCrypto algorithm by wel-known OID
  * @param {string} oid Wel-known OID to search for
  * @returns {Object}
  */
	function getAlgorithmByOID(oid) {
		switch (oid) {
			case "1.2.840.113549.1.1.1":
			case "1.2.840.113549.1.1.5":
				return {
					name: "RSASSA-PKCS1-v1_5",
					hash: {
						name: "SHA-1"
					}
				};
			case "1.2.840.113549.1.1.11":
				return {
					name: "RSASSA-PKCS1-v1_5",
					hash: {
						name: "SHA-256"
					}
				};
			case "1.2.840.113549.1.1.12":
				return {
					name: "RSASSA-PKCS1-v1_5",
					hash: {
						name: "SHA-384"
					}
				};
			case "1.2.840.113549.1.1.13":
				return {
					name: "RSASSA-PKCS1-v1_5",
					hash: {
						name: "SHA-512"
					}
				};
			case "1.2.840.113549.1.1.10":
				return {
					name: "RSA-PSS"
				};
			case "1.2.840.113549.1.1.7":
				return {
					name: "RSA-OAEP"
				};
			case "1.2.840.10045.2.1":
			case "1.2.840.10045.4.1":
				return {
					name: "ECDSA",
					hash: {
						name: "SHA-1"
					}
				};
			case "1.2.840.10045.4.3.2":
				return {
					name: "ECDSA",
					hash: {
						name: "SHA-256"
					}
				};
			case "1.2.840.10045.4.3.3":
				return {
					name: "ECDSA",
					hash: {
						name: "SHA-384"
					}
				};
			case "1.2.840.10045.4.3.4":
				return {
					name: "ECDSA",
					hash: {
						name: "SHA-512"
					}
				};
			case "1.3.133.16.840.63.0.2":
				return {
					name: "ECDH",
					kdf: "SHA-1"
				};
			case "1.3.132.1.11.1":
				return {
					name: "ECDH",
					kdf: "SHA-256"
				};
			case "1.3.132.1.11.2":
				return {
					name: "ECDH",
					kdf: "SHA-384"
				};
			case "1.3.132.1.11.3":
				return {
					name: "ECDH",
					kdf: "SHA-512"
				};
			case "2.16.840.1.101.3.4.1.2":
				return {
					name: "AES-CBC",
					length: 128
				};
			case "2.16.840.1.101.3.4.1.22":
				return {
					name: "AES-CBC",
					length: 192
				};
			case "2.16.840.1.101.3.4.1.42":
				return {
					name: "AES-CBC",
					length: 256
				};
			case "2.16.840.1.101.3.4.1.6":
				return {
					name: "AES-GCM",
					length: 128
				};
			case "2.16.840.1.101.3.4.1.26":
				return {
					name: "AES-GCM",
					length: 192
				};
			case "2.16.840.1.101.3.4.1.46":
				return {
					name: "AES-GCM",
					length: 256
				};
			case "2.16.840.1.101.3.4.1.4":
				return {
					name: "AES-CFB",
					length: 128
				};
			case "2.16.840.1.101.3.4.1.24":
				return {
					name: "AES-CFB",
					length: 192
				};
			case "2.16.840.1.101.3.4.1.44":
				return {
					name: "AES-CFB",
					length: 256
				};
			case "2.16.840.1.101.3.4.1.5":
				return {
					name: "AES-KW",
					length: 128
				};
			case "2.16.840.1.101.3.4.1.25":
				return {
					name: "AES-KW",
					length: 192
				};
			case "2.16.840.1.101.3.4.1.45":
				return {
					name: "AES-KW",
					length: 256
				};
			case "1.2.840.113549.2.7":
				return {
					name: "HMAC",
					hash: {
						name: "SHA-1"
					}
				};
			case "1.2.840.113549.2.9":
				return {
					name: "HMAC",
					hash: {
						name: "SHA-256"
					}
				};
			case "1.2.840.113549.2.10":
				return {
					name: "HMAC",
					hash: {
						name: "SHA-384"
					}
				};
			case "1.2.840.113549.2.11":
				return {
					name: "HMAC",
					hash: {
						name: "SHA-512"
					}
				};
			case "1.2.840.113549.1.9.16.3.5":
				return {
					name: "DH"
				};
			case "1.3.14.3.2.26":
				return {
					name: "SHA-1"
				};
			case "2.16.840.1.101.3.4.2.1":
				return {
					name: "SHA-256"
				};
			case "2.16.840.1.101.3.4.2.2":
				return {
					name: "SHA-384"
				};
			case "2.16.840.1.101.3.4.2.3":
				return {
					name: "SHA-512"
				};
			case "1.2.840.113549.1.5.12":
				return {
					name: "PBKDF2"
				};
			//region Special case - OIDs for ECC curves
			case "1.2.840.10045.3.1.7":
				return {
					name: "P-256"
				};
			case "1.3.132.0.34":
				return {
					name: "P-384"
				};
			case "1.3.132.0.35":
				return {
					name: "P-521"
				};
			//endregion
			default:
		}

		return {};
	}
	//**************************************************************************************
	/**
  * Getting hash algorithm by signature algorithm
  * @param {AlgorithmIdentifier} signatureAlgorithm Signature algorithm
  * @returns {string}
  */
	function getHashAlgorithm(signatureAlgorithm) {
		var result = "";

		switch (signatureAlgorithm.algorithmId) {
			case "1.2.840.10045.4.1": // ecdsa-with-SHA1
			case "1.2.840.113549.1.1.5":
				result = "SHA-1";
				break;
			case "1.2.840.10045.4.3.2": // ecdsa-with-SHA256
			case "1.2.840.113549.1.1.11":
				result = "SHA-256";
				break;
			case "1.2.840.10045.4.3.3": // ecdsa-with-SHA384
			case "1.2.840.113549.1.1.12":
				result = "SHA-384";
				break;
			case "1.2.840.10045.4.3.4": // ecdsa-with-SHA512
			case "1.2.840.113549.1.1.13":
				result = "SHA-512";
				break;
			case "1.2.840.113549.1.1.10":
				// RSA-PSS
				{
					try {
						var params = new RSASSAPSSParams({ schema: signatureAlgorithm.algorithmParams });
						if ("hashAlgorithm" in params) {
							var algorithm = getAlgorithmByOID(params.hashAlgorithm.algorithmId);
							if ("name" in algorithm === false) return "";

							result = algorithm.name;
						} else result = "SHA-1";
					} catch (ex) {}
				}
				break;
			default:
		}

		return result;
	}
	//**************************************************************************************
	/**
  * ANS X9.63 Key Derivation Function having a "Counter" as a parameter
  * @param {string} hashFunction Used hash function
  * @param {ArrayBuffer} Zbuffer ArrayBuffer containing ECDH shared secret to derive from
  * @param {number} Counter
  * @param {ArrayBuffer} SharedInfo Usually DER encoded "ECC_CMS_SharedInfo" structure
  */
	function kdfWithCounter(hashFunction, Zbuffer, Counter, SharedInfo) {
		//region Check of input parameters
		switch (hashFunction.toUpperCase()) {
			case "SHA-1":
			case "SHA-256":
			case "SHA-384":
			case "SHA-512":
				break;
			default:
				return Promise.reject("Unknown hash function: " + hashFunction);
		}

		if (Zbuffer instanceof ArrayBuffer === false) return Promise.reject("Please set \"Zbuffer\" as \"ArrayBuffer\"");

		if (Zbuffer.byteLength === 0) return Promise.reject("\"Zbuffer\" has zero length, error");

		if (SharedInfo instanceof ArrayBuffer === false) return Promise.reject("Please set \"SharedInfo\" as \"ArrayBuffer\"");

		if (Counter > 255) return Promise.reject("Please set \"Counter\" variable to value less or equal to 255");
		//endregion

		//region Initial variables
		var counterBuffer = new ArrayBuffer(4);
		var counterView = new Uint8Array(counterBuffer);
		counterView[0] = 0x00;
		counterView[1] = 0x00;
		counterView[2] = 0x00;
		counterView[3] = Counter;

		var combinedBuffer = new ArrayBuffer(0);
		//endregion

		//region Get a "crypto" extension
		var crypto = getCrypto();
		if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
		//endregion

		//region Create a combined ArrayBuffer for digesting
		combinedBuffer = utilConcatBuf(combinedBuffer, Zbuffer);
		combinedBuffer = utilConcatBuf(combinedBuffer, counterBuffer);
		combinedBuffer = utilConcatBuf(combinedBuffer, SharedInfo);
		//endregion

		//region Return digest of combined ArrayBuffer and information about current counter
		return crypto.digest({
			name: hashFunction
		}, combinedBuffer).then(function (result) {
			return {
				counter: Counter,
				result: result
			};
		});
		//endregion
	}
	//**************************************************************************************
	/**
  * ANS X9.63 Key Derivation Function
  * @param {string} hashFunction Used hash function
  * @param {ArrayBuffer} Zbuffer ArrayBuffer containing ECDH shared secret to derive from
  * @param {number} keydatalen Length (!!! in BITS !!!) of used kew derivation function
  * @param {ArrayBuffer} SharedInfo Usually DER encoded "ECC_CMS_SharedInfo" structure
  */
	function kdf(hashFunction, Zbuffer, keydatalen, SharedInfo) {
		//region Initial variables
		var hashLength = 0;
		var maxCounter = 1;

		var kdfArray = [];
		//endregion

		//region Check of input parameters
		switch (hashFunction.toUpperCase()) {
			case "SHA-1":
				hashLength = 160; // In bits
				break;
			case "SHA-256":
				hashLength = 256; // In bits
				break;
			case "SHA-384":
				hashLength = 384; // In bits
				break;
			case "SHA-512":
				hashLength = 512; // In bits
				break;
			default:
				return Promise.reject("Unknown hash function: " + hashFunction);
		}

		if (Zbuffer instanceof ArrayBuffer === false) return Promise.reject("Please set \"Zbuffer\" as \"ArrayBuffer\"");

		if (Zbuffer.byteLength === 0) return Promise.reject("\"Zbuffer\" has zero length, error");

		if (SharedInfo instanceof ArrayBuffer === false) return Promise.reject("Please set \"SharedInfo\" as \"ArrayBuffer\"");
		//endregion

		//region Calculated maximum value of "Counter" variable
		var quotient = keydatalen / hashLength;

		if (Math.floor(quotient) > 0) {
			maxCounter = Math.floor(quotient);

			if (quotient - maxCounter > 0) maxCounter++;
		}
		//endregion

		//region Create an array of "kdfWithCounter"
		for (var i = 1; i <= maxCounter; i++) {
			kdfArray.push(kdfWithCounter(hashFunction, Zbuffer, i, SharedInfo));
		} //endregion

		//region Return combined digest with specified length
		return Promise.all(kdfArray).then(function (incomingResult) {
			//region Initial variables
			var combinedBuffer = new ArrayBuffer(0);
			var currentCounter = 1;
			var found = true;
			//endregion

			//region Combine all buffer together
			while (found) {
				found = false;

				var _iteratorNormalCompletion13 = true;
				var _didIteratorError13 = false;
				var _iteratorError13 = undefined;

				try {
					for (var _iterator13 = incomingResult[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
						var result = _step13.value;

						if (result.counter === currentCounter) {
							combinedBuffer = utilConcatBuf(combinedBuffer, result.result);
							found = true;
							break;
						}
					}
				} catch (err) {
					_didIteratorError13 = true;
					_iteratorError13 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion13 && _iterator13.return) {
							_iterator13.return();
						}
					} finally {
						if (_didIteratorError13) {
							throw _iteratorError13;
						}
					}
				}

				currentCounter++;
			}
			//endregion

			//region Create output buffer with specified length
			keydatalen >>= 3; // Divide by 8 since "keydatalen" is in bits

			if (combinedBuffer.byteLength > keydatalen) {
				var newBuffer = new ArrayBuffer(keydatalen);
				var newView = new Uint8Array(newBuffer);
				var combinedView = new Uint8Array(combinedBuffer);

				for (var _i10 = 0; _i10 < keydatalen; _i10++) {
					newView[_i10] = combinedView[_i10];
				}return newBuffer;
			}

			return combinedBuffer; // Since the situation when "combinedBuffer.byteLength < keydatalen" here we have only "combinedBuffer.byteLength === keydatalen"
			//endregion
		});
		//endregion
	}

	//**************************************************************************************
	/**
  * Class from RFC5280
  */

	var AttributeTypeAndValue = function () {
		//**********************************************************************************
		/**
   * Constructor for AttributeTypeAndValue class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function AttributeTypeAndValue() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, AttributeTypeAndValue);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description type
    */
			this.type = getParametersValue(parameters, "type", AttributeTypeAndValue.defaultValues("type"));
			/**
    * @type {Object}
    * @description Value of the AttributeTypeAndValue class
    */
			this.value = getParametersValue(parameters, "value", AttributeTypeAndValue.defaultValues("value"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(AttributeTypeAndValue, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				/**
     * @type {{verified: boolean}|{verified: boolean, result: {type: Object, typeValue: Object}}}
     */
				var asn1 = compareSchema(schema, schema, AttributeTypeAndValue.schema({
					names: {
						type: "type",
						value: "typeValue"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for ATTR_TYPE_AND_VALUE");
				//endregion

				//region Get internal properties from parsed schema
				this.type = asn1.result.type.valueBlock.toString();
				this.value = asn1.result.typeValue;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [new ObjectIdentifier({ value: this.type }), this.value]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					type: this.type
				};

				if (Object.keys(this.value).length !== 0) _object.value = this.value.toJSON();else _object.value = this.value;

				return _object;
			}
			//**********************************************************************************
			/**
    * Compare two AttributeTypeAndValue values, or AttributeTypeAndValue with ArrayBuffer value
    * @param {(AttributeTypeAndValue|ArrayBuffer)} compareTo The value compare to current
    * @returns {boolean}
    */

		}, {
			key: "isEqual",
			value: function isEqual(compareTo) {
				if (compareTo instanceof AttributeTypeAndValue) {
					if (this.type !== compareTo.type) return false;

					if (this.value instanceof Utf8String && compareTo.value instanceof Utf8String || this.value instanceof BmpString && compareTo.value instanceof BmpString || this.value instanceof UniversalString && compareTo.value instanceof UniversalString || this.value instanceof NumericString && compareTo.value instanceof NumericString || this.value instanceof PrintableString && compareTo.value instanceof PrintableString || this.value instanceof TeletexString && compareTo.value instanceof TeletexString || this.value instanceof VideotexString && compareTo.value instanceof VideotexString || this.value instanceof IA5String && compareTo.value instanceof IA5String || this.value instanceof GraphicString && compareTo.value instanceof GraphicString || this.value instanceof VisibleString && compareTo.value instanceof VisibleString || this.value instanceof GeneralString && compareTo.value instanceof GeneralString || this.value instanceof CharacterString && compareTo.value instanceof CharacterString) {
						var value1 = stringPrep(this.value.valueBlock.value);
						var value2 = stringPrep(compareTo.value.valueBlock.value);

						if (value1.localeCompare(value2) !== 0) return false;
					} else // Comparing as two ArrayBuffers
						{
							if (isEqualBuffer(this.value.valueBeforeDecode, compareTo.value.valueBeforeDecode) === false) return false;
						}

					return true;
				}

				if (compareTo instanceof ArrayBuffer) return isEqualBuffer(this.value.valueBeforeDecode, compareTo);

				return false;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "type":
						return "";
					case "value":
						return {};
					default:
						throw new Error("Invalid member name for AttributeTypeAndValue class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//AttributeTypeAndValue ::= Sequence {
				//    type     AttributeType,
				//    value    AttributeValue }
				//
				//AttributeType ::= OBJECT IDENTIFIER
				//
				//AttributeValue ::= ANY -- DEFINED BY AttributeType

				/**
     * @type {Object}
     * @property {string} [blockName] Name for entire block
     * @property {string} [type] Name for "type" element
     * @property {string} [value] Name for "value" element
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.type || "" }), new Any({ name: names.value || "" })]
				});
			}
		}]);

		return AttributeTypeAndValue;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var RelativeDistinguishedNames = function () {
		//**********************************************************************************
		/**
   * Constructor for RelativeDistinguishedNames class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   * @property {Array.<AttributeTypeAndValue>} [typesAndValues] Array of "type and value" objects
   * @property {ArrayBuffer} [valueBeforeDecode] Value of the RDN before decoding from schema
   */
		function RelativeDistinguishedNames() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, RelativeDistinguishedNames);

			//region Internal properties of the object
			/**
    * @type {Array.<AttributeTypeAndValue>}
    * @description Array of "type and value" objects
    */
			this.typesAndValues = getParametersValue(parameters, "typesAndValues", RelativeDistinguishedNames.defaultValues("typesAndValues"));
			/**
    * @type {ArrayBuffer}
    * @description Value of the RDN before decoding from schema
    */
			this.valueBeforeDecode = getParametersValue(parameters, "valueBeforeDecode", RelativeDistinguishedNames.defaultValues("valueBeforeDecode"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(RelativeDistinguishedNames, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				/**
     * @type {{verified: boolean}|{verified: boolean, result: {RDN: Object, typesAndValues: Array.<Object>}}}
     */
				var asn1 = compareSchema(schema, schema, RelativeDistinguishedNames.schema({
					names: {
						blockName: "RDN",
						repeatedSet: "typesAndValues"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for RDN");
				//endregion

				//region Get internal properties from parsed schema
				if ("typesAndValues" in asn1.result) // Could be a case when there is no "types and values"
					this.typesAndValues = Array.from(asn1.result.typesAndValues, function (element) {
						return new AttributeTypeAndValue({ schema: element });
					});

				this.valueBeforeDecode = asn1.result.RDN.valueBeforeDecode;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Decode stored TBS value
				if (this.valueBeforeDecode.byteLength === 0) // No stored encoded array, create "from scratch"
					{
						return new Sequence({
							value: [new Set({
								value: Array.from(this.typesAndValues, function (element) {
									return element.toSchema();
								})
							})]
						});
					}

				var asn1 = fromBER(this.valueBeforeDecode);
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return asn1.result;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					typesAndValues: Array.from(this.typesAndValues, function (element) {
						return element.toJSON();
					})
				};
			}
			//**********************************************************************************
			/**
    * Compare two RDN values, or RDN with ArrayBuffer value
    * @param {(RelativeDistinguishedNames|ArrayBuffer)} compareTo The value compare to current
    * @returns {boolean}
    */

		}, {
			key: "isEqual",
			value: function isEqual(compareTo) {
				if (compareTo instanceof RelativeDistinguishedNames) {
					if (this.typesAndValues.length !== compareTo.typesAndValues.length) return false;

					var _iteratorNormalCompletion14 = true;
					var _didIteratorError14 = false;
					var _iteratorError14 = undefined;

					try {
						for (var _iterator14 = this.typesAndValues.entries()[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
							var _step14$value = _slicedToArray(_step14.value, 2);

							var index = _step14$value[0];
							var typeAndValue = _step14$value[1];

							if (typeAndValue.isEqual(compareTo.typesAndValues[index]) === false) return false;
						}
					} catch (err) {
						_didIteratorError14 = true;
						_iteratorError14 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion14 && _iterator14.return) {
								_iterator14.return();
							}
						} finally {
							if (_didIteratorError14) {
								throw _iteratorError14;
							}
						}
					}

					return true;
				}

				if (compareTo instanceof ArrayBuffer) return isEqualBuffer(this.valueBeforeDecode, compareTo);

				return false;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "typesAndValues":
						return [];
					case "valueBeforeDecode":
						return new ArrayBuffer(0);
					default:
						throw new Error("Invalid member name for RelativeDistinguishedNames class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "typesAndValues":
						return memberValue.length === 0;
					case "valueBeforeDecode":
						return memberValue.byteLength === 0;
					default:
						throw new Error("Invalid member name for RelativeDistinguishedNames class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//RDNSequence ::= Sequence OF RelativeDistinguishedName
				//
				//RelativeDistinguishedName ::=
				//SET SIZE (1..MAX) OF AttributeTypeAndValue

				/**
     * @type {Object}
     * @property {string} [blockName] Name for entire block
     * @property {string} [repeatedSequence] Name for "repeatedSequence" block
     * @property {string} [repeatedSet] Name for "repeatedSet" block
     * @property {string} [typeAndValue] Name for "typeAndValue" block
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.repeatedSequence || "",
						value: new Set({
							value: [new Repeated({
								name: names.repeatedSet || "",
								value: AttributeTypeAndValue.schema(names.typeAndValue || {})
							})]
						})
					})]
				});
			}
		}]);

		return RelativeDistinguishedNames;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var Time = function () {
		//**********************************************************************************
		/**
   * Constructor for Time class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   * @property {number} [type] 0 - UTCTime; 1 - GeneralizedTime; 2 - empty value
   * @property {Date} [value] Value of the TIME class
   */
		function Time() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Time);

			//region Internal properties of the object
			/**
    * @type {number}
    * @description 0 - UTCTime; 1 - GeneralizedTime; 2 - empty value
    */
			this.type = getParametersValue(parameters, "type", Time.defaultValues("type"));
			/**
    * @type {Date}
    * @description Value of the TIME class
    */
			this.value = getParametersValue(parameters, "value", Time.defaultValues("value"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(Time, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, Time.schema({
					names: {
						utcTimeName: "utcTimeName",
						generalTimeName: "generalTimeName"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for TIME");
				//endregion

				//region Get internal properties from parsed schema
				if ("utcTimeName" in asn1.result) {
					this.type = 0;
					this.value = asn1.result.utcTimeName.toDate();
				}
				if ("generalTimeName" in asn1.result) {
					this.type = 1;
					this.value = asn1.result.generalTimeName.toDate();
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				var result = {};

				if (this.type === 0) result = new UTCTime({ valueDate: this.value });
				if (this.type === 1) result = new GeneralizedTime({ valueDate: this.value });

				return result;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					type: this.type,
					value: this.value
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "type":
						return 0;
					case "value":
						return new Date(0, 0, 0);
					default:
						throw new Error("Invalid member name for Time class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @param {boolean} optional Flag that current schema should be optional
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
				var optional = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [utcTimeName] Name for "utcTimeName" choice
     * @property {string} [generalTimeName] Name for "generalTimeName" choice
     */
				var names = getParametersValue(parameters, "names", {});

				return new Choice({
					optional: optional,
					value: [new UTCTime({ name: names.utcTimeName || "" }), new GeneralizedTime({ name: names.generalTimeName || "" })]
				});
			}
		}]);

		return Time;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var SubjectDirectoryAttributes = function () {
		//**********************************************************************************
		/**
   * Constructor for SubjectDirectoryAttributes class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function SubjectDirectoryAttributes() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, SubjectDirectoryAttributes);

			//region Internal properties of the object
			/**
    * @type {Array.<Attribute>}
    * @description attributes
    */
			this.attributes = getParametersValue(parameters, "attributes", SubjectDirectoryAttributes.defaultValues("attributes"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(SubjectDirectoryAttributes, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, SubjectDirectoryAttributes.schema({
					names: {
						attributes: "attributes"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for SubjectDirectoryAttributes");
				//endregion

				//region Get internal properties from parsed schema
				this.attributes = Array.from(asn1.result.attributes, function (element) {
					return new Attribute({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: Array.from(this.attributes, function (element) {
						return element.toSchema();
					})
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					attributes: Array.from(this.attributes, function (element) {
						return element.toJSON();
					})
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "attributes":
						return [];
					default:
						throw new Error("Invalid member name for SubjectDirectoryAttributes class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// SubjectDirectoryAttributes OID ::= 2.5.29.9
				//
				//SubjectDirectoryAttributes ::= SEQUENCE SIZE (1..MAX) OF Attribute

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [utcTimeName] Name for "utcTimeName" choice
     * @property {string} [generalTimeName] Name for "generalTimeName" choice
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.attributes || "",
						value: Attribute.schema()
					})]
				});
			}
		}]);

		return SubjectDirectoryAttributes;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var PrivateKeyUsagePeriod = function () {
		//**********************************************************************************
		/**
   * Constructor for PrivateKeyUsagePeriod class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function PrivateKeyUsagePeriod() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, PrivateKeyUsagePeriod);

			//region Internal properties of the object
			if ("notBefore" in parameters)
				/**
     * @type {Date}
     * @description notBefore
     */
				this.notBefore = getParametersValue(parameters, "notBefore", PrivateKeyUsagePeriod.defaultValues("notBefore"));

			if ("notAfter" in parameters)
				/**
     * @type {Date}
     * @description notAfter
     */
				this.notAfter = getParametersValue(parameters, "notAfter", PrivateKeyUsagePeriod.defaultValues("notAfter"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(PrivateKeyUsagePeriod, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, PrivateKeyUsagePeriod.schema({
					names: {
						notBefore: "notBefore",
						notAfter: "notAfter"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PrivateKeyUsagePeriod");
				//endregion

				//region Get internal properties from parsed schema
				if ("notBefore" in asn1.result) {
					var localNotBefore = new GeneralizedTime();
					localNotBefore.fromBuffer(asn1.result.notBefore.valueBlock.valueHex);
					this.notBefore = localNotBefore.toDate();
				}

				if ("notAfter" in asn1.result) {
					var localNotAfter = new GeneralizedTime({ valueHex: asn1.result.notAfter.valueBlock.valueHex });
					localNotAfter.fromBuffer(asn1.result.notAfter.valueBlock.valueHex);
					this.notAfter = localNotAfter.toDate();
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				if ("notBefore" in this) {
					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						valueHex: new GeneralizedTime({ valueDate: this.notBefore }).valueBlock.valueHex
					}));
				}

				if ("notAfter" in this) {
					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						valueHex: new GeneralizedTime({ valueDate: this.notAfter }).valueBlock.valueHex
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				if ("notBefore" in this) object.notBefore = this.notBefore;

				if ("notAfter" in this) object.notAfter = this.notAfter;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "notBefore":
						return new Date();
					case "notAfter":
						return new Date();
					default:
						throw new Error("Invalid member name for PrivateKeyUsagePeriod class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// PrivateKeyUsagePeriod OID ::= 2.5.29.16
				//
				//PrivateKeyUsagePeriod ::= SEQUENCE {
				//    notBefore       [0]     GeneralizedTime OPTIONAL,
				//    notAfter        [1]     GeneralizedTime OPTIONAL }
				//-- either notBefore or notAfter MUST be present

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [notBefore]
     * @property {string} [notAfter]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Primitive({
						name: names.notBefore || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						}
					}), new Primitive({
						name: names.notAfter || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						}
					})]
				});
			}
		}]);

		return PrivateKeyUsagePeriod;
	}();
	//**************************************************************************************

	//**************************************************************************************
	//region Additional asn1js schema elements existing inside GENERAL_NAME schema
	//**************************************************************************************
	/**
  * Schema for "builtInStandardAttributes" of "ORAddress"
  * @param {Object} parameters
  * @property {Object} [names]
  * @param {boolean} optional
  * @returns {Sequence}
  */


	function builtInStandardAttributes() {
		var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
		var optional = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

		//builtInStandardAttributes ::= Sequence {
		//    country-name                  CountryName OPTIONAL,
		//    administration-domain-name    AdministrationDomainName OPTIONAL,
		//    network-address           [0] IMPLICIT NetworkAddress OPTIONAL,
		//    terminal-identifier       [1] IMPLICIT TerminalIdentifier OPTIONAL,
		//    private-domain-name       [2] PrivateDomainName OPTIONAL,
		//    organization-name         [3] IMPLICIT OrganizationName OPTIONAL,
		//    numeric-user-identifier   [4] IMPLICIT NumericUserIdentifier OPTIONAL,
		//    personal-name             [5] IMPLICIT PersonalName OPTIONAL,
		//    organizational-unit-names [6] IMPLICIT OrganizationalUnitNames OPTIONAL }

		/**
   * @type {Object}
   * @property {string} [country_name]
   * @property {string} [administration_domain_name]
   * @property {string} [network_address]
   * @property {string} [terminal_identifier]
   * @property {string} [private_domain_name]
   * @property {string} [organization_name]
   * @property {string} [numeric_user_identifier]
   * @property {string} [personal_name]
   * @property {string} [organizational_unit_names]
   */
		var names = getParametersValue(parameters, "names", {});

		return new Sequence({
			optional: optional,
			value: [new Constructed({
				optional: true,
				idBlock: {
					tagClass: 2, // APPLICATION-SPECIFIC
					tagNumber: 1 // [1]
				},
				name: names.country_name || "",
				value: [new Choice({
					value: [new NumericString(), new PrintableString()]
				})]
			}), new Constructed({
				optional: true,
				idBlock: {
					tagClass: 2, // APPLICATION-SPECIFIC
					tagNumber: 2 // [2]
				},
				name: names.administration_domain_name || "",
				value: [new Choice({
					value: [new NumericString(), new PrintableString()]
				})]
			}), new Primitive({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				name: names.network_address || "",
				isHexOnly: true
			}), new Primitive({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				name: names.terminal_identifier || "",
				isHexOnly: true
			}), new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 2 // [2]
				},
				name: names.private_domain_name || "",
				value: [new Choice({
					value: [new NumericString(), new PrintableString()]
				})]
			}), new Primitive({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 3 // [3]
				},
				name: names.organization_name || "",
				isHexOnly: true
			}), new Primitive({
				optional: true,
				name: names.numeric_user_identifier || "",
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 4 // [4]
				},
				isHexOnly: true
			}), new Constructed({
				optional: true,
				name: names.personal_name || "",
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 5 // [5]
				},
				value: [new Primitive({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					isHexOnly: true
				}), new Primitive({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 1 // [1]
					},
					isHexOnly: true
				}), new Primitive({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 2 // [2]
					},
					isHexOnly: true
				}), new Primitive({
					optional: true,
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 3 // [3]
					},
					isHexOnly: true
				})]
			}), new Constructed({
				optional: true,
				name: names.organizational_unit_names || "",
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 6 // [6]
				},
				value: [new Repeated({
					value: new PrintableString()
				})]
			})]
		});
	}
	//**************************************************************************************
	/**
  * Schema for "builtInDomainDefinedAttributes" of "ORAddress"
  * @param {boolean} optional
  * @returns {Sequence}
  */
	function builtInDomainDefinedAttributes() {
		var optional = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

		return new Sequence({
			optional: optional,
			value: [new PrintableString(), new PrintableString()]
		});
	}
	//**************************************************************************************
	/**
  * Schema for "builtInDomainDefinedAttributes" of "ORAddress"
  * @param {boolean} optional
  * @returns {Set}
  */
	function extensionAttributes() {
		var optional = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

		return new Set({
			optional: optional,
			value: [new Primitive({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				isHexOnly: true
			}), new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				},
				value: [new Any()]
			})]
		});
	}
	//**************************************************************************************
	//endregion
	//**************************************************************************************
	/**
  * Class from RFC5280
  */

	var GeneralName = function () {
		//**********************************************************************************
		/**
   * Constructor for GeneralName class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   * @property {number} [type] value type - from a tagged value (0 for "otherName", 1 for "rfc822Name" etc.)
   * @property {Object} [value] asn1js object having GENERAL_NAME value (type depends on "type" value)
   */
		function GeneralName() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, GeneralName);

			//region Internal properties of the object
			/**
    * @type {number}
    * @description value type - from a tagged value (0 for "otherName", 1 for "rfc822Name" etc.)
    */
			this.type = getParametersValue(parameters, "type", GeneralName.defaultValues("type"));
			/**
    * @type {Object}
    * @description asn1js object having GENERAL_NAME value (type depends on "type" value)
    */
			this.value = getParametersValue(parameters, "value", GeneralName.defaultValues("value"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(GeneralName, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, GeneralName.schema({
					names: {
						blockName: "blockName",
						otherName: "otherName",
						rfc822Name: "rfc822Name",
						dNSName: "dNSName",
						x400Address: "x400Address",
						directoryName: {
							names: {
								blockName: "directoryName"
							}
						},
						ediPartyName: "ediPartyName",
						uniformResourceIdentifier: "uniformResourceIdentifier",
						iPAddress: "iPAddress",
						registeredID: "registeredID"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for GENERAL_NAME");
				//endregion

				//region Get internal properties from parsed schema
				this.type = asn1.result.blockName.idBlock.tagNumber;

				switch (this.type) {
					case 0:
						// otherName
						this.value = asn1.result.blockName;
						break;
					case 1: // rfc822Name + dNSName + uniformResourceIdentifier
					case 2:
					case 6:
						{
							var value = asn1.result.blockName;

							value.idBlock.tagClass = 1; // UNIVERSAL
							value.idBlock.tagNumber = 22; // IA5STRING

							var valueBER = value.toBER(false);

							this.value = fromBER(valueBER).result.valueBlock.value;
						}
						break;
					case 3:
						// x400Address
						this.value = asn1.result.blockName;
						break;
					case 4:
						// directoryName
						this.value = new RelativeDistinguishedNames({ schema: asn1.result.directoryName });
						break;
					case 5:
						// ediPartyName
						this.value = asn1.result.ediPartyName;
						break;
					case 7:
						// iPAddress
						this.value = new OctetString({ valueHex: asn1.result.blockName.valueBlock.valueHex });
						break;
					case 8:
						// registeredID
						{
							var _value2 = asn1.result.blockName;

							_value2.idBlock.tagClass = 1; // UNIVERSAL
							_value2.idBlock.tagNumber = 6; // ObjectIdentifier

							var _valueBER = _value2.toBER(false);

							this.value = fromBER(_valueBER).result.valueBlock.toString(); // Getting a string representation of the ObjectIdentifier
						}
						break;
					default:
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				switch (this.type) {
					case 0:
					case 3:
					case 5:
						return new Constructed({
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: this.type
							},
							value: [this.value]
						});
					case 1:
					case 2:
					case 6:
						{
							var value = new IA5String({ value: this.value });

							value.idBlock.tagClass = 3;
							value.idBlock.tagNumber = this.type;

							return value;
						}
					case 4:
						return new Constructed({
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 4
							},
							value: [this.value.toSchema()]
						});
					case 7:
						{
							var _value3 = this.value;

							_value3.idBlock.tagClass = 3;
							_value3.idBlock.tagNumber = this.type;

							return _value3;
						}
					case 8:
						{
							var _value4 = new ObjectIdentifier({ value: this.value });

							_value4.idBlock.tagClass = 3;
							_value4.idBlock.tagNumber = this.type;

							return _value4;
						}
					default:
						return GeneralName.schema();
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					type: this.type
				};

				if (typeof this.value === "string") _object.value = this.value;else _object.value = this.value.toJSON();

				return _object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "type":
						return 9;
					case "value":
						return {};
					default:
						throw new Error("Invalid member name for GeneralName class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "type":
						return memberValue === GeneralName.defaultValues(memberName);
					case "value":
						return Object.keys(memberValue).length === 0;
					default:
						throw new Error("Invalid member name for GeneralName class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//GeneralName ::= Choice {
				//    otherName                       [0]     OtherName,
				//    rfc822Name                      [1]     IA5String,
				//    dNSName                         [2]     IA5String,
				//    x400Address                     [3]     ORAddress,
				//    directoryName                   [4]     value,
				//    ediPartyName                    [5]     EDIPartyName,
				//    uniformResourceIdentifier       [6]     IA5String,
				//    iPAddress                       [7]     OCTET STRING,
				//    registeredID                    [8]     OBJECT IDENTIFIER }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {Object} [directoryName]
     * @property {Object} [builtInStandardAttributes]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Choice({
					value: [new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						name: names.blockName || "",
						value: [new ObjectIdentifier(), new Constructed({
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							value: [new Any()]
						})]
					}), new Primitive({
						name: names.blockName || "",
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						}
					}), new Primitive({
						name: names.blockName || "",
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						}
					}), new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 3 // [3]
						},
						name: names.blockName || "",
						value: [builtInStandardAttributes(names.builtInStandardAttributes || {}, false), builtInDomainDefinedAttributes(true), extensionAttributes(true)]
					}), new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 4 // [4]
						},
						name: names.blockName || "",
						value: [RelativeDistinguishedNames.schema(names.directoryName || {})]
					}), new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 5 // [5]
						},
						name: names.blockName || "",
						value: [new Constructed({
							optional: true,
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							value: [new Choice({
								value: [new TeletexString(), new PrintableString(), new UniversalString(), new Utf8String(), new BmpString()]
							})]
						}), new Constructed({
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 1 // [1]
							},
							value: [new Choice({
								value: [new TeletexString(), new PrintableString(), new UniversalString(), new Utf8String(), new BmpString()]
							})]
						})]
					}), new Primitive({
						name: names.blockName || "",
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 6 // [6]
						}
					}), new Primitive({
						name: names.blockName || "",
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 7 // [7]
						}
					}), new Primitive({
						name: names.blockName || "",
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 8 // [8]
						}
					})]
				});
			}
		}]);

		return GeneralName;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var AltName = function () {
		//**********************************************************************************
		/**
   * Constructor for AltName class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function AltName() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, AltName);

			//region Internal properties of the object
			/**
    * @type {Array.<GeneralName>}
    * @description type
    */
			this.altNames = getParametersValue(parameters, "altNames", AltName.defaultValues("altNames"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(AltName, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, AltName.schema({
					names: {
						altNames: "altNames"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for AltName");
				//endregion

				//region Get internal properties from parsed schema
				if ("altNames" in asn1.result) this.altNames = Array.from(asn1.result.altNames, function (element) {
					return new GeneralName({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: Array.from(this.altNames, function (element) {
						return element.toSchema();
					})
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					altNames: Array.from(this.altNames, function (element) {
						return element.toJSON();
					})
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "altNames":
						return [];
					default:
						throw new Error("Invalid member name for AltName class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// SubjectAltName OID ::= 2.5.29.17
				// IssuerAltName OID ::= 2.5.29.18
				//
				// AltName ::= GeneralNames

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [altNames]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.altNames || "",
						value: GeneralName.schema()
					})]
				});
			}
		}]);

		return AltName;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var BasicConstraints = function () {
		//**********************************************************************************
		/**
   * Constructor for BasicConstraints class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   * @property {Object} [cA]
   * @property {Object} [pathLenConstraint]
   */
		function BasicConstraints() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, BasicConstraints);

			//region Internal properties of the object
			/**
    * @type {boolean}
    * @description cA
    */
			this.cA = getParametersValue(parameters, "cA", false);

			if ("pathLenConstraint" in parameters)
				/**
     * @type {number|Integer}
     * @description pathLenConstraint
     */
				this.pathLenConstraint = getParametersValue(parameters, "pathLenConstraint", 0);
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(BasicConstraints, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, BasicConstraints.schema({
					names: {
						cA: "cA",
						pathLenConstraint: "pathLenConstraint"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for BasicConstraints");
				//endregion

				//region Get internal properties from parsed schema
				if ("cA" in asn1.result) this.cA = asn1.result.cA.valueBlock.value;

				if ("pathLenConstraint" in asn1.result) {
					if (asn1.result.pathLenConstraint.valueBlock.isHexOnly) this.pathLenConstraint = asn1.result.pathLenConstraint;else this.pathLenConstraint = asn1.result.pathLenConstraint.valueBlock.valueDec;
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				if (this.cA !== BasicConstraints.defaultValues("cA")) outputArray.push(new Boolean({ value: this.cA }));

				if ("pathLenConstraint" in this) {
					if (this.pathLenConstraint instanceof Integer) outputArray.push(this.pathLenConstraint);else outputArray.push(new Integer({ value: this.pathLenConstraint }));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				if (this.cA !== BasicConstraints.defaultValues("cA")) object.cA = this.cA;

				if ("pathLenConstraint" in this) {
					if (this.pathLenConstraint instanceof Integer) object.pathLenConstraint = this.pathLenConstraint.toJSON();else object.pathLenConstraint = this.pathLenConstraint;
				}

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "cA":
						return false;
					default:
						throw new Error("Invalid member name for BasicConstraints class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// BasicConstraints OID ::= 2.5.29.19
				//
				//BasicConstraints ::= SEQUENCE {
				//    cA                      BOOLEAN DEFAULT FALSE,
				//    pathLenConstraint       INTEGER (0..MAX) OPTIONAL }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [cA]
     * @property {string} [pathLenConstraint]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Boolean({
						optional: true,
						name: names.cA || ""
					}), new Integer({
						optional: true,
						name: names.pathLenConstraint || ""
					})]
				});
			}
		}]);

		return BasicConstraints;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var IssuingDistributionPoint = function () {
		//**********************************************************************************
		/**
   * Constructor for IssuingDistributionPoint class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function IssuingDistributionPoint() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, IssuingDistributionPoint);

			//region Internal properties of the object
			if ("distributionPoint" in parameters)
				/**
     * @type {Array.<GeneralName>|RelativeDistinguishedNames}
     * @description distributionPoint
     */
				this.distributionPoint = getParametersValue(parameters, "distributionPoint", IssuingDistributionPoint.defaultValues("distributionPoint"));

			/**
    * @type {boolean}
    * @description onlyContainsUserCerts
    */
			this.onlyContainsUserCerts = getParametersValue(parameters, "onlyContainsUserCerts", IssuingDistributionPoint.defaultValues("onlyContainsUserCerts"));

			/**
    * @type {boolean}
    * @description onlyContainsCACerts
    */
			this.onlyContainsCACerts = getParametersValue(parameters, "onlyContainsCACerts", IssuingDistributionPoint.defaultValues("onlyContainsCACerts"));

			if ("onlySomeReasons" in parameters)
				/**
     * @type {number}
     * @description onlySomeReasons
     */
				this.onlySomeReasons = getParametersValue(parameters, "onlySomeReasons", IssuingDistributionPoint.defaultValues("onlySomeReasons"));

			/**
    * @type {boolean}
    * @description indirectCRL
    */
			this.indirectCRL = getParametersValue(parameters, "indirectCRL", IssuingDistributionPoint.defaultValues("indirectCRL"));

			/**
    * @type {boolean}
    * @description onlyContainsAttributeCerts
    */
			this.onlyContainsAttributeCerts = getParametersValue(parameters, "onlyContainsAttributeCerts", IssuingDistributionPoint.defaultValues("onlyContainsAttributeCerts"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(IssuingDistributionPoint, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, IssuingDistributionPoint.schema({
					names: {
						distributionPoint: "distributionPoint",
						distributionPointNames: "distributionPointNames",
						onlyContainsUserCerts: "onlyContainsUserCerts",
						onlyContainsCACerts: "onlyContainsCACerts",
						onlySomeReasons: "onlySomeReasons",
						indirectCRL: "indirectCRL",
						onlyContainsAttributeCerts: "onlyContainsAttributeCerts"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for IssuingDistributionPoint");
				//endregion

				//region Get internal properties from parsed schema
				if ("distributionPoint" in asn1.result) {
					switch (true) {
						case asn1.result.distributionPoint.idBlock.tagNumber === 0:
							// GENERAL_NAMES variant
							this.distributionPoint = Array.from(asn1.result.distributionPointNames, function (element) {
								return new GeneralName({ schema: element });
							});
							break;
						case asn1.result.distributionPoint.idBlock.tagNumber === 1:
							// RDN variant
							{
								asn1.result.distributionPoint.idBlock.tagClass = 1; // UNIVERSAL
								asn1.result.distributionPoint.idBlock.tagNumber = 16; // SEQUENCE

								this.distributionPoint = new RelativeDistinguishedNames({ schema: asn1.result.distributionPoint });
							}
							break;
						default:
							throw new Error("Unknown tagNumber for distributionPoint: {$asn1.result.distributionPoint.idBlock.tagNumber}");
					}
				}

				if ("onlyContainsUserCerts" in asn1.result) {
					var view = new Uint8Array(asn1.result.onlyContainsUserCerts.valueBlock.valueHex);
					this.onlyContainsUserCerts = view[0] !== 0x00;
				}

				if ("onlyContainsCACerts" in asn1.result) {
					var _view2 = new Uint8Array(asn1.result.onlyContainsCACerts.valueBlock.valueHex);
					this.onlyContainsCACerts = _view2[0] !== 0x00;
				}

				if ("onlySomeReasons" in asn1.result) {
					var _view3 = new Uint8Array(asn1.result.onlySomeReasons.valueBlock.valueHex);
					this.onlySomeReasons = _view3[0];
				}

				if ("indirectCRL" in asn1.result) {
					var _view4 = new Uint8Array(asn1.result.indirectCRL.valueBlock.valueHex);
					this.indirectCRL = _view4[0] !== 0x00;
				}

				if ("onlyContainsAttributeCerts" in asn1.result) {
					var _view5 = new Uint8Array(asn1.result.onlyContainsAttributeCerts.valueBlock.valueHex);
					this.onlyContainsAttributeCerts = _view5[0] !== 0x00;
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				if ("distributionPoint" in this) {
					var value = void 0;

					if (this.distributionPoint instanceof Array) {
						value = new Constructed({
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							value: Array.from(this.distributionPoint, function (element) {
								return element.toSchema();
							})
						});
					} else {
						value = this.distributionPoint.toSchema();

						value.idBlock.tagClass = 3; // CONTEXT - SPECIFIC
						value.idBlock.tagNumber = 1; // [1]
					}

					outputArray.push(value);
				}

				if (this.onlyContainsUserCerts !== IssuingDistributionPoint.defaultValues("onlyContainsUserCerts")) {
					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						valueHex: new Uint8Array([0xFF]).buffer
					}));
				}

				if (this.onlyContainsCACerts !== IssuingDistributionPoint.defaultValues("onlyContainsCACerts")) {
					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						},
						valueHex: new Uint8Array([0xFF]).buffer
					}));
				}

				if ("onlySomeReasons" in this) {
					var buffer = new ArrayBuffer(1);
					var view = new Uint8Array(buffer);

					view[0] = this.onlySomeReasons;

					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 3 // [3]
						},
						valueHex: buffer
					}));
				}

				if (this.indirectCRL !== IssuingDistributionPoint.defaultValues("indirectCRL")) {
					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 4 // [4]
						},
						valueHex: new Uint8Array([0xFF]).buffer
					}));
				}

				if (this.onlyContainsAttributeCerts !== IssuingDistributionPoint.defaultValues("onlyContainsAttributeCerts")) {
					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 5 // [5]
						},
						valueHex: new Uint8Array([0xFF]).buffer
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				if ("distributionPoint" in this) {
					if (this.distributionPoint instanceof Array) object.distributionPoint = Array.from(this.distributionPoint, function (element) {
						return element.toJSON();
					});else object.distributionPoint = this.distributionPoint.toJSON();
				}

				if (this.onlyContainsUserCerts !== IssuingDistributionPoint.defaultValues("onlyContainsUserCerts")) object.onlyContainsUserCerts = this.onlyContainsUserCerts;

				if (this.onlyContainsCACerts !== IssuingDistributionPoint.defaultValues("onlyContainsCACerts")) object.onlyContainsCACerts = this.onlyContainsCACerts;

				if ("onlySomeReasons" in this) object.onlySomeReasons = this.onlySomeReasons;

				if (this.indirectCRL !== IssuingDistributionPoint.defaultValues("indirectCRL")) object.indirectCRL = this.indirectCRL;

				if (this.onlyContainsAttributeCerts !== IssuingDistributionPoint.defaultValues("onlyContainsAttributeCerts")) object.onlyContainsAttributeCerts = this.onlyContainsAttributeCerts;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "distributionPoint":
						return [];
					case "onlyContainsUserCerts":
						return false;
					case "onlyContainsCACerts":
						return false;
					case "onlySomeReasons":
						return 0;
					case "indirectCRL":
						return false;
					case "onlyContainsAttributeCerts":
						return false;
					default:
						throw new Error("Invalid member name for IssuingDistributionPoint class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// IssuingDistributionPoint OID ::= 2.5.29.28
				//
				//IssuingDistributionPoint ::= SEQUENCE {
				//    distributionPoint          [0] DistributionPointName OPTIONAL,
				//    onlyContainsUserCerts      [1] BOOLEAN DEFAULT FALSE,
				//    onlyContainsCACerts        [2] BOOLEAN DEFAULT FALSE,
				//    onlySomeReasons            [3] ReasonFlags OPTIONAL,
				//    indirectCRL                [4] BOOLEAN DEFAULT FALSE,
				//    onlyContainsAttributeCerts [5] BOOLEAN DEFAULT FALSE }
				//
				//ReasonFlags ::= BIT STRING {
				//    unused                  (0),
				//    keyCompromise           (1),
				//    cACompromise            (2),
				//    affiliationChanged      (3),
				//    superseded              (4),
				//    cessationOfOperation    (5),
				//    certificateHold         (6),
				//    privilegeWithdrawn      (7),
				//    aACompromise            (8) }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [distributionPoint]
     * @property {string} [distributionPointNames]
     * @property {string} [onlyContainsUserCerts]
     * @property {string} [onlyContainsCACerts]
     * @property {string} [onlySomeReasons]
     * @property {string} [indirectCRL]
     * @property {string} [onlyContainsAttributeCerts]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new Choice({
							value: [new Constructed({
								name: names.distributionPoint || "",
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 0 // [0]
								},
								value: [new Repeated({
									name: names.distributionPointNames || "",
									value: GeneralName.schema()
								})]
							}), new Constructed({
								name: names.distributionPoint || "",
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 1 // [1]
								},
								value: RelativeDistinguishedNames.schema().valueBlock.value
							})]
						})]
					}), new Primitive({
						name: names.onlyContainsUserCerts || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						}
					}), // IMPLICIT boolean value
					new Primitive({
						name: names.onlyContainsCACerts || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						}
					}), // IMPLICIT boolean value
					new Primitive({
						name: names.onlySomeReasons || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 3 // [3]
						}
					}), // IMPLICIT bitstring value
					new Primitive({
						name: names.indirectCRL || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 4 // [4]
						}
					}), // IMPLICIT boolean value
					new Primitive({
						name: names.onlyContainsAttributeCerts || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 5 // [5]
						}
					}) // IMPLICIT boolean value
					]
				});
			}
		}]);

		return IssuingDistributionPoint;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var GeneralNames = function () {
		//**********************************************************************************
		/**
   * Constructor for GeneralNames class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function GeneralNames() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, GeneralNames);

			//region Internal properties of the object
			/**
    * @type {Array.<GeneralName>}
    * @description Array of "general names"
    */
			this.names = getParametersValue(parameters, "names", GeneralNames.defaultValues("names"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(GeneralNames, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, GeneralNames.schema());

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for GeneralNames");
				//endregion

				//region Get internal properties from parsed schema
				this.names = Array.from(asn1.result.names, function (element) {
					return new GeneralName({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: Array.from(this.names, function (element) {
						return element.toSchema();
					})
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					names: Array.from(this.names, function (element) {
						return element.toJSON();
					})
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "names":
						return [];
					default:
						throw new Error("Invalid member name for GeneralNames class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				/**
     * @type {Object}
     * @property {string} utcTimeName Name for "utcTimeName" choice
     * @property {string} generalTimeName Name for "generalTimeName" choice
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					value: [new Repeated({
						name: names.blockName || "names",
						value: GeneralName.schema()
					})]
				});
			}
		}]);

		return GeneralNames;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var GeneralSubtree = function () {
		//**********************************************************************************
		/**
   * Constructor for GeneralSubtree class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function GeneralSubtree() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, GeneralSubtree);

			//region Internal properties of the object
			/**
    * @type {GeneralName}
    * @description base
    */
			this.base = getParametersValue(parameters, "base", GeneralSubtree.defaultValues("base"));

			/**
    * @type {number|Integer}
    * @description base
    */
			this.minimum = getParametersValue(parameters, "minimum", GeneralSubtree.defaultValues("minimum"));

			if ("maximum" in parameters)
				/**
     * @type {number|Integer}
     * @description minimum
     */
				this.maximum = getParametersValue(parameters, "maximum", GeneralSubtree.defaultValues("maximum"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(GeneralSubtree, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, GeneralSubtree.schema({
					names: {
						base: {
							names: {
								blockName: "base"
							}
						},
						minimum: "minimum",
						maximum: "maximum"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for ");
				//endregion

				//region Get internal properties from parsed schema
				this.base = new GeneralName({ schema: asn1.result.base });

				if ("minimum" in asn1.result) {
					if (asn1.result.minimum.valueBlock.isHexOnly) this.minimum = asn1.result.minimum;else this.minimum = asn1.result.minimum.valueBlock.valueDec;
				}

				if ("maximum" in asn1.result) {
					if (asn1.result.maximum.valueBlock.isHexOnly) this.maximum = asn1.result.maximum;else this.maximum = asn1.result.maximum.valueBlock.valueDec;
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				outputArray.push(this.base.toSchema());

				if (this.minimum !== 0) {
					var valueMinimum = 0;

					if (this.minimum instanceof Integer) valueMinimum = this.minimum;else valueMinimum = new Integer({ value: this.minimum });

					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [valueMinimum]
					}));
				}

				if ("maximum" in this) {
					var valueMaximum = 0;

					if (this.maximum instanceof Integer) valueMaximum = this.maximum;else valueMaximum = new Integer({ value: this.maximum });

					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [valueMaximum]
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {
					base: this.base.toJSON()
				};

				if (this.minimum !== 0) {
					if (typeof this.minimum === "number") object.minimum = this.minimum;else object.minimum = this.minimum.toJSON();
				}

				if ("maximum" in this) {
					if (typeof this.maximum === "number") object.maximum = this.maximum;else object.maximum = this.maximum.toJSON();
				}

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "base":
						return new GeneralName();
					case "minimum":
						return 0;
					case "maximum":
						return 0;
					default:
						throw new Error("Invalid member name for GeneralSubtree class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//GeneralSubtree ::= SEQUENCE {
				//    base                    GeneralName,
				//    minimum         [0]     BaseDistance DEFAULT 0,
				//    maximum         [1]     BaseDistance OPTIONAL }
				//
				//BaseDistance ::= INTEGER (0..MAX)

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [base]
     * @property {string} [minimum]
     * @property {string} [maximum]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [GeneralName.schema(names.base || {}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new Integer({ name: names.minimum || "" })]
					}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [new Integer({ name: names.maximum || "" })]
					})]
				});
			}
		}]);

		return GeneralSubtree;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var NameConstraints = function () {
		//**********************************************************************************
		/**
   * Constructor for NameConstraints class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function NameConstraints() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, NameConstraints);

			//region Internal properties of the object
			if ("permittedSubtrees" in parameters)
				/**
     * @type {Array.<GeneralSubtree>}
     * @description permittedSubtrees
     */
				this.permittedSubtrees = getParametersValue(parameters, "permittedSubtrees", NameConstraints.defaultValues("permittedSubtrees"));

			if ("excludedSubtrees" in parameters)
				/**
     * @type {Array.<GeneralSubtree>}
     * @description excludedSubtrees
     */
				this.excludedSubtrees = getParametersValue(parameters, "excludedSubtrees", NameConstraints.defaultValues("excludedSubtrees"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(NameConstraints, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, NameConstraints.schema({
					names: {
						permittedSubtrees: "permittedSubtrees",
						excludedSubtrees: "excludedSubtrees"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for NameConstraints");
				//endregion

				//region Get internal properties from parsed schema
				if ("permittedSubtrees" in asn1.result) this.permittedSubtrees = Array.from(asn1.result.permittedSubtrees, function (element) {
					return new GeneralSubtree({ schema: element });
				});

				if ("excludedSubtrees" in asn1.result) this.excludedSubtrees = Array.from(asn1.result.excludedSubtrees, function (element) {
					return new GeneralSubtree({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				if ("permittedSubtrees" in this) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new Sequence({
							value: Array.from(this.permittedSubtrees, function (element) {
								return element.toSchema();
							})
						})]
					}));
				}

				if ("excludedSubtrees" in this) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [new Sequence({
							value: Array.from(this.excludedSubtrees, function (element) {
								return element.toSchema();
							})
						})]
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				if ("permittedSubtrees" in this) object.permittedSubtrees = Array.from(this.permittedSubtrees, function (element) {
					return element.toJSON();
				});

				if ("excludedSubtrees" in this) object.excludedSubtrees = Array.from(this.excludedSubtrees, function (element) {
					return element.toJSON();
				});

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "permittedSubtrees":
						return [];
					case "excludedSubtrees":
						return [];
					default:
						throw new Error("Invalid member name for NameConstraints class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// NameConstraints OID ::= 2.5.29.30
				//
				//NameConstraints ::= SEQUENCE {
				//    permittedSubtrees       [0]     GeneralSubtrees OPTIONAL,
				//    excludedSubtrees        [1]     GeneralSubtrees OPTIONAL }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [permittedSubtrees]
     * @property {string} [excludedSubtrees]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new Repeated({
							name: names.permittedSubtrees || "",
							value: GeneralSubtree.schema()
						})]
					}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [new Repeated({
							name: names.excludedSubtrees || "",
							value: GeneralSubtree.schema()
						})]
					})]
				});
			}
		}]);

		return NameConstraints;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var DistributionPoint = function () {
		//**********************************************************************************
		/**
   * Constructor for DistributionPoint class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   * @property {Object} [distributionPoint]
   * @property {Object} [reasons]
   * @property {Object} [cRLIssuer]
   */
		function DistributionPoint() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, DistributionPoint);

			//region Internal properties of the object
			if ("distributionPoint" in parameters)
				/**
     * @type {Array.<GeneralName>}
     * @description distributionPoint
     */
				this.distributionPoint = getParametersValue(parameters, "distributionPoint", DistributionPoint.defaultValues("distributionPoint"));

			if ("reasons" in parameters)
				/**
     * @type {BitString}
     * @description values
     */
				this.reasons = getParametersValue(parameters, "reasons", DistributionPoint.defaultValues("reasons"));

			if ("cRLIssuer" in parameters)
				/**
     * @type {Array.<GeneralName>}
     * @description cRLIssuer
     */
				this.cRLIssuer = getParametersValue(parameters, "cRLIssuer", DistributionPoint.defaultValues("cRLIssuer"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(DistributionPoint, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, DistributionPoint.schema({
					names: {
						distributionPoint: "distributionPoint",
						distributionPointNames: "distributionPointNames",
						reasons: "reasons",
						cRLIssuer: "cRLIssuer",
						cRLIssuerNames: "cRLIssuerNames"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for DistributionPoint");
				//endregion

				//region Get internal properties from parsed schema
				if ("distributionPoint" in asn1.result) {
					if (asn1.result.distributionPoint.idBlock.tagNumber === 0) // GENERAL_NAMES variant
						this.distributionPoint = Array.from(asn1.result.distributionPointNames, function (element) {
							return new GeneralName({ schema: element });
						});

					if (asn1.result.distributionPoint.idBlock.tagNumber === 1) // RDN variant
						{
							asn1.result.distributionPoint.idBlock.tagClass = 1; // UNIVERSAL
							asn1.result.distributionPoint.idBlock.tagNumber = 16; // SEQUENCE

							this.distributionPoint = new RelativeDistinguishedNames({ schema: asn1.result.distributionPoint });
						}
				}

				if ("reasons" in asn1.result) this.reasons = new BitString({ valueHex: asn1.result.reasons.valueBlock.valueHex });

				if ("cRLIssuer" in asn1.result) this.cRLIssuer = Array.from(asn1.result.cRLIssuerNames, function (element) {
					return new GeneralName({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				if ("distributionPoint" in this) {
					var internalValue = void 0;

					if (this.distributionPoint instanceof Array) {
						internalValue = new Constructed({
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							value: Array.from(this.distributionPoint, function (element) {
								return element.toSchema();
							})
						});
					} else {
						internalValue = new Constructed({
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 1 // [1]
							},
							value: [this.distributionPoint.toSchema()]
						});
					}

					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [internalValue]
					}));
				}

				if ("reasons" in this) {
					outputArray.push(new Primitive({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						valueHex: this.reasons.valueBlock.valueHex
					}));
				}

				if ("cRLIssuer" in this) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						},
						value: Array.from(this.cRLIssuer, function (element) {
							return element.toSchema();
						})
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				if ("distributionPoint" in this) {
					if (this.distributionPoint instanceof Array) object.distributionPoint = Array.from(this.distributionPoint, function (element) {
						return element.toJSON();
					});else object.distributionPoint = this.distributionPoint.toJSON();
				}

				if ("reasons" in this) object.reasons = this.reasons.toJSON();

				if ("cRLIssuer" in this) object.cRLIssuer = Array.from(this.cRLIssuer, function (element) {
					return element.toJSON();
				});

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "distributionPoint":
						return [];
					case "reasons":
						return new BitString();
					case "cRLIssuer":
						return [];
					default:
						throw new Error("Invalid member name for DistributionPoint class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//DistributionPoint ::= SEQUENCE {
				//    distributionPoint       [0]     DistributionPointName OPTIONAL,
				//    reasons                 [1]     ReasonFlags OPTIONAL,
				//    cRLIssuer               [2]     GeneralNames OPTIONAL }
				//
				//DistributionPointName ::= CHOICE {
				//    fullName                [0]     GeneralNames,
				//    nameRelativeToCRLIssuer [1]     RelativeDistinguishedName }
				//
				//ReasonFlags ::= BIT STRING {
				//    unused                  (0),
				//    keyCompromise           (1),
				//    cACompromise            (2),
				//    affiliationChanged      (3),
				//    superseded              (4),
				//    cessationOfOperation    (5),
				//    certificateHold         (6),
				//    privilegeWithdrawn      (7),
				//    aACompromise            (8) }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [distributionPoint]
     * @property {string} [distributionPointNames]
     * @property {string} [reasons]
     * @property {string} [cRLIssuer]
     * @property {string} [cRLIssuerNames]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new Choice({
							value: [new Constructed({
								name: names.distributionPoint || "",
								optional: true,
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 0 // [0]
								},
								value: [new Repeated({
									name: names.distributionPointNames || "",
									value: GeneralName.schema()
								})]
							}), new Constructed({
								name: names.distributionPoint || "",
								optional: true,
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 1 // [1]
								},
								value: RelativeDistinguishedNames.schema().valueBlock.value
							})]
						})]
					}), new Primitive({
						name: names.reasons || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						}
					}), // IMPLICIT bitstring value
					new Constructed({
						name: names.cRLIssuer || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						},
						value: [new Repeated({
							name: names.cRLIssuerNames || "",
							value: GeneralName.schema()
						})]
					}) // IMPLICIT bitstring value
					]
				});
			}
		}]);

		return DistributionPoint;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var CRLDistributionPoints = function () {
		//**********************************************************************************
		/**
   * Constructor for CRLDistributionPoints class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function CRLDistributionPoints() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, CRLDistributionPoints);

			//region Internal properties of the object
			/**
    * @type {Array.<DistributionPoint>}
    * @description distributionPoints
    */
			this.distributionPoints = getParametersValue(parameters, "distributionPoints", CRLDistributionPoints.defaultValues("distributionPoints"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(CRLDistributionPoints, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, CRLDistributionPoints.schema({
					names: {
						distributionPoints: "distributionPoints"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for CRLDistributionPoints");
				//endregion

				//region Get internal properties from parsed schema
				this.distributionPoints = Array.from(asn1.result.distributionPoints, function (element) {
					return new DistributionPoint({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: Array.from(this.distributionPoints, function (element) {
						return element.toSchema();
					})
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					distributionPoints: Array.from(this.distributionPoints, function (element) {
						return element.toJSON();
					})
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "distributionPoints":
						return [];
					default:
						throw new Error("Invalid member name for CRLDistributionPoints class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// CRLDistributionPoints OID ::= 2.5.29.31
				//
				//CRLDistributionPoints ::= SEQUENCE SIZE (1..MAX) OF DistributionPoint

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [distributionPoints]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.distributionPoints || "",
						value: DistributionPoint.schema()
					})]
				});
			}
		}]);

		return CRLDistributionPoints;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var PolicyQualifierInfo = function () {
		//**********************************************************************************
		/**
   * Constructor for PolicyQualifierInfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function PolicyQualifierInfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, PolicyQualifierInfo);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description policyQualifierId
    */
			this.policyQualifierId = getParametersValue(parameters, "policyQualifierId", PolicyQualifierInfo.defaultValues("policyQualifierId"));
			/**
    * @type {Object}
    * @description qualifier
    */
			this.qualifier = getParametersValue(parameters, "qualifier", PolicyQualifierInfo.defaultValues("qualifier"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(PolicyQualifierInfo, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, PolicyQualifierInfo.schema({
					names: {
						policyQualifierId: "policyQualifierId",
						qualifier: "qualifier"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PolicyQualifierInfo");
				//endregion

				//region Get internal properties from parsed schema
				this.policyQualifierId = asn1.result.policyQualifierId.valueBlock.toString();
				this.qualifier = asn1.result.qualifier;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [new ObjectIdentifier({ value: this.policyQualifierId }), this.qualifier]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					policyQualifierId: this.policyQualifierId,
					qualifier: this.qualifier.toJSON()
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "policyQualifierId":
						return "";
					case "qualifier":
						return new Any();
					default:
						throw new Error("Invalid member name for PolicyQualifierInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//PolicyQualifierInfo ::= SEQUENCE {
				//    policyQualifierId  PolicyQualifierId,
				//    qualifier          ANY DEFINED BY policyQualifierId }
				//
				//id-qt          OBJECT IDENTIFIER ::=  { id-pkix 2 }
				//id-qt-cps      OBJECT IDENTIFIER ::=  { id-qt 1 }
				//id-qt-unotice  OBJECT IDENTIFIER ::=  { id-qt 2 }
				//
				//PolicyQualifierId ::= OBJECT IDENTIFIER ( id-qt-cps | id-qt-unotice )

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [policyQualifierId]
     * @property {string} [qualifier]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.policyQualifierId || "" }), new Any({ name: names.qualifier || "" })]
				});
			}
		}]);

		return PolicyQualifierInfo;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var PolicyInformation = function () {
		//**********************************************************************************
		/**
   * Constructor for PolicyInformation class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function PolicyInformation() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, PolicyInformation);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description policyIdentifier
    */
			this.policyIdentifier = getParametersValue(parameters, "policyIdentifier", PolicyInformation.defaultValues("policyIdentifier"));

			if ("policyQualifiers" in parameters)
				/**
     * @type {Array.<PolicyQualifierInfo>}
     * @description Value of the TIME class
     */
				this.policyQualifiers = getParametersValue(parameters, "policyQualifiers", PolicyInformation.defaultValues("policyQualifiers"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(PolicyInformation, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, PolicyInformation.schema({
					names: {
						policyIdentifier: "policyIdentifier",
						policyQualifiers: "policyQualifiers"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PolicyInformation");
				//endregion

				//region Get internal properties from parsed schema
				this.policyIdentifier = asn1.result.policyIdentifier.valueBlock.toString();

				if ("policyQualifiers" in asn1.result) this.policyQualifiers = Array.from(asn1.result.policyQualifiers, function (element) {
					return new PolicyQualifierInfo({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				outputArray.push(new ObjectIdentifier({ value: this.policyIdentifier }));

				if ("policyQualifiers" in this) {
					outputArray.push(new Sequence({
						value: Array.from(this.policyQualifiers, function (element) {
							return element.toSchema();
						})
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {
					policyIdentifier: this.policyIdentifier
				};

				if ("policyQualifiers" in this) object.policyQualifiers = Array.from(this.policyQualifiers, function (element) {
					return element.toJSON();
				});

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "policyIdentifier":
						return "";
					case "policyQualifiers":
						return [];
					default:
						throw new Error("Invalid member name for PolicyInformation class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//PolicyInformation ::= SEQUENCE {
				//    policyIdentifier   CertPolicyId,
				//    policyQualifiers   SEQUENCE SIZE (1..MAX) OF
				//    PolicyQualifierInfo OPTIONAL }
				//
				//CertPolicyId ::= OBJECT IDENTIFIER

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [policyIdentifier]
     * @property {string} [policyQualifiers]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.policyIdentifier || "" }), new Sequence({
						optional: true,
						value: [new Repeated({
							name: names.policyQualifiers || "",
							value: PolicyQualifierInfo.schema()
						})]
					})]
				});
			}
		}]);

		return PolicyInformation;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var CertificatePolicies = function () {
		//**********************************************************************************
		/**
   * Constructor for CertificatePolicies class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function CertificatePolicies() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, CertificatePolicies);

			//region Internal properties of the object
			/**
    * @type {Array.<PolicyInformation>}
    * @description certificatePolicies
    */
			this.certificatePolicies = getParametersValue(parameters, "certificatePolicies", CertificatePolicies.defaultValues("certificatePolicies"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(CertificatePolicies, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, CertificatePolicies.schema({
					names: {
						certificatePolicies: "certificatePolicies"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for CertificatePolicies");
				//endregion

				//region Get internal properties from parsed schema
				this.certificatePolicies = Array.from(asn1.result.certificatePolicies, function (element) {
					return new PolicyInformation({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: Array.from(this.certificatePolicies, function (element) {
						return element.toSchema();
					})
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					certificatePolicies: Array.from(this.certificatePolicies, function (element) {
						return element.toJSON();
					})
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "certificatePolicies":
						return [];
					default:
						throw new Error("Invalid member name for CertificatePolicies class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// CertificatePolicies OID ::= 2.5.29.32
				//
				//certificatePolicies ::= SEQUENCE SIZE (1..MAX) OF PolicyInformation

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [certificatePolicies]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.certificatePolicies || "",
						value: PolicyInformation.schema()
					})]
				});
			}
		}]);

		return CertificatePolicies;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var PolicyMapping = function () {
		//**********************************************************************************
		/**
   * Constructor for PolicyMapping class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function PolicyMapping() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, PolicyMapping);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description issuerDomainPolicy
    */
			this.issuerDomainPolicy = getParametersValue(parameters, "issuerDomainPolicy", PolicyMapping.defaultValues("issuerDomainPolicy"));
			/**
    * @type {string}
    * @description subjectDomainPolicy
    */
			this.subjectDomainPolicy = getParametersValue(parameters, "subjectDomainPolicy", PolicyMapping.defaultValues("subjectDomainPolicy"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(PolicyMapping, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, PolicyMapping.schema({
					names: {
						issuerDomainPolicy: "issuerDomainPolicy",
						subjectDomainPolicy: "subjectDomainPolicy"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PolicyMapping");
				//endregion

				//region Get internal properties from parsed schema
				this.issuerDomainPolicy = asn1.result.issuerDomainPolicy.valueBlock.toString();
				this.subjectDomainPolicy = asn1.result.subjectDomainPolicy.valueBlock.toString();
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [new ObjectIdentifier({ value: this.issuerDomainPolicy }), new ObjectIdentifier({ value: this.subjectDomainPolicy })]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					issuerDomainPolicy: this.issuerDomainPolicy,
					subjectDomainPolicy: this.subjectDomainPolicy
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "issuerDomainPolicy":
						return "";
					case "subjectDomainPolicy":
						return "";
					default:
						throw new Error("Invalid member name for PolicyMapping class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//PolicyMapping ::= SEQUENCE {
				//    issuerDomainPolicy      CertPolicyId,
				//    subjectDomainPolicy     CertPolicyId }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [issuerDomainPolicy]
     * @property {string} [subjectDomainPolicy]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.issuerDomainPolicy || "" }), new ObjectIdentifier({ name: names.subjectDomainPolicy || "" })]
				});
			}
		}]);

		return PolicyMapping;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var PolicyMappings = function () {
		//**********************************************************************************
		/**
   * Constructor for PolicyMappings class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function PolicyMappings() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, PolicyMappings);

			//region Internal properties of the object
			/**
    * @type {Array.<PolicyMapping>}
    * @description mappings
    */
			this.mappings = getParametersValue(parameters, "mappings", PolicyMappings.defaultValues("mappings"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(PolicyMappings, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, PolicyMappings.schema({
					names: {
						mappings: "mappings"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PolicyMappings");
				//endregion

				//region Get internal properties from parsed schema
				this.mappings = Array.from(asn1.result.mappings, function (element) {
					return new PolicyMapping({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: Array.from(this.mappings, function (element) {
						return element.toSchema();
					})
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					mappings: Array.from(this.mappings, function (element) {
						return element.toJSON();
					})
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "mappings":
						return [];
					default:
						throw new Error("Invalid member name for PolicyMappings class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// PolicyMappings OID ::= 2.5.29.33
				//
				//PolicyMappings ::= SEQUENCE SIZE (1..MAX) OF PolicyMapping

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [utcTimeName] Name for "utcTimeName" choice
     * @property {string} [generalTimeName] Name for "generalTimeName" choice
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.mappings || "",
						value: PolicyMapping.schema()
					})]
				});
			}
		}]);

		return PolicyMappings;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var AuthorityKeyIdentifier = function () {
		//**********************************************************************************
		/**
   * Constructor for AuthorityKeyIdentifier class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function AuthorityKeyIdentifier() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, AuthorityKeyIdentifier);

			//region Internal properties of the object
			if ("keyIdentifier" in parameters)
				/**
     * @type {OctetString}
     * @description keyIdentifier
     */
				this.keyIdentifier = getParametersValue(parameters, "keyIdentifier", AuthorityKeyIdentifier.defaultValues("keyIdentifier"));

			if ("authorityCertIssuer" in parameters)
				/**
     * @type {Array.<GeneralName>}
     * @description authorityCertIssuer
     */
				this.authorityCertIssuer = getParametersValue(parameters, "authorityCertIssuer", AuthorityKeyIdentifier.defaultValues("authorityCertIssuer"));

			if ("authorityCertSerialNumber" in parameters)
				/**
     * @type {Integer}
     * @description authorityCertIssuer
     */
				this.authorityCertSerialNumber = getParametersValue(parameters, "authorityCertSerialNumber", AuthorityKeyIdentifier.defaultValues("authorityCertSerialNumber"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(AuthorityKeyIdentifier, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, AuthorityKeyIdentifier.schema({
					names: {
						keyIdentifier: "keyIdentifier",
						authorityCertIssuer: "authorityCertIssuer",
						authorityCertSerialNumber: "authorityCertSerialNumber"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for AuthorityKeyIdentifier");
				//endregion

				//region Get internal properties from parsed schema
				if ("keyIdentifier" in asn1.result) {
					asn1.result.keyIdentifier.idBlock.tagClass = 1; // UNIVERSAL
					asn1.result.keyIdentifier.idBlock.tagNumber = 4; // OCTETSTRING

					this.keyIdentifier = asn1.result.keyIdentifier;
				}

				if ("authorityCertIssuer" in asn1.result) this.authorityCertIssuer = Array.from(asn1.result.authorityCertIssuer, function (element) {
					return new GeneralName({ schema: element });
				});

				if ("authorityCertSerialNumber" in asn1.result) {
					asn1.result.authorityCertSerialNumber.idBlock.tagClass = 1; // UNIVERSAL
					asn1.result.authorityCertSerialNumber.idBlock.tagNumber = 2; // INTEGER

					this.authorityCertSerialNumber = asn1.result.authorityCertSerialNumber;
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				if ("keyIdentifier" in this) {
					var value = this.keyIdentifier;

					value.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
					value.idBlock.tagNumber = 0; // [0]

					outputArray.push(value);
				}

				if ("authorityCertIssuer" in this) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [new Sequence({
							value: Array.from(this.authorityCertIssuer, function (element) {
								return element.toSchema();
							})
						})]
					}));
				}

				if ("authorityCertSerialNumber" in this) {
					var _value5 = this.authorityCertSerialNumber;

					_value5.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
					_value5.idBlock.tagNumber = 2; // [2]

					outputArray.push(_value5);
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				if ("keyIdentifier" in this) object.keyIdentifier = this.keyIdentifier.toJSON();

				if ("authorityCertIssuer" in this) object.authorityCertIssuer = Array.from(this.authorityCertIssuer, function (element) {
					return element.toJSON();
				});

				if ("authorityCertSerialNumber" in this) object.authorityCertSerialNumber = this.authorityCertSerialNumber.toJSON();

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "keyIdentifier":
						return new OctetString();
					case "authorityCertIssuer":
						return [];
					case "authorityCertSerialNumber":
						return new Integer();
					default:
						throw new Error("Invalid member name for AuthorityKeyIdentifier class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// AuthorityKeyIdentifier OID ::= 2.5.29.35
				//
				//AuthorityKeyIdentifier ::= SEQUENCE {
				//    keyIdentifier             [0] KeyIdentifier           OPTIONAL,
				//    authorityCertIssuer       [1] GeneralNames            OPTIONAL,
				//    authorityCertSerialNumber [2] CertificateSerialNumber OPTIONAL  }
				//
				//KeyIdentifier ::= OCTET STRING

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [keyIdentifier]
     * @property {string} [authorityCertIssuer]
     * @property {string} [authorityCertSerialNumber]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Primitive({
						name: names.keyIdentifier || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						}
					}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [new Repeated({
							name: names.authorityCertIssuer || "",
							value: GeneralName.schema()
						})]
					}), new Primitive({
						name: names.authorityCertSerialNumber || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						}
					})]
				});
			}
		}]);

		return AuthorityKeyIdentifier;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var PolicyConstraints = function () {
		//**********************************************************************************
		/**
   * Constructor for PolicyConstraints class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function PolicyConstraints() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, PolicyConstraints);

			//region Internal properties of the object
			if ("requireExplicitPolicy" in parameters)
				/**
     * @type {number}
     * @description requireExplicitPolicy
     */
				this.requireExplicitPolicy = getParametersValue(parameters, "requireExplicitPolicy", PolicyConstraints.defaultValues("requireExplicitPolicy"));

			if ("inhibitPolicyMapping" in parameters)
				/**
     * @type {number}
     * @description Value of the TIME class
     */
				this.inhibitPolicyMapping = getParametersValue(parameters, "inhibitPolicyMapping", PolicyConstraints.defaultValues("inhibitPolicyMapping"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(PolicyConstraints, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, PolicyConstraints.schema({
					names: {
						requireExplicitPolicy: "requireExplicitPolicy",
						inhibitPolicyMapping: "inhibitPolicyMapping"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PolicyConstraints");
				//endregion

				//region Get internal properties from parsed schema
				if ("requireExplicitPolicy" in asn1.result) {
					var field1 = asn1.result.requireExplicitPolicy;

					field1.idBlock.tagClass = 1; // UNIVERSAL
					field1.idBlock.tagNumber = 2; // INTEGER

					var ber1 = field1.toBER(false);
					var int1 = fromBER(ber1);

					this.requireExplicitPolicy = int1.result.valueBlock.valueDec;
				}

				if ("inhibitPolicyMapping" in asn1.result) {
					var field2 = asn1.result.inhibitPolicyMapping;

					field2.idBlock.tagClass = 1; // UNIVERSAL
					field2.idBlock.tagNumber = 2; // INTEGER

					var ber2 = field2.toBER(false);
					var int2 = fromBER(ber2);

					this.inhibitPolicyMapping = int2.result.valueBlock.valueDec;
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create correct values for output sequence
				var outputArray = [];

				if ("requireExplicitPolicy" in this) {
					var int1 = new Integer({ value: this.requireExplicitPolicy });

					int1.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
					int1.idBlock.tagNumber = 0; // [0]

					outputArray.push(int1);
				}

				if ("inhibitPolicyMapping" in this) {
					var int2 = new Integer({ value: this.inhibitPolicyMapping });

					int2.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
					int2.idBlock.tagNumber = 1; // [1]

					outputArray.push(int2);
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				if ("requireExplicitPolicy" in this) object.requireExplicitPolicy = this.requireExplicitPolicy;

				if ("inhibitPolicyMapping" in this) object.inhibitPolicyMapping = this.inhibitPolicyMapping;

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "requireExplicitPolicy":
						return 0;
					case "inhibitPolicyMapping":
						return 0;
					default:
						throw new Error("Invalid member name for PolicyConstraints class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// PolicyMappings OID ::= 2.5.29.36
				//
				//PolicyConstraints ::= SEQUENCE {
				//    requireExplicitPolicy           [0] SkipCerts OPTIONAL,
				//    inhibitPolicyMapping            [1] SkipCerts OPTIONAL }
				//
				//SkipCerts ::= INTEGER (0..MAX)

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [requireExplicitPolicy]
     * @property {string} [inhibitPolicyMapping]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Primitive({
						name: names.requireExplicitPolicy || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						}
					}), // IMPLICIT integer value
					new Primitive({
						name: names.inhibitPolicyMapping || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						}
					}) // IMPLICIT integer value
					]
				});
			}
		}]);

		return PolicyConstraints;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var ExtKeyUsage = function () {
		//**********************************************************************************
		/**
   * Constructor for ExtKeyUsage class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function ExtKeyUsage() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, ExtKeyUsage);

			//region Internal properties of the object
			/**
    * @type {Array.<string>}
    * @description keyPurposes
    */
			this.keyPurposes = getParametersValue(parameters, "keyPurposes", ExtKeyUsage.defaultValues("keyPurposes"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(ExtKeyUsage, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, ExtKeyUsage.schema({
					names: {
						keyPurposes: "keyPurposes"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for ExtKeyUsage");
				//endregion

				//region Get internal properties from parsed schema
				this.keyPurposes = Array.from(asn1.result.keyPurposes, function (element) {
					return element.valueBlock.toString();
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: Array.from(this.keyPurposes, function (element) {
						return new ObjectIdentifier({ value: element });
					})
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					keyPurposes: Array.from(this.keyPurposes)
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "keyPurposes":
						return [];
					default:
						throw new Error("Invalid member name for ExtKeyUsage class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// ExtKeyUsage OID ::= 2.5.29.37
				//
				// ExtKeyUsage ::= SEQUENCE SIZE (1..MAX) OF KeyPurposeId

				// KeyPurposeId ::= OBJECT IDENTIFIER

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [keyPurposes]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.keyPurposes || "",
						value: new ObjectIdentifier()
					})]
				});
			}
		}]);

		return ExtKeyUsage;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var AccessDescription = function () {
		//**********************************************************************************
		/**
   * Constructor for AccessDescription class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function AccessDescription() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, AccessDescription);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description accessMethod
    */
			this.accessMethod = getParametersValue(parameters, "accessMethod", AccessDescription.defaultValues("accessMethod"));
			/**
    * @type {GeneralName}
    * @description accessLocation
    */
			this.accessLocation = getParametersValue(parameters, "accessLocation", AccessDescription.defaultValues("accessLocation"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(AccessDescription, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, AccessDescription.schema({
					names: {
						accessMethod: "accessMethod",
						accessLocation: {
							names: {
								blockName: "accessLocation"
							}
						}
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for AccessDescription");
				//endregion

				//region Get internal properties from parsed schema
				this.accessMethod = asn1.result.accessMethod.valueBlock.toString();
				this.accessLocation = new GeneralName({ schema: asn1.result.accessLocation });
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [new ObjectIdentifier({ value: this.accessMethod }), this.accessLocation.toSchema()]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					accessMethod: this.accessMethod,
					accessLocation: this.accessLocation.toJSON()
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "accessMethod":
						return "";
					case "accessLocation":
						return new GeneralName();
					default:
						throw new Error("Invalid member name for AccessDescription class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//AccessDescription  ::=  SEQUENCE {
				//    accessMethod          OBJECT IDENTIFIER,
				//    accessLocation        GeneralName  }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [accessMethod]
     * @property {string} [accessLocation]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.accessMethod || "" }), GeneralName.schema(names.accessLocation || {})]
				});
			}
		}]);

		return AccessDescription;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var InfoAccess = function () {
		//**********************************************************************************
		/**
   * Constructor for InfoAccess class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function InfoAccess() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, InfoAccess);

			//region Internal properties of the object
			/**
    * @type {Array.<AccessDescription>}
    * @description accessDescriptions
    */
			this.accessDescriptions = getParametersValue(parameters, "accessDescriptions", InfoAccess.defaultValues("accessDescriptions"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(InfoAccess, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, InfoAccess.schema({
					names: {
						accessDescriptions: "accessDescriptions"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for InfoAccess");
				//endregion

				//region Get internal properties from parsed schema
				this.accessDescriptions = Array.from(asn1.result.accessDescriptions, function (element) {
					return new AccessDescription({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: Array.from(this.accessDescriptions, function (element) {
						return element.toSchema();
					})
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					accessDescriptions: Array.from(this.accessDescriptions, function (element) {
						return element.toJSON();
					})
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "accessDescriptions":
						return [];
					default:
						throw new Error("Invalid member name for InfoAccess class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				// AuthorityInfoAccess OID ::= 1.3.6.1.5.5.7.1.1
				// SubjectInfoAccess OID ::= 1.3.6.1.5.5.7.1.11
				//
				//AuthorityInfoAccessSyntax  ::=
				//SEQUENCE SIZE (1..MAX) OF AccessDescription

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [accessDescriptions]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.accessDescriptions || "",
						value: AccessDescription.schema()
					})]
				});
			}
		}]);

		return InfoAccess;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var Extension = function () {
		//**********************************************************************************
		/**
   * Constructor for Extension class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function Extension() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Extension);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description extnID
    */
			this.extnID = getParametersValue(parameters, "extnID", Extension.defaultValues("extnID"));
			/**
    * @type {boolean}
    * @description critical
    */
			this.critical = getParametersValue(parameters, "critical", Extension.defaultValues("critical"));
			/**
    * @type {OctetString}
    * @description extnValue
    */
			if ("extnValue" in parameters) this.extnValue = new OctetString({ valueHex: parameters.extnValue });else this.extnValue = Extension.defaultValues("extnValue");

			if ("parsedValue" in parameters)
				/**
     * @type {Object}
     * @description parsedValue
     */
				this.parsedValue = getParametersValue(parameters, "parsedValue", Extension.defaultValues("parsedValue"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(Extension, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, Extension.schema({
					names: {
						extnID: "extnID",
						critical: "critical",
						extnValue: "extnValue"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for EXTENSION");
				//endregion

				//region Get internal properties from parsed schema
				this.extnID = asn1.result.extnID.valueBlock.toString();
				if ("critical" in asn1.result) this.critical = asn1.result.critical.valueBlock.value;
				this.extnValue = asn1.result.extnValue;

				//region Get "parsedValue" for well-known extensions
				asn1 = fromBER(this.extnValue.valueBlock.valueHex);
				if (asn1.offset === -1) return;

				switch (this.extnID) {
					case "2.5.29.9":
						// SubjectDirectoryAttributes
						this.parsedValue = new SubjectDirectoryAttributes({ schema: asn1.result });
						break;
					case "2.5.29.14":
						// SubjectKeyIdentifier
						this.parsedValue = asn1.result; // Should be just a simple OCTETSTRING
						break;
					case "2.5.29.15":
						// KeyUsage
						this.parsedValue = asn1.result; // Should be just a simple BITSTRING
						break;
					case "2.5.29.16":
						// PrivateKeyUsagePeriod
						this.parsedValue = new PrivateKeyUsagePeriod({ schema: asn1.result });
						break;
					case "2.5.29.17": // SubjectAltName
					case "2.5.29.18":
						// IssuerAltName
						this.parsedValue = new AltName({ schema: asn1.result });
						break;
					case "2.5.29.19":
						// BasicConstraints
						this.parsedValue = new BasicConstraints({ schema: asn1.result });
						break;
					case "2.5.29.20": // CRLNumber
					case "2.5.29.27":
						// BaseCRLNumber (delta CRL indicator)
						this.parsedValue = asn1.result; // Should be just a simple INTEGER
						break;
					case "2.5.29.21":
						// CRLReason
						this.parsedValue = asn1.result; // Should be just a simple ENUMERATED
						break;
					case "2.5.29.24":
						// InvalidityDate
						this.parsedValue = asn1.result; // Should be just a simple GeneralizedTime
						break;
					case "2.5.29.28":
						// IssuingDistributionPoint
						this.parsedValue = new IssuingDistributionPoint({ schema: asn1.result });
						break;
					case "2.5.29.29":
						// CertificateIssuer
						this.parsedValue = new GeneralNames({ schema: asn1.result }); // Should be just a simple
						break;
					case "2.5.29.30":
						// NameConstraints
						this.parsedValue = new NameConstraints({ schema: asn1.result });
						break;
					case "2.5.29.31": // CRLDistributionPoints
					case "2.5.29.46":
						// FreshestCRL
						this.parsedValue = new CRLDistributionPoints({ schema: asn1.result });
						break;
					case "2.5.29.32":
						// CertificatePolicies
						this.parsedValue = new CertificatePolicies({ schema: asn1.result });
						break;
					case "2.5.29.33":
						// PolicyMappings
						this.parsedValue = new PolicyMappings({ schema: asn1.result });
						break;
					case "2.5.29.35":
						// AuthorityKeyIdentifier
						this.parsedValue = new AuthorityKeyIdentifier({ schema: asn1.result });
						break;
					case "2.5.29.36":
						// PolicyConstraints
						this.parsedValue = new PolicyConstraints({ schema: asn1.result });
						break;
					case "2.5.29.37":
						// ExtKeyUsage
						this.parsedValue = new ExtKeyUsage({ schema: asn1.result });
						break;
					case "2.5.29.54":
						// InhibitAnyPolicy
						this.parsedValue = asn1.result; // Should be just a simple INTEGER
						break;
					case "1.3.6.1.5.5.7.1.1": // AuthorityInfoAccess
					case "1.3.6.1.5.5.7.1.11":
						// SubjectInfoAccess
						this.parsedValue = new InfoAccess({ schema: asn1.result });
						break;
					default:
				}
				//endregion
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				outputArray.push(new ObjectIdentifier({ value: this.extnID }));

				if (this.critical !== Extension.defaultValues("critical")) outputArray.push(new Boolean({ value: this.critical }));

				outputArray.push(this.extnValue);
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {
					extnID: this.extnID,
					extnValue: this.extnValue.toJSON()
				};

				if (this.critical !== Extension.defaultValues("critical")) object.critical = this.critical;

				if ("parsedValue" in this) object.parsedValue = this.parsedValue.toJSON();

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "extnID":
						return "";
					case "critical":
						return false;
					case "extnValue":
						return new OctetString();
					case "parsedValue":
						return {};
					default:
						throw new Error("Invalid member name for Extension class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//Extension  ::=  SEQUENCE  {
				//    extnID      OBJECT IDENTIFIER,
				//    critical    BOOLEAN DEFAULT FALSE,
				//    extnValue   OCTET STRING
				//}

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [extnID]
     * @property {string} [critical]
     * @property {string} [extnValue]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.extnID || "" }), new Boolean({
						name: names.critical || "",
						optional: true
					}), new OctetString({ name: names.extnValue || "" })]
				});
			}
		}]);

		return Extension;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var Extensions = function () {
		//**********************************************************************************
		/**
   * Constructor for Extensions class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function Extensions() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Extensions);

			//region Internal properties of the object
			/**
    * @type {Array.<Extension>}
    * @description type
    */
			this.extensions = getParametersValue(parameters, "extensions", Extensions.defaultValues("extensions"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(Extensions, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, Extensions.schema({
					names: {
						extensions: "extensions"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for EXTENSIONS");
				//endregion

				//region Get internal properties from parsed schema
				this.extensions = Array.from(asn1.result.extensions, function (element) {
					return new Extension({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: Array.from(this.extensions, function (element) {
						return element.toSchema();
					})
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					extensions: Array.from(this.extensions, function (element) {
						return element.toJSON();
					})
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "extensions":
						return [];
					default:
						throw new Error("Invalid member name for Extensions class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @param {boolean} optional Flag that current schema should be optional
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
				var optional = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

				//Extensions  ::=  SEQUENCE SIZE (1..MAX) OF Extension

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [extensions]
     * @property {string} [extension]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					optional: optional,
					name: names.blockName || "",
					value: [new Repeated({
						name: names.extensions || "",
						value: Extension.schema(names.extension || {})
					})]
				});
			}
		}]);

		return Extensions;
	}();
	//**************************************************************************************

	//**************************************************************************************


	function tbsCertificate() {
		var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		//TBSCertificate  ::=  SEQUENCE  {
		//    version         [0]  EXPLICIT Version DEFAULT v1,
		//    serialNumber         CertificateSerialNumber,
		//    signature            AlgorithmIdentifier,
		//    issuer               Name,
		//    validity             Validity,
		//    subject              Name,
		//    subjectPublicKeyInfo SubjectPublicKeyInfo,
		//    issuerUniqueID  [1]  IMPLICIT UniqueIdentifier OPTIONAL,
		//                         -- If present, version MUST be v2 or v3
		//    subjectUniqueID [2]  IMPLICIT UniqueIdentifier OPTIONAL,
		//                         -- If present, version MUST be v2 or v3
		//    extensions      [3]  EXPLICIT Extensions OPTIONAL
		//    -- If present, version MUST be v3
		//}

		/**
   * @type {Object}
   * @property {string} [blockName]
   * @property {string} [tbsCertificateVersion]
   * @property {string} [tbsCertificateSerialNumber]
   * @property {string} [signature]
   * @property {string} [issuer]
   * @property {string} [tbsCertificateValidity]
   * @property {string} [notBefore]
   * @property {string} [notAfter]
   * @property {string} [subject]
   * @property {string} [subjectPublicKeyInfo]
   * @property {string} [tbsCertificateIssuerUniqueID]
   * @property {string} [tbsCertificateSubjectUniqueID]
   * @property {string} [extensions]
   */
		var names = getParametersValue(parameters, "names", {});

		return new Sequence({
			name: names.blockName || "tbsCertificate",
			value: [new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [new Integer({ name: names.tbsCertificateVersion || "tbsCertificate.version" }) // EXPLICIT integer value
				]
			}), new Integer({ name: names.tbsCertificateSerialNumber || "tbsCertificate.serialNumber" }), AlgorithmIdentifier.schema(names.signature || {
				names: {
					blockName: "tbsCertificate.signature"
				}
			}), RelativeDistinguishedNames.schema(names.issuer || {
				names: {
					blockName: "tbsCertificate.issuer"
				}
			}), new Sequence({
				name: names.tbsCertificateValidity || "tbsCertificate.validity",
				value: [Time.schema(names.notBefore || {
					names: {
						utcTimeName: "tbsCertificate.notBefore",
						generalTimeName: "tbsCertificate.notBefore"
					}
				}), Time.schema(names.notAfter || {
					names: {
						utcTimeName: "tbsCertificate.notAfter",
						generalTimeName: "tbsCertificate.notAfter"
					}
				})]
			}), RelativeDistinguishedNames.schema(names.subject || {
				names: {
					blockName: "tbsCertificate.subject"
				}
			}), PublicKeyInfo.schema(names.subjectPublicKeyInfo || {
				names: {
					blockName: "tbsCertificate.subjectPublicKeyInfo"
				}
			}), new Primitive({
				name: names.tbsCertificateIssuerUniqueID || "tbsCertificate.issuerUniqueID",
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 1 // [1]
				}
			}), // IMPLICIT bistring value
			new Primitive({
				name: names.tbsCertificateSubjectUniqueID || "tbsCertificate.subjectUniqueID",
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 2 // [2]
				}
			}), // IMPLICIT bistring value
			new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 3 // [3]
				},
				value: [Extensions.schema(names.extensions || {
					names: {
						blockName: "tbsCertificate.extensions"
					}
				})]
			}) // EXPLICIT SEQUENCE value
			]
		});
	}
	//**************************************************************************************
	/**
  * Class from RFC5280
  */

	var Certificate = function () {
		//**********************************************************************************
		/**
   * Constructor for Certificate class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function Certificate() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, Certificate);

			//region Internal properties of the object
			/**
    * @type {ArrayBuffer}
    * @description tbs
    */
			this.tbs = getParametersValue(parameters, "tbs", Certificate.defaultValues("tbs"));
			/**
    * @type {number}
    * @description version
    */
			this.version = getParametersValue(parameters, "version", Certificate.defaultValues("version"));
			/**
    * @type {Integer}
    * @description serialNumber
    */
			this.serialNumber = getParametersValue(parameters, "serialNumber", Certificate.defaultValues("serialNumber"));
			/**
    * @type {AlgorithmIdentifier}
    * @description signature
    */
			this.signature = getParametersValue(parameters, "signature", Certificate.defaultValues("signature"));
			/**
    * @type {RelativeDistinguishedNames}
    * @description issuer
    */
			this.issuer = getParametersValue(parameters, "issuer", Certificate.defaultValues("issuer"));
			/**
    * @type {Time}
    * @description notBefore
    */
			this.notBefore = getParametersValue(parameters, "notBefore", Certificate.defaultValues("notBefore"));
			/**
    * @type {Time}
    * @description notAfter
    */
			this.notAfter = getParametersValue(parameters, "notAfter", Certificate.defaultValues("notAfter"));
			/**
    * @type {RelativeDistinguishedNames}
    * @description subject
    */
			this.subject = getParametersValue(parameters, "subject", Certificate.defaultValues("subject"));
			/**
    * @type {PublicKeyInfo}
    * @description subjectPublicKeyInfo
    */
			this.subjectPublicKeyInfo = getParametersValue(parameters, "subjectPublicKeyInfo", Certificate.defaultValues("subjectPublicKeyInfo"));

			if ("issuerUniqueID" in parameters)
				/**
     * @type {ArrayBuffer}
     * @description issuerUniqueID
     */
				this.issuerUniqueID = getParametersValue(parameters, "issuerUniqueID", Certificate.defaultValues("issuerUniqueID"));

			if ("subjectUniqueID" in parameters)
				/**
     * @type {ArrayBuffer}
     * @description subjectUniqueID
     */
				this.subjectUniqueID = getParametersValue(parameters, "subjectUniqueID", Certificate.defaultValues("subjectUniqueID"));

			if ("extensions" in parameters)
				/**
     * @type {Array}
     * @description extensions
     */
				this.extensions = getParametersValue(parameters, "extensions", Certificate.defaultValues("extensions"));

			/**
    * @type {AlgorithmIdentifier}
    * @description signatureAlgorithm
    */
			this.signatureAlgorithm = getParametersValue(parameters, "signatureAlgorithm", Certificate.defaultValues("signatureAlgorithm"));
			/**
    * @type {BitString}
    * @description signatureValue
    */
			this.signatureValue = getParametersValue(parameters, "signatureValue", Certificate.defaultValues("signatureValue"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}

		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(Certificate, [{
			key: "fromSchema",


			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, Certificate.schema({
					names: {
						tbsCertificate: {
							names: {
								extensions: {
									names: {
										extensions: "tbsCertificate.extensions"
									}
								}
							}
						}
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for CERT");
				//endregion

				//region Get internal properties from parsed schema
				this.tbs = asn1.result.tbsCertificate.valueBeforeDecode;

				if ("tbsCertificate.version" in asn1.result) this.version = asn1.result["tbsCertificate.version"].valueBlock.valueDec;
				this.serialNumber = asn1.result["tbsCertificate.serialNumber"];
				this.signature = new AlgorithmIdentifier({ schema: asn1.result["tbsCertificate.signature"] });
				this.issuer = new RelativeDistinguishedNames({ schema: asn1.result["tbsCertificate.issuer"] });
				this.notBefore = new Time({ schema: asn1.result["tbsCertificate.notBefore"] });
				this.notAfter = new Time({ schema: asn1.result["tbsCertificate.notAfter"] });
				this.subject = new RelativeDistinguishedNames({ schema: asn1.result["tbsCertificate.subject"] });
				this.subjectPublicKeyInfo = new PublicKeyInfo({ schema: asn1.result["tbsCertificate.subjectPublicKeyInfo"] });
				if ("tbsCertificate.issuerUniqueID" in asn1.result) this.issuerUniqueID = asn1.result["tbsCertificate.issuerUniqueID"].valueBlock.valueHex;
				if ("tbsCertificate.subjectUniqueID" in asn1.result) this.issuerUniqueID = asn1.result["tbsCertificate.subjectUniqueID"].valueBlock.valueHex;
				if ("tbsCertificate.extensions" in asn1.result) this.extensions = Array.from(asn1.result["tbsCertificate.extensions"], function (element) {
					return new Extension({ schema: element });
				});

				this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.signatureAlgorithm });
				this.signatureValue = asn1.result.signatureValue;
				//endregion
			}

			//**********************************************************************************
			/**
    * Create ASN.1 schema for existing values of TBS part for the certificate
    */

		}, {
			key: "encodeTBS",
			value: function encodeTBS() {
				//region Create array for output sequence
				var outputArray = [];

				if ("version" in this && this.version !== Certificate.defaultValues("version")) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new Integer({ value: this.version }) // EXPLICIT integer value
						]
					}));
				}

				outputArray.push(this.serialNumber);
				outputArray.push(this.signature.toSchema());
				outputArray.push(this.issuer.toSchema());

				outputArray.push(new Sequence({
					value: [this.notBefore.toSchema(), this.notAfter.toSchema()]
				}));

				outputArray.push(this.subject.toSchema());
				outputArray.push(this.subjectPublicKeyInfo.toSchema());

				if ("issuerUniqueID" in this) {
					outputArray.push(new Primitive({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						valueHex: this.issuerUniqueID
					}));
				}
				if ("subjectUniqueID" in this) {
					outputArray.push(new Primitive({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						},
						valueHex: this.subjectUniqueID
					}));
				}

				if ("subjectUniqueID" in this) {
					outputArray.push(new Primitive({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 3 // [3]
						},
						value: [this.extensions.toSchema()]
					}));
				}

				if ("extensions" in this) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 3 // [3]
						},
						value: [new Sequence({
							value: Array.from(this.extensions, function (element) {
								return element.toSchema();
							})
						})]
					}));
				}
				//endregion

				//region Create and return output sequence
				return new Sequence({
					value: outputArray
				});
				//endregion
			}

			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				var encodeFlag = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				var tbsSchema = {};

				//region Decode stored TBS value
				if (encodeFlag === false) {
					if (this.tbs.length === 0) // No stored certificate TBS part
						return Certificate.schema().value[0];

					tbsSchema = fromBER(this.tbs).result;
				}
				//endregion
				//region Create TBS schema via assembling from TBS parts
				else tbsSchema = this.encodeTBS();
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [tbsSchema, this.signatureAlgorithm.toSchema(), this.signatureValue]
				});
				//endregion
			}

			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {
					tbs: bufferToHexCodes(this.tbs, 0, this.tbs.byteLength),
					serialNumber: this.serialNumber.toJSON(),
					signature: this.signature.toJSON(),
					issuer: this.issuer.toJSON(),
					notBefore: this.notBefore.toJSON(),
					notAfter: this.notAfter.toJSON(),
					subject: this.subject.toJSON(),
					subjectPublicKeyInfo: this.subjectPublicKeyInfo.toJSON(),
					signatureAlgorithm: this.signatureAlgorithm.toJSON(),
					signatureValue: this.signatureValue.toJSON()
				};

				if ("version" in this && this.version !== Certificate.defaultValues("version")) object.version = this.version;

				if ("issuerUniqueID" in this) object.issuerUniqueID = bufferToHexCodes(this.issuerUniqueID, 0, this.issuerUniqueID.byteLength);

				if ("subjectUniqueID" in this) object.subjectUniqueID = bufferToHexCodes(this.subjectUniqueID, 0, this.subjectUniqueID.byteLength);

				if ("extensions" in this) object.extensions = Array.from(this.extensions, function (element) {
					return element.toJSON();
				});

				return object;
			}

			//**********************************************************************************
			/**
    * Importing public key for current certificate
    */

		}, {
			key: "getPublicKey",
			value: function getPublicKey() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				//region Find correct algorithm for imported public key
				if (parameters === null) {
					//region Initial variables
					parameters = {};
					//endregion

					//region Find signer's hashing algorithm
					var shaAlgorithm = getHashAlgorithm(this.signatureAlgorithm);
					if (shaAlgorithm === "") return Promise.reject("Unsupported signature algorithm: " + this.signatureAlgorithm.algorithmId);
					//endregion

					//region Get information about public key algorithm and default parameters for import
					var algorithmObject = getAlgorithmByOID(this.subjectPublicKeyInfo.algorithm.algorithmId);
					if ("name" in algorithmObject === false) return Promise.reject("Unsupported public key algorithm: " + this.subjectPublicKeyInfo.algorithm.algorithmId);

					parameters.algorithm = getAlgorithmParameters(algorithmObject.name, "importkey");
					if ("hash" in parameters.algorithm.algorithm) parameters.algorithm.algorithm.hash.name = shaAlgorithm;
					//endregion
				}
				//endregion

				//region Get neccessary values from internal fields for current certificate
				var publicKeyInfoSchema = this.subjectPublicKeyInfo.toSchema();
				var publicKeyInfoBuffer = publicKeyInfoSchema.toBER(false);
				var publicKeyInfoView = new Uint8Array(publicKeyInfoBuffer);
				//endregion

				return crypto.importKey("spki", publicKeyInfoView, parameters.algorithm.algorithm, true, parameters.algorithm.usages);
			}

			//**********************************************************************************
			/**
    * Get SHA-1 hash value for subject public key
    */

		}, {
			key: "getKeyHash",
			value: function getKeyHash() {
				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				return crypto.digest({ name: "sha-1" }, new Uint8Array(this.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHex));
			}

			//**********************************************************************************
			/**
    * Make a signature for current value from TBS section
    * @param {Object} privateKey Private key for "subjectPublicKeyInfo" structure
    * @param {string} [hashAlgorithm="SHA-1"] Hashing algorithm
    */

		}, {
			key: "sign",
			value: function sign(privateKey) {
				var _this53 = this;

				var hashAlgorithm = arguments.length <= 1 || arguments[1] === undefined ? "SHA-1" : arguments[1];

				//region Get hashing algorithm
				var oid = getOIDByAlgorithm({ name: hashAlgorithm });
				if (oid === "") return Promise.reject("Unsupported hash algorithm: " + hashAlgorithm);
				//endregion

				//region Get a "default parameters" for current algorithm
				var defParams = getAlgorithmParameters(privateKey.algorithm.name, "sign");
				defParams.algorithm.hash.name = hashAlgorithm;
				//endregion

				//region Fill internal structures base on "privateKey" and "hashAlgorithm"
				switch (privateKey.algorithm.name.toUpperCase()) {
					case "RSASSA-PKCS1-V1_5":
					case "ECDSA":
						this.signature.algorithmId = getOIDByAlgorithm(defParams.algorithm);
						this.signatureAlgorithm.algorithmId = this.signature.algorithmId;
						break;
					case "RSA-PSS":
						{
							//region Set "saltLength" as a length (in octets) of hash function result
							switch (hashAlgorithm.toUpperCase()) {
								case "SHA-256":
									defParams.algorithm.saltLength = 32;
									break;
								case "SHA-384":
									defParams.algorithm.saltLength = 48;
									break;
								case "SHA-512":
									defParams.algorithm.saltLength = 64;
									break;
								default:
							}
							//endregion

							//region Fill "RSASSA_PSS_params" object
							var paramsObject = {};

							if (hashAlgorithm.toUpperCase() !== "SHA-1") {
								var hashAlgorithmOID = getOIDByAlgorithm({ name: hashAlgorithm });
								if (hashAlgorithmOID === "") return Promise.reject("Unsupported hash algorithm: " + hashAlgorithm);

								paramsObject.hashAlgorithm = new AlgorithmIdentifier({
									algorithmId: hashAlgorithmOID,
									algorithmParams: new Null()
								});

								paramsObject.maskGenAlgorithm = new AlgorithmIdentifier({
									algorithmId: "1.2.840.113549.1.1.8", // MGF1
									algorithmParams: paramsObject.hashAlgorithm.toSchema()
								});
							}

							if (defParams.algorithm.saltLength !== 20) paramsObject.saltLength = defParams.algorithm.saltLength;

							var pssParameters = new RSASSAPSSParams(paramsObject);
							//endregion

							//region Automatically set signature algorithm
							this.signature = new AlgorithmIdentifier({
								algorithmId: "1.2.840.113549.1.1.10",
								algorithmParams: pssParameters.toSchema()
							});
							this.signatureAlgorithm = this.signature; // Must be the same
							//endregion
						}
						break;
					default:
						return Promise.reject("Unsupported signature algorithm: " + privateKey.algorithm.name);
				}
				//endregion

				//region Create TBS data for signing
				this.tbs = this.encodeTBS().toBER(false);
				//endregion

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				//region Signing TBS data on provided private key
				return crypto.sign(defParams.algorithm, privateKey, new Uint8Array(this.tbs)).then(function (result) {
					//region Special case for ECDSA algorithm
					if (defParams.algorithm.name === "ECDSA") result = createCMSECDSASignature(result);
					//endregion

					_this53.signatureValue = new BitString({ valueHex: result });
				}, function (error) {
					return Promise.reject("Signing error: " + error);
				});
				//endregion
			}

			//**********************************************************************************

		}, {
			key: "verify",
			value: function verify() {
				var _this54 = this;

				var issuerCertificate = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

				//region Global variables
				var sequence = Promise.resolve();

				var subjectPublicKeyInfo = {};

				var signature = this.signatureValue;
				var tbs = this.tbs;
				//endregion

				//region Set correct "subjectPublicKeyInfo" value
				if (issuerCertificate !== null) subjectPublicKeyInfo = issuerCertificate.subjectPublicKeyInfo;else {
					if (this.issuer.isEqual(this.subject)) // Self-signed certificate
						subjectPublicKeyInfo = this.subjectPublicKeyInfo;
				}

				if (subjectPublicKeyInfo instanceof PublicKeyInfo === false) return Promise.reject("Please provide issuer certificate as a parameter");
				//endregion

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				//region Find signer's hashing algorithm
				var shaAlgorithm = getHashAlgorithm(this.signatureAlgorithm);
				if (shaAlgorithm === "") return Promise.reject("Unsupported signature algorithm: " + this.signatureAlgorithm.algorithmId);
				//endregion

				//region Importing public key
				sequence = sequence.then(function () {
					//region Get information about public key algorithm and default parameters for import
					var algorithmId = void 0;
					if (_this54.signatureAlgorithm.algorithmId === "1.2.840.113549.1.1.10") algorithmId = _this54.signatureAlgorithm.algorithmId;else algorithmId = subjectPublicKeyInfo.algorithm.algorithmId;

					var algorithmObject = getAlgorithmByOID(algorithmId);
					if ("name" in algorithmObject === false) return Promise.reject("Unsupported public key algorithm: " + algorithmId);

					var algorithm = getAlgorithmParameters(algorithmObject.name, "importkey");
					if ("hash" in algorithm.algorithm) algorithm.algorithm.hash.name = shaAlgorithm;
					//endregion

					var publicKeyInfoSchema = subjectPublicKeyInfo.toSchema();
					var publicKeyInfoBuffer = publicKeyInfoSchema.toBER(false);
					var publicKeyInfoView = new Uint8Array(publicKeyInfoBuffer);

					return crypto.importKey("spki", publicKeyInfoView, algorithm.algorithm, true, algorithm.usages);
				});
				//endregion

				//region Verify signature for the certificate
				sequence = sequence.then(function (publicKey) {
					//region Get default algorithm parameters for verification
					var algorithm = getAlgorithmParameters(publicKey.algorithm.name, "verify");
					if ("hash" in algorithm.algorithm) algorithm.algorithm.hash.name = shaAlgorithm;
					//endregion

					//region Special case for ECDSA signatures
					var signatureValue = signature.valueBlock.valueHex;

					if (publicKey.algorithm.name === "ECDSA") {
						var asn1 = fromBER(signatureValue);
						signatureValue = createECDSASignatureFromCMS(asn1.result);
					}
					//endregion

					//region Special case for RSA-PSS
					if (publicKey.algorithm.name === "RSA-PSS") {
						var pssParameters = void 0;

						try {
							pssParameters = new RSASSAPSSParams({ schema: _this54.signatureAlgorithm.algorithmParams });
						} catch (ex) {
							return Promise.reject(ex);
						}

						if ("saltLength" in pssParameters) algorithm.algorithm.saltLength = pssParameters.saltLength;else algorithm.algorithm.saltLength = 20;

						var hashAlgo = "SHA-1";

						if ("hashAlgorithm" in pssParameters) {
							var hashAlgorithm = getAlgorithmByOID(pssParameters.hashAlgorithm.algorithmId);
							if ("name" in hashAlgorithm === false) return Promise.reject("Unrecognized hash algorithm: " + pssParameters.hashAlgorithm.algorithmId);

							hashAlgo = hashAlgorithm.name;
						}

						algorithm.algorithm.hash.name = hashAlgo;
					}
					//endregion

					return crypto.verify(algorithm.algorithm, publicKey, new Uint8Array(signatureValue), new Uint8Array(tbs));
				});
				//endregion

				return sequence;
			}

			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "tbs":
						return new ArrayBuffer(0);
					case "version":
						return 0;
					case "serialNumber":
						return new Integer();
					case "signature":
						return new AlgorithmIdentifier();
					case "issuer":
						return new RelativeDistinguishedNames();
					case "notBefore":
						return new Time();
					case "notAfter":
						return new Time();
					case "subject":
						return new RelativeDistinguishedNames();
					case "subjectPublicKeyInfo":
						return new PublicKeyInfo();
					case "issuerUniqueID":
						return new ArrayBuffer(0);
					case "subjectUniqueID":
						return new ArrayBuffer(0);
					case "extensions":
						return [];
					case "signatureAlgorithm":
						return new AlgorithmIdentifier();
					case "signatureValue":
						return new BitString();
					default:
						throw new Error("Invalid member name for Certificate class: " + memberName);
				}
			}

			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//Certificate  ::=  SEQUENCE  {
				//    tbsCertificate       TBSCertificate,
				//    signatureAlgorithm   AlgorithmIdentifier,
				//    signatureValue       BIT STRING  }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [tbsCertificate]
     * @property {string} [signatureAlgorithm]
     * @property {string} [signatureValue]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [tbsCertificate(names.tbsCertificate), AlgorithmIdentifier.schema(names.signatureAlgorithm || {
						names: {
							blockName: "signatureAlgorithm"
						}
					}), new BitString({ name: names.signatureValue || "signatureValue" })]
				});
			}
		}]);

		return Certificate;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var CertificateSet = function () {
		//**********************************************************************************
		/**
   * Constructor for CertificateSet class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function CertificateSet() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, CertificateSet);

			//region Internal properties of the object
			/**
    * @type {Array}
    * @description certificates
    */
			this.certificates = getParametersValue(parameters, "certificates", CertificateSet.defaultValues("certificates"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}

		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(CertificateSet, [{
			key: "fromSchema",


			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, CertificateSet.schema());

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for CMS_CERTIFICATE_SET");
				//endregion

				//region Get internal properties from parsed schema
				this.certificates = Array.from(asn1.result.certificates, function (element) {
					if (element.idBlock.tagClass === 1) return new Certificate({ schema: element });

					return element;
				});
				//endregion
			}

			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Set({
					value: Array.from(this.certificates, function (element) {
						if (element instanceof Certificate) return element.toSchema();

						return element;
					})
				});
				//endregion
			}

			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					certificates: Array.from(this.certificates, function (element) {
						return element.toJSON();
					})
				};
			}

			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "certificates":
						return [];
					default:
						throw new Error("Invalid member name for Attribute class: " + memberName);
				}
			}

			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//CertificateSet ::= SET OF CertificateChoices
				//
				//CertificateChoices ::= CHOICE {
				//    certificate Certificate,
				//    extendedCertificate [0] IMPLICIT ExtendedCertificate,  -- Obsolete
				//    v1AttrCert [1] IMPLICIT AttributeCertificateV1,        -- Obsolete
				//    v2AttrCert [2] IMPLICIT AttributeCertificateV2,
				//    other [3] IMPLICIT OtherCertificateFormat }

				/**
     * @type {Object}
     * @property {string} [blockName]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Set({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.certificates || "",
						value: new Choice({
							value: [Certificate.schema(), new Constructed({
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 1 // [1]
								},
								value: [new Any()]
							}), // JUST A STUB
							new Constructed({
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 2 // [2]
								},
								value: [new Any()]
							}), // JUST A STUB
							new Constructed({
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 3 // [3]
								},
								value: [new ObjectIdentifier(), new Any()]
							})]
						})
					})]
				}); // TODO: add definition for "AttributeCertificateV2"
			}
		}]);

		return CertificateSet;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5280
  */


	var RevokedCertificate = function () {
		//**********************************************************************************
		/**
   * Constructor for RevokedCertificate class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function RevokedCertificate() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, RevokedCertificate);

			//region Internal properties of the object
			/**
    * @type {Integer}
    * @description userCertificate
    */
			this.userCertificate = getParametersValue(parameters, "userCertificate", RevokedCertificate.defaultValues("userCertificate"));
			/**
    * @type {Time}
    * @description revocationDate
    */
			this.revocationDate = getParametersValue(parameters, "revocationDate", RevokedCertificate.defaultValues("revocationDate"));

			if ("crlEntryExtensions" in parameters)
				/**
     * @type {Extensions}
     * @description crlEntryExtensions
     */
				this.crlEntryExtensions = getParametersValue(parameters, "crlEntryExtensions", RevokedCertificate.defaultValues("crlEntryExtensions"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(RevokedCertificate, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, RevokedCertificate.schema());

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for REV_CERT");
				//endregion

				//region Get internal properties from parsed schema
				this.userCertificate = asn1.result.userCertificate;
				this.revocationDate = new Time({ schema: asn1.result.revocationDate });

				if ("crlEntryExtensions" in asn1.result) this.crlEntryExtensions = new Extensions({ schema: asn1.result.crlEntryExtensions });
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [this.userCertificate, this.revocationDate.toSchema()];

				if ("crlEntryExtensions" in this) outputArray.push(this.crlEntryExtensions.toSchema());
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {
					userCertificate: this.userCertificate.toJSON(),
					revocationDate: this.revocationDate.toJSON
				};

				if ("crlEntryExtensions" in this) object.crlEntryExtensions = this.crlEntryExtensions.toJSON();

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "userCertificate":
						return new Integer();
					case "revocationDate":
						return new Time();
					case "crlEntryExtensions":
						return new Extensions();
					default:
						throw new Error("Invalid member name for RevokedCertificate class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [userCertificate]
     * @property {string} [revocationDate]
     * @property {string} [crlEntryExtensions]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.userCertificate || "userCertificate" }), Time.schema({
						names: {
							utcTimeName: names.revocationDate || "revocationDate",
							generalTimeName: names.revocationDate || "revocationDate"
						}
					}), Extensions.schema({
						names: {
							blockName: names.crlEntryExtensions || "crlEntryExtensions"
						}
					}, true)]
				});
			}
		}]);

		return RevokedCertificate;
	}();
	//**************************************************************************************

	//**************************************************************************************


	function tbsCertList() {
		var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		//TBSCertList  ::=  SEQUENCE  {
		//    version                 Version OPTIONAL,
		//                                 -- if present, MUST be v2
		//    signature               AlgorithmIdentifier,
		//    issuer                  Name,
		//    thisUpdate              Time,
		//    nextUpdate              Time OPTIONAL,
		//    revokedCertificates     SEQUENCE OF SEQUENCE  {
		//        userCertificate         CertificateSerialNumber,
		//        revocationDate          Time,
		//        crlEntryExtensions      Extensions OPTIONAL
		//        -- if present, version MUST be v2
		//    }  OPTIONAL,
		//    crlExtensions           [0]  EXPLICIT Extensions OPTIONAL
		//    -- if present, version MUST be v2
		//}

		/**
   * @type {Object}
   * @property {string} [blockName]
   * @property {string} [tbsCertListVersion]
   * @property {string} [signature]
   * @property {string} [issuer]
   * @property {string} [tbsCertListThisUpdate]
   * @property {string} [tbsCertListNextUpdate]
   * @property {string} [tbsCertListRevokedCertificates]
   * @property {string} [crlExtensions]
   */
		var names = getParametersValue(parameters, "names", {});

		return new Sequence({
			name: names.blockName || "tbsCertList",
			value: [new Integer({
				optional: true,
				name: names.tbsCertListVersion || "tbsCertList.version",
				value: 2
			}), // EXPLICIT integer value (v2)
			AlgorithmIdentifier.schema(names.signature || {
				names: {
					blockName: "tbsCertList.signature"
				}
			}), RelativeDistinguishedNames.schema(names.issuer || {
				names: {
					blockName: "tbsCertList.issuer"
				}
			}), Time.schema(names.tbsCertListThisUpdate || {
				names: {
					utcTimeName: "tbsCertList.thisUpdate",
					generalTimeName: "tbsCertList.thisUpdate"
				}
			}), Time.schema(names.tbsCertListNextUpdate || {
				names: {
					utcTimeName: "tbsCertList.nextUpdate",
					generalTimeName: "tbsCertList.nextUpdate"
				}
			}, true), new Sequence({
				optional: true,
				value: [new Repeated({
					name: names.tbsCertListRevokedCertificates || "tbsCertList.revokedCertificates",
					value: new Sequence({
						value: [new Integer(), Time.schema(), Extensions.schema({}, true)]
					})
				})]
			}), new Constructed({
				optional: true,
				idBlock: {
					tagClass: 3, // CONTEXT-SPECIFIC
					tagNumber: 0 // [0]
				},
				value: [Extensions.schema(names.crlExtensions || {
					names: {
						blockName: "tbsCertList.extensions"
					}
				})]
			}) // EXPLICIT SEQUENCE value
			]
		});
	}
	//**************************************************************************************
	/**
  * Class from RFC5280
  */

	var CertificateRevocationList = function () {
		//**********************************************************************************
		/**
   * Constructor for Attribute class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function CertificateRevocationList() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, CertificateRevocationList);

			//region Internal properties of the object
			/**
    * @type {ArrayBuffer}
    * @description tbs
    */
			this.tbs = getParametersValue(parameters, "tbs", CertificateRevocationList.defaultValues("tbs"));
			/**
    * @type {number}
    * @description version
    */
			this.version = getParametersValue(parameters, "version", CertificateRevocationList.defaultValues("version"));
			/**
    * @type {AlgorithmIdentifier}
    * @description signature
    */
			this.signature = getParametersValue(parameters, "signature", CertificateRevocationList.defaultValues("signature"));
			/**
    * @type {RelativeDistinguishedNames}
    * @description issuer
    */
			this.issuer = getParametersValue(parameters, "issuer", CertificateRevocationList.defaultValues("issuer"));
			/**
    * @type {Time}
    * @description thisUpdate
    */
			this.thisUpdate = getParametersValue(parameters, "thisUpdate", CertificateRevocationList.defaultValues("thisUpdate"));

			if ("nextUpdate" in parameters)
				/**
     * @type {Time}
     * @description nextUpdate
     */
				this.nextUpdate = getParametersValue(parameters, "nextUpdate", CertificateRevocationList.defaultValues("nextUpdate"));

			if ("revokedCertificates" in parameters)
				/**
     * @type {Array.<RevokedCertificate>}
     * @description revokedCertificates
     */
				this.revokedCertificates = getParametersValue(parameters, "revokedCertificates", CertificateRevocationList.defaultValues("revokedCertificates"));

			if ("crlExtensions" in parameters)
				/**
     * @type {Extensions}
     * @description crlExtensions
     */
				this.crlExtensions = getParametersValue(parameters, "crlExtensions", CertificateRevocationList.defaultValues("crlExtensions"));

			/**
    * @type {AlgorithmIdentifier}
    * @description signatureAlgorithm
    */
			this.signatureAlgorithm = getParametersValue(parameters, "signatureAlgorithm", CertificateRevocationList.defaultValues("signatureAlgorithm"));
			/**
    * @type {BitString}
    * @description signatureValue
    */
			this.signatureValue = getParametersValue(parameters, "signatureValue", CertificateRevocationList.defaultValues("signatureValue"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}

		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(CertificateRevocationList, [{
			key: "fromSchema",


			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, CertificateRevocationList.schema());

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for CRL");
				//endregion

				//region Get internal properties from parsed schema
				this.tbs = asn1.result.tbsCertList.valueBeforeDecode;

				if ("tbsCertList.version" in asn1.result) this.version = asn1.result["tbsCertList.version"].valueBlock.valueDec;
				this.signature = new AlgorithmIdentifier({ schema: asn1.result["tbsCertList.signature"] });
				this.issuer = new RelativeDistinguishedNames({ schema: asn1.result["tbsCertList.issuer"] });
				this.thisUpdate = new Time({ schema: asn1.result["tbsCertList.thisUpdate"] });
				if ("tbsCertList.nextUpdate" in asn1.result) this.nextUpdate = new Time({ schema: asn1.result["tbsCertList.nextUpdate"] });
				if ("tbsCertList.revokedCertificates" in asn1.result) this.revokedCertificates = Array.from(asn1.result["tbsCertList.revokedCertificates"], function (element) {
					return new RevokedCertificate({ schema: element });
				});
				if ("tbsCertList.extensions" in asn1.result) this.crlExtensions = new Extensions({ schema: asn1.result["tbsCertList.extensions"] });

				this.signatureAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.signatureAlgorithm });
				this.signatureValue = asn1.result.signatureValue;
				//endregion
			}

			//**********************************************************************************

		}, {
			key: "encodeTBS",
			value: function encodeTBS() {
				//region Create array for output sequence
				var outputArray = [];

				if (this.version !== CertificateRevocationList.defaultValues("version")) outputArray.push(new Integer({ value: this.version }));

				outputArray.push(this.signature.toSchema());
				outputArray.push(this.issuer.toSchema());
				outputArray.push(this.thisUpdate.toSchema());

				if ("nextUpdate" in this) outputArray.push(this.nextUpdate.toSchema());

				if ("revokedCertificates" in this) {
					outputArray.push(new Sequence({
						value: Array.from(this.revokedCertificates, function (element) {
							return element.toSchema();
						})
					}));
				}

				if ("crlExtensions" in this) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [this.crlExtensions.toSchema()]
					}));
				}
				//endregion

				return new Sequence({
					value: outputArray
				});
			}

			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				var encodeFlag = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

				//region Decode stored TBS value
				var tbsSchema = void 0;

				if (encodeFlag === false) {
					if (this.tbs.length === 0) // No stored TBS part
						return CertificateRevocationList.schema();

					tbsSchema = fromBER(this.tbs).result;
				}
				//endregion
				//region Create TBS schema via assembling from TBS parts
				else tbsSchema = this.encodeTBS();
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [tbsSchema, this.signatureAlgorithm.toSchema(), this.signatureValue]
				});
				//endregion
			}

			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {
					tbs: bufferToHexCodes(this.tbs, 0, this.tbs.byteLength),
					signature: this.signature.toJSON(),
					issuer: this.issuer.toJSON(),
					thisUpdate: this.thisUpdate.toJSON(),
					signatureAlgorithm: this.signatureAlgorithm.toJSON(),
					signatureValue: this.signatureValue.toJSON()
				};

				if (this.version !== CertificateRevocationList.defaultValues("version")) object.version = this.version;

				if ("nextUpdate" in this) object.nextUpdate = this.nextUpdate.toJSON();

				if ("revokedCertificates" in this) object.revokedCertificates = Array.from(this.revokedCertificates, function (element) {
					return element.toJSON();
				});

				if ("crlExtensions" in this) object.crlExtensions = this.crlExtensions.toJSON();

				return object;
			}

			//**********************************************************************************

		}, {
			key: "isCertificateRevoked",
			value: function isCertificateRevoked(certificate) {
				//region Check that issuer of the input certificate is the same with issuer of this CRL
				if (this.issuer.isEqual(certificate.issuer) === false) return false;
				//endregion

				//region Check that there are revoked certificates in this CRL
				if ("revokedCertificates" in this === false) return false;
				//endregion

				//region Search for input certificate in revoked certificates array
				var _iteratorNormalCompletion15 = true;
				var _didIteratorError15 = false;
				var _iteratorError15 = undefined;

				try {
					for (var _iterator15 = this.revokedCertificates[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
						var revokedCertificate = _step15.value;

						if (revokedCertificate.userCertificate.isEqual(certificate.serialNumber)) return true;
					}
					//endregion
				} catch (err) {
					_didIteratorError15 = true;
					_iteratorError15 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion15 && _iterator15.return) {
							_iterator15.return();
						}
					} finally {
						if (_didIteratorError15) {
							throw _iteratorError15;
						}
					}
				}

				return false;
			}

			//**********************************************************************************
			/**
    * Make a signature for existing CRL data
    * @param {Object} privateKey Private key for "subjectPublicKeyInfo" structure
    * @param {string} [hashAlgorithm] Hashing algorithm. Default SHA-1
    */

		}, {
			key: "sign",
			value: function sign(privateKey) {
				var _this55 = this;

				var hashAlgorithm = arguments.length <= 1 || arguments[1] === undefined ? "SHA-1" : arguments[1];

				//region Get a private key from function parameter
				if (typeof privateKey === "undefined") return Promise.reject("Need to provide a private key for signing");
				//endregion

				//region Get hashing algorithm
				var oid = getOIDByAlgorithm({ name: hashAlgorithm });
				if (oid === "") return Promise.reject("Unsupported hash algorithm: " + hashAlgorithm);
				//endregion

				//region Get a "default parameters" for current algorithm
				var defParams = getAlgorithmParameters(privateKey.algorithm.name, "sign");
				defParams.algorithm.hash.name = hashAlgorithm;
				//endregion

				//region Fill internal structures base on "privateKey" and "hashAlgorithm"
				switch (privateKey.algorithm.name.toUpperCase()) {
					case "RSASSA-PKCS1-V1_5":
					case "ECDSA":
						this.signature.algorithmId = getOIDByAlgorithm(defParams.algorithm);
						this.signatureAlgorithm.algorithmId = this.signature.algorithmId;
						break;
					case "RSA-PSS":
						{
							//region Set "saltLength" as a length (in octets) of hash function result
							switch (hashAlgorithm.toUpperCase()) {
								case "SHA-256":
									defParams.algorithm.saltLength = 32;
									break;
								case "SHA-384":
									defParams.algorithm.saltLength = 48;
									break;
								case "SHA-512":
									defParams.algorithm.saltLength = 64;
									break;
								default:
							}
							//endregion

							//region Fill "RSASSA_PSS_params" object
							var paramsObject = {};

							if (hashAlgorithm.toUpperCase() !== "SHA-1") {
								var hashAlgorithmOID = getOIDByAlgorithm({ name: hashAlgorithm });
								if (hashAlgorithmOID === "") return Promise.reject("Unsupported hash algorithm: " + hashAlgorithm);

								paramsObject.hashAlgorithm = new AlgorithmIdentifier({
									algorithmId: hashAlgorithmOID,
									algorithmParams: new Null()
								});

								paramsObject.maskGenAlgorithm = new AlgorithmIdentifier({
									algorithmId: "1.2.840.113549.1.1.8", // MGF1
									algorithmParams: paramsObject.hashAlgorithm.toSchema()
								});
							}

							if (defParams.algorithm.saltLength !== 20) paramsObject.saltLength = defParams.algorithm.saltLength;

							var pssParameters = new RSASSAPSSParams(paramsObject);
							//endregion

							//region Automatically set signature algorithm
							this.signature = new AlgorithmIdentifier({
								algorithmId: "1.2.840.113549.1.1.10",
								algorithmParams: pssParameters.toSchema()
							});
							this.signatureAlgorithm = this.signature; // Must be the same
							//endregion
						}
						break;
					default:
						return Promise.reject("Unsupported signature algorithm: " + privateKey.algorithm.name);
				}
				//endregion

				//region Create TBS data for signing
				this.tbs = this.encodeTBS().toBER(false);
				//endregion

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				//region Signing TBS data on provided private key
				return crypto.sign(defParams.algorithm, privateKey, new Uint8Array(this.tbs)).then(function (result) {
					//region Special case for ECDSA algorithm
					if (defParams.algorithm.name === "ECDSA") result = createCMSECDSASignature(result);
					//endregion

					_this55.signatureValue = new BitString({ valueHex: result });
				}, function (error) {
					return Promise.reject("Signing error: " + error);
				});
				//endregion
			}

			//**********************************************************************************
			/**
    * Verify existing signature
    * @param {{[issuerCertificate]: Object, [publicKeyInfo]: Object}} parameters
    * @returns {*}
    */

		}, {
			key: "verify",
			value: function verify() {
				var _this56 = this;

				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//region Global variables
				var sequence = Promise.resolve();

				var signature = this.signatureValue;
				var tbs = this.tbs;

				var subjectPublicKeyInfo = -1;
				//endregion

				//region Get information about CRL issuer certificate
				if ("issuerCertificate" in parameters) // "issuerCertificate" must be of type "simpl.CERT"
					{
						subjectPublicKeyInfo = parameters.issuerCertificate.subjectPublicKeyInfo;

						// The CRL issuer name and "issuerCertificate" subject name are not equal
						if (this.issuer.isEqual(parameters.issuerCertificate.subject) === false) return Promise.resolve(false);
					}

				//region In case if there is only public key during verification
				if ("publicKeyInfo" in parameters) subjectPublicKeyInfo = parameters.publicKeyInfo; // Must be of type "PublicKeyInfo"
				//endregion

				if (subjectPublicKeyInfo instanceof PublicKeyInfo === false) return Promise.reject("Issuer's certificate must be provided as an input parameter");
				//endregion

				//region Check the CRL for unknown critical extensions
				if ("crlExtensions" in this) {
					var _iteratorNormalCompletion16 = true;
					var _didIteratorError16 = false;
					var _iteratorError16 = undefined;

					try {
						for (var _iterator16 = this.crlExtensions.extensions[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
							var extension = _step16.value;

							if (extension.critical) {
								// We can not be sure that unknown extension has no value for CRL signature
								if ("parsedValue" in extension === false) return Promise.resolve(false);
							}
						}
					} catch (err) {
						_didIteratorError16 = true;
						_iteratorError16 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion16 && _iterator16.return) {
								_iterator16.return();
							}
						} finally {
							if (_didIteratorError16) {
								throw _iteratorError16;
							}
						}
					}
				}
				//endregion

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				//region Find signer's hashing algorithm
				var shaAlgorithm = getHashAlgorithm(this.signatureAlgorithm);
				if (shaAlgorithm === "") return Promise.reject("Unsupported signature algorithm: " + this.signatureAlgorithm.algorithmId);
				//endregion

				//region Import public key
				sequence = sequence.then(function () {
					//region Get information about public key algorithm and default parameters for import
					var algorithmObject = getAlgorithmByOID(_this56.signature.algorithmId);
					if ("name" in algorithmObject === "") return Promise.reject("Unsupported public key algorithm: " + _this56.signature.algorithmId);

					var algorithm = getAlgorithmParameters(algorithmObject.name, "importkey");
					if ("hash" in algorithm.algorithm) algorithm.algorithm.hash.name = shaAlgorithm;
					//endregion

					var publicKeyInfoSchema = subjectPublicKeyInfo.toSchema();
					var publicKeyInfoBuffer = publicKeyInfoSchema.toBER(false);
					var publicKeyInfoView = new Uint8Array(publicKeyInfoBuffer);

					return crypto.importKey("spki", publicKeyInfoView, algorithm.algorithm, true, algorithm.usages);
				});
				//endregion

				//region Verify signature for the certificate
				sequence = sequence.then(function (publicKey) {
					//region Get default algorithm parameters for verification
					var algorithm = getAlgorithmParameters(publicKey.algorithm.name, "verify");
					if ("hash" in algorithm.algorithm) algorithm.algorithm.hash.name = shaAlgorithm;
					//endregion

					//region Special case for ECDSA signatures
					var signatureValue = signature.valueBlock.valueHex;

					if (publicKey.algorithm.name === "ECDSA") {
						var asn1 = fromBER(signatureValue);
						signatureValue = createECDSASignatureFromCMS(asn1.result);
					}
					//endregion

					//region Special case for RSA-PSS
					if (publicKey.algorithm.name === "RSA-PSS") {
						var pssParameters = void 0;

						try {
							pssParameters = new RSASSAPSSParams({ schema: _this56.signatureAlgorithm.algorithmParams });
						} catch (ex) {
							return Promise.reject(ex);
						}

						if ("saltLength" in pssParameters) algorithm.algorithm.saltLength = pssParameters.saltLength;else algorithm.algorithm.saltLength = 20;

						var hashAlgo = "SHA-1";

						if ("hashAlgorithm" in pssParameters) {
							var hashAlgorithm = getAlgorithmByOID(pssParameters.hashAlgorithm.algorithmId);
							if ("name" in hashAlgorithm === false) return Promise.reject("Unrecognized hash algorithm: " + pssParameters.hashAlgorithm.algorithmId);

							hashAlgo = hashAlgorithm.name;
						}

						algorithm.algorithm.hash.name = hashAlgo;
					}
					//endregion

					return crypto.verify(algorithm.algorithm, publicKey, new Uint8Array(signatureValue), new Uint8Array(tbs));
				});
				//endregion

				return sequence;
			}

			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "tbs":
						return new ArrayBuffer(0);
					case "version":
						return 1;
					case "signature":
						return new AlgorithmIdentifier();
					case "issuer":
						return new RelativeDistinguishedNames();
					case "thisUpdate":
						return new Time();
					case "nextUpdate":
						return new Time();
					case "revokedCertificates":
						return [];
					case "crlExtensions":
						return new Extensions();
					case "signatureAlgorithm":
						return new AlgorithmIdentifier();
					case "signatureValue":
						return new BitString();
					default:
						throw new Error("Invalid member name for CertificateRevocationList class: " + memberName);
				}
			}

			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//CertificateList  ::=  SEQUENCE  {
				//    tbsCertList          TBSCertList,
				//    signatureAlgorithm   AlgorithmIdentifier,
				//    signatureValue       BIT STRING  }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [signatureAlgorithm]
     * @property {string} [signatureValue]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "CertificateList",
					value: [tbsCertList(parameters), AlgorithmIdentifier.schema(names.signatureAlgorithm || {
						names: {
							blockName: "signatureAlgorithm"
						}
					}), new BitString({ name: names.signatureValue || "signatureValue" })]
				});
			}
		}]);

		return CertificateRevocationList;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var OtherRevocationInfoFormat = function () {
		//**********************************************************************************
		/**
   * Constructor for OtherRevocationInfoFormat class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function OtherRevocationInfoFormat() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, OtherRevocationInfoFormat);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description otherRevInfoFormat
    */
			this.otherRevInfoFormat = getParametersValue(parameters, "otherRevInfoFormat", OtherRevocationInfoFormat.defaultValues("otherRevInfoFormat"));
			/**
    * @type {Any}
    * @description otherRevInfo
    */
			this.otherRevInfo = getParametersValue(parameters, "otherRevInfo", OtherRevocationInfoFormat.defaultValues("otherRevInfo"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(OtherRevocationInfoFormat, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, OtherRevocationInfoFormat.schema());

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for OtherRevocationInfoFormat");
				//endregion

				//region Get internal properties from parsed schema
				this.otherRevInfoFormat = asn1.result.otherRevInfoFormat.valueBlock.toString();
				this.otherRevInfo = asn1.result.otherRevInfo;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [new ObjectIdentifier({ value: this.otherRevInfoFormat }), this.otherRevInfo]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {
					otherRevInfoFormat: this.otherRevInfoFormat
				};

				if (!(this.otherRevInfo instanceof Any)) object.otherRevInfo = this.otherRevInfo.toJSON();

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "otherRevInfoFormat":
						return "";
					case "otherRevInfo":
						return new Any();
					default:
						throw new Error("Invalid member name for OtherRevocationInfoFormat class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//OtherCertificateFormat ::= SEQUENCE {
				//    otherRevInfoFormat OBJECT IDENTIFIER,
				//    otherRevInfo ANY DEFINED BY otherCertFormat }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [otherRevInfoFormat]
     * @property {string} [otherRevInfo]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.otherRevInfoFormat || "otherRevInfoFormat" }), new Any({ name: names.otherRevInfo || "otherRevInfo" })]
				});
			}
		}]);

		return OtherRevocationInfoFormat;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var RevocationInfoChoices = function () {
		//**********************************************************************************
		/**
   * Constructor for RevocationInfoChoices class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function RevocationInfoChoices() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, RevocationInfoChoices);

			//region Internal properties of the object
			/**
    * @type {Array.<CertificateRevocationList>}
    * @description crls
    */
			this.crls = getParametersValue(parameters, "crls", RevocationInfoChoices.defaultValues("crls"));
			/**
    * @type {Array.<OtherRevocationInfoFormat>}
    * @description otherRevocationInfos
    */
			this.otherRevocationInfos = getParametersValue(parameters, "otherRevocationInfos", RevocationInfoChoices.defaultValues("otherRevocationInfos"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}

		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(RevocationInfoChoices, [{
			key: "fromSchema",


			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, RevocationInfoChoices.schema({
					names: {
						crls: "crls"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for CSM_REVOCATION_INFO_CHOICES");
				//endregion

				//region Get internal properties from parsed schema
				var _iteratorNormalCompletion17 = true;
				var _didIteratorError17 = false;
				var _iteratorError17 = undefined;

				try {
					for (var _iterator17 = asn1.result.crls[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
						var element = _step17.value;

						if (element.idBlock.tagClass === 1) this.crls.push(new CertificateRevocationList({ schema: element }));else this.otherRevocationInfos.push(new OtherRevocationInfoFormat({ schema: element }));
					}

					//endregion
				} catch (err) {
					_didIteratorError17 = true;
					_iteratorError17 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion17 && _iterator17.return) {
							_iterator17.return();
						}
					} finally {
						if (_didIteratorError17) {
							throw _iteratorError17;
						}
					}
				}
			}

			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output set
				var outputArray = [];

				outputArray.push.apply(outputArray, _toConsumableArray(Array.from(this.crls, function (element) {
					return element.toSchema();
				})));

				outputArray.push.apply(outputArray, _toConsumableArray(Array.from(this.otherRevocationInfos, function (element) {
					var schema = element.toSchema();

					schema.idBlock.tagClass = 3;
					schema.idBlock.tagNumber = 1;

					return schema;
				})));
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Set({
					value: outputArray
				});
				//endregion
			}

			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					crls: Array.from(this.crls, function (element) {
						return element.toJSON();
					}),
					otherRevocationInfos: Array.from(this.otherRevocationInfos, function (element) {
						return element.toJSON();
					})
				};
			}

			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "crls":
						return [];
					case "otherRevocationInfos":
						return [];
					default:
						throw new Error("Invalid member name for RevocationInfoChoices class: " + memberName);
				}
			}

			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//RevocationInfoChoices ::= SET OF RevocationInfoChoice

				//RevocationInfoChoice ::= CHOICE {
				//    crl CertificateList,
				//    other [1] IMPLICIT OtherRevocationInfoFormat }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [crls]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Set({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.crls || "",
						value: new Choice({
							value: [CertificateRevocationList.schema(), new Constructed({
								idBlock: {
									tagClass: 3, // CONTEXT-SPECIFIC
									tagNumber: 1 // [1]
								},
								value: [new ObjectIdentifier(), new Any()]
							})]
						})
					})]
				});
			}
		}]);

		return RevocationInfoChoices;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var OriginatorInfo = function () {
		//**********************************************************************************
		/**
   * Constructor for OriginatorInfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function OriginatorInfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, OriginatorInfo);

			//region Internal properties of the object
			/**
    * @type {CertificateSet}
    * @description certs
    */
			this.certs = getParametersValue(parameters, "certs", OriginatorInfo.defaultValues("certs"));
			/**
    * @type {RevocationInfoChoices}
    * @description crls
    */
			this.crls = getParametersValue(parameters, "crls", OriginatorInfo.defaultValues("crls"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(OriginatorInfo, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, OriginatorInfo.schema({
					names: {
						certs: "certs",
						crls: "crls"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for OriginatorInfo");
				//endregion

				//region Get internal properties from parsed schema
				asn1.result.certs.idBlock.tagClass = 1; // UNIVERSAL
				asn1.result.certs.idBlock.tagNumber = 17; // SET

				this.certs = new CertificateSet({ schema: asn1.result.certs });

				asn1.result.crls.idBlock.tagClass = 1; // UNIVERSAL
				asn1.result.crls.idBlock.tagNumber = 17; // SET

				this.crls = new RevocationInfoChoices({ schema: asn1.result.crls });
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: this.certs.toSchema().valueBlock.value
					}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: this.crls.toSchema().valueBlock.value
					})]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					certs: this.certs.toJSON(),
					crls: this.crls.toJSON()
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "certs":
						return new CertificateSet();
					case "crls":
						return new RevocationInfoChoices();
					default:
						throw new Error("Invalid member name for OriginatorInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "certs":
						return memberValue.certificates.length === 0;
					case "crls":
						return memberValue.crls.length === 0 && memberValue.otherRevocationInfos.length === 0;
					default:
						throw new Error("Invalid member name for OriginatorInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//OriginatorInfo ::= SEQUENCE {
				//    certs [0] IMPLICIT CertificateSet OPTIONAL,
				//    crls [1] IMPLICIT RevocationInfoChoices OPTIONAL }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [certs]
     * @property {string} [crls]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Constructed({
						name: names.certs || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: CertificateSet.schema().valueBlock.value
					}), new Constructed({
						name: names.crls || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: RevocationInfoChoices.schema().valueBlock.value
					})]
				});
			}
		}]);

		return OriginatorInfo;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var IssuerAndSerialNumber = function () {
		//**********************************************************************************
		/**
   * Constructor for IssuerAndSerialNumber class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function IssuerAndSerialNumber() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, IssuerAndSerialNumber);

			//region Internal properties of the object
			/**
    * @type {RelativeDistinguishedNames}
    * @description issuer
    */
			this.issuer = getParametersValue(parameters, "issuer", IssuerAndSerialNumber.defaultValues("issuer"));
			/**
    * @type {Integer}
    * @description serialNumber
    */
			this.serialNumber = getParametersValue(parameters, "serialNumber", IssuerAndSerialNumber.defaultValues("serialNumber"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(IssuerAndSerialNumber, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, IssuerAndSerialNumber.schema({
					names: {
						issuer: {
							names: {
								blockName: "issuer"
							}
						},
						serialNumber: "serialNumber"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for IssuerAndSerialNumber");
				//endregion

				//region Get internal properties from parsed schema
				this.issuer = new RelativeDistinguishedNames({ schema: asn1.result.issuer });
				this.serialNumber = asn1.result.serialNumber;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [this.issuer.toSchema(), this.serialNumber]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					issuer: this.issuer.toJSON(),
					serialNumber: this.serialNumber.toJSON()
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "issuer":
						return new RelativeDistinguishedNames();
					case "serialNumber":
						return new Integer();
					default:
						throw new Error("Invalid member name for IssuerAndSerialNumber class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//IssuerAndSerialNumber ::= SEQUENCE {
				//    issuer Name,
				//    serialNumber CertificateSerialNumber }
				//
				//CertificateSerialNumber ::= INTEGER

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [issuer]
     * @property {string} [serialNumber]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [RelativeDistinguishedNames.schema(names.issuer || {}), new Integer({ name: names.serialNumber || "" })]
				});
			}
		}]);

		return IssuerAndSerialNumber;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var RecipientIdentifier = function () {
		//**********************************************************************************
		/**
   * Constructor for RecipientIdentifier class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function RecipientIdentifier() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, RecipientIdentifier);

			//region Internal properties of the object
			/**
    * @type {number}
    * @description variant
    */
			this.variant = getParametersValue(parameters, "variant", RecipientIdentifier.defaultValues("variant"));

			if ("value" in parameters)
				/**
     * @type {*}
     * @description value
     */
				this.value = getParametersValue(parameters, "value", RecipientIdentifier.defaultValues("value"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(RecipientIdentifier, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, RecipientIdentifier.schema({
					names: {
						blockName: "blockName"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for RecipientIdentifier");
				//endregion

				//region Get internal properties from parsed schema
				if (asn1.result.blockName.idBlock.tagClass === 1) {
					this.variant = 1;
					this.value = new IssuerAndSerialNumber({ schema: asn1.result.blockName });
				} else {
					this.variant = 2;
					this.value = asn1.result.blockName.valueBlock.value[0];
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				switch (this.variant) {
					case 1:
						return this.value.toSchema();
					case 2:
						return new Constructed({
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							value: [this.value]
						});
					default:
						return new Any();
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					variant: this.variant
				};

				if (this.variant === 1 || this.variant === 2) _object.value = this.value.toJSON();

				return _object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "variant":
						return -1;
					case "value":
						return {};
					default:
						throw new Error("Invalid member name for RecipientIdentifier class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "variant":
						return memberValue === -1;
					case "values":
						return Object.keys(memberValue).length === 0;
					default:
						throw new Error("Invalid member name for RecipientIdentifier class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//RecipientIdentifier ::= CHOICE {
				//    issuerAndSerialNumber IssuerAndSerialNumber,
				//    subjectKeyIdentifier [0] SubjectKeyIdentifier }
				//
				//SubjectKeyIdentifier ::= OCTET STRING

				/**
     * @type {Object}
     * @property {string} [blockName]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Choice({
					value: [IssuerAndSerialNumber.schema({
						names: {
							blockName: names.blockName || ""
						}
					}), new Constructed({
						name: names.blockName || "",
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new OctetString()]
					})]
				});
			}
		}]);

		return RecipientIdentifier;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var KeyTransRecipientInfo = function () {
		//**********************************************************************************
		/**
   * Constructor for KeyTransRecipientInfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function KeyTransRecipientInfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, KeyTransRecipientInfo);

			//region Internal properties of the object
			/**
    * @type {number}
    * @description version
    */
			this.version = getParametersValue(parameters, "version", KeyTransRecipientInfo.defaultValues("version"));
			/**
    * @type {RecipientIdentifier}
    * @description rid
    */
			this.rid = getParametersValue(parameters, "rid", KeyTransRecipientInfo.defaultValues("rid"));
			/**
    * @type {AlgorithmIdentifier}
    * @description keyEncryptionAlgorithm
    */
			this.keyEncryptionAlgorithm = getParametersValue(parameters, "keyEncryptionAlgorithm", KeyTransRecipientInfo.defaultValues("keyEncryptionAlgorithm"));
			/**
    * @type {OctetString}
    * @description encryptedKey
    */
			this.encryptedKey = getParametersValue(parameters, "encryptedKey", KeyTransRecipientInfo.defaultValues("encryptedKey"));
			/**
    * @type {Certificate}
    * @description recipientCertificate For some reasons we need to store recipient's certificate here
    */
			this.recipientCertificate = getParametersValue(parameters, "recipientCertificate", KeyTransRecipientInfo.defaultValues("recipientCertificate"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(KeyTransRecipientInfo, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, KeyTransRecipientInfo.schema({
					names: {
						version: "version",
						rid: {
							names: {
								blockName: "rid"
							}
						},
						keyEncryptionAlgorithm: {
							names: {
								blockName: "keyEncryptionAlgorithm"
							}
						},
						encryptedKey: "encryptedKey"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for KeyTransRecipientInfo");
				//endregion

				//region Get internal properties from parsed schema
				this.version = asn1.result.version.valueBlock.valueDec;

				if (asn1.result.rid.idBlock.tagClass === 3) this.rid = asn1.result.rid.valueBlock.value[0]; // SubjectKeyIdentifier
				else this.rid = new IssuerAndSerialNumber({ schema: asn1.result.rid });

				this.keyEncryptionAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.keyEncryptionAlgorithm });
				this.encryptedKey = asn1.result.encryptedKey;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence 
				var outputArray = [];

				if (this.rid instanceof IssuerAndSerialNumber) {
					this.version = 0;

					outputArray.push(new Integer({ value: this.version }));
					outputArray.push(this.rid.toSchema());
				} else {
					this.version = 2;

					outputArray.push(new Integer({ value: this.version }));
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [this.rid]
					}));
				}

				outputArray.push(this.keyEncryptionAlgorithm.toSchema());
				outputArray.push(this.encryptedKey);
				//endregion 

				//region Construct and return new ASN.1 schema for this object 
				return new Sequence({
					value: outputArray
				});
				//endregion 
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					version: this.version,
					rid: this.rid.toJSON(),
					keyEncryptionAlgorithm: this.keyEncryptionAlgorithm.toJSON(),
					encryptedKey: this.encryptedKey.toJSON()
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "version":
						return -1;
					case "rid":
						return {};
					case "keyEncryptionAlgorithm":
						return new AlgorithmIdentifier();
					case "encryptedKey":
						return new OctetString();
					case "recipientCertificate":
						return new Certificate();
					default:
						throw new Error("Invalid member name for KeyTransRecipientInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "version":
						return memberValue === KeyTransRecipientInfo.defaultValues("version");
					case "rid":
						return Object.keys(memberValue).length === 0;
					case "keyEncryptionAlgorithm":
					case "encryptedKey":
						return memberValue.isEqual(KeyTransRecipientInfo.defaultValues(memberName));
					case "recipientCertificate":
						return false; // For now we do not need to compare any values with the "recipientCertificate"
					default:
						throw new Error("Invalid member name for KeyTransRecipientInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//KeyTransRecipientInfo ::= SEQUENCE {
				//    version CMSVersion,  -- always set to 0 or 2
				//    rid RecipientIdentifier,
				//    keyEncryptionAlgorithm KeyEncryptionAlgorithmIdentifier,
				//    encryptedKey EncryptedKey }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [version]
     * @property {string} [rid]
     * @property {string} [keyEncryptionAlgorithm]
     * @property {string} [encryptedKey]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.version || "" }), RecipientIdentifier.schema(names.rid || {}), AlgorithmIdentifier.schema(names.keyEncryptionAlgorithm || {}), new OctetString({ name: names.encryptedKey || "" })]
				});
			}
		}]);

		return KeyTransRecipientInfo;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var OriginatorPublicKey = function () {
		//**********************************************************************************
		/**
   * Constructor for OriginatorPublicKey class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function OriginatorPublicKey() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, OriginatorPublicKey);

			//region Internal properties of the object
			/**
    * @type {AlgorithmIdentifier}
    * @description algorithm
    */
			this.algorithm = getParametersValue(parameters, "algorithm", OriginatorPublicKey.defaultValues("algorithm"));
			/**
    * @type {BitString}
    * @description publicKey
    */
			this.publicKey = getParametersValue(parameters, "publicKey", OriginatorPublicKey.defaultValues("publicKey"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(OriginatorPublicKey, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, OriginatorPublicKey.schema({
					names: {
						algorithm: {
							names: {
								blockName: "algorithm"
							}
						},
						publicKey: "publicKey"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for OriginatorPublicKey");
				//endregion

				//region Get internal properties from parsed schema
				this.algorithm = new AlgorithmIdentifier({ schema: asn1.result.algorithm });
				this.publicKey = asn1.result.publicKey;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [this.algorithm.toSchema(), this.publicKey]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					algorithm: this.algorithm.toJSON(),
					publicKey: this.publicKey.toJSON()
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "algorithm":
						return new AlgorithmIdentifier();
					case "publicKey":
						return new BitString();
					default:
						throw new Error("Invalid member name for OriginatorPublicKey class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "algorithm":
					case "publicKey":
						return memberValue.isEqual(OriginatorPublicKey.defaultValues(memberName));
					default:
						throw new Error("Invalid member name for OriginatorPublicKey class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//OriginatorPublicKey ::= SEQUENCE {
				//    algorithm AlgorithmIdentifier,
				//    publicKey BIT STRING }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [algorithm]
     * @property {string} [publicKey]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [AlgorithmIdentifier.schema(names.algorithm || {}), new BitString({ name: names.publicKey || "" })]
				});
			}
		}]);

		return OriginatorPublicKey;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var OriginatorIdentifierOrKey = function () {
		//**********************************************************************************
		/**
   * Constructor for OriginatorIdentifierOrKey class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function OriginatorIdentifierOrKey() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, OriginatorIdentifierOrKey);

			//region Internal properties of the object
			/**
    * @type {number}
    * @description variant
    */
			this.variant = getParametersValue(parameters, "variant", OriginatorIdentifierOrKey.defaultValues("variant"));

			if ("value" in parameters)
				/**
     * @type {Array}
     * @description values
     */
				this.value = getParametersValue(parameters, "value", OriginatorIdentifierOrKey.defaultValues("value"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(OriginatorIdentifierOrKey, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, OriginatorIdentifierOrKey.schema({
					names: {
						blockName: "blockName"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for OriginatorIdentifierOrKey");
				//endregion

				//region Get internal properties from parsed schema
				if (asn1.result.blockName.idBlock.tagClass === 1) {
					this.variant = 1;
					this.value = new IssuerAndSerialNumber({ schema: asn1.result.blockName });
				} else {
					if (asn1.result.blockName.idBlock.tagNumber === 0) {
						//region Create "OCTETSTRING" from "ASN1_PRIMITIVE"
						asn1.result.blockName.idBlock.tagClass = 1; // UNIVERSAL
						asn1.result.blockName.idBlock.tagNumber = 4; // OCTETSTRING
						//endregion

						this.variant = 2;
						this.value = asn1.result.blockName;
					} else {
						//region Create "SEQUENCE" from "ASN1_CONSTRUCTED"
						asn1.result.blockName.idBlock.tagClass = 1; // UNIVERSAL
						asn1.result.blockName.idBlock.tagNumber = 16; // SEQUENCE
						//endregion

						this.variant = 3;
						this.value = new OriginatorPublicKey({ schema: asn1.result.blockName });
					}
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				switch (this.variant) {
					case 1:
						return this.value.toSchema();
					case 2:
						this.value.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
						this.value.idBlock.tagNumber = 0; // [0]

						return this.value;
					case 3:
						{
							var _schema = this.value.toSchema();

							_schema.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
							_schema.idBlock.tagNumber = 1; // [1]

							return _schema;
						}
					default:
						return new Any();
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					variant: this.variant
				};

				if (this.variant === 1 || this.variant === 2 || this.variant === 3) _object.value = this.value.toJSON();

				return _object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "variant":
						return -1;
					case "value":
						return {};
					default:
						throw new Error("Invalid member name for OriginatorIdentifierOrKey class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "variant":
						return memberValue === -1;
					case "value":
						return Object.keys(memberValue).length === 0;
					default:
						throw new Error("Invalid member name for OriginatorIdentifierOrKey class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//OriginatorIdentifierOrKey ::= CHOICE {
				//    issuerAndSerialNumber IssuerAndSerialNumber,
				//    subjectKeyIdentifier [0] SubjectKeyIdentifier,
				//    originatorKey [1] OriginatorPublicKey }

				/**
     * @type {Object}
     * @property {string} [blockName]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Choice({
					value: [IssuerAndSerialNumber.schema({
						names: {
							blockName: names.blockName || ""
						}
					}), new Primitive({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						name: names.blockName || ""
					}), new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						name: names.blockName || "",
						value: OriginatorPublicKey.schema().valueBlock.value
					})]
				});
			}
		}]);

		return OriginatorIdentifierOrKey;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var OtherKeyAttribute = function () {
		//**********************************************************************************
		/**
   * Constructor for OtherKeyAttribute class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function OtherKeyAttribute() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, OtherKeyAttribute);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description keyAttrId
    */
			this.keyAttrId = getParametersValue(parameters, "keyAttrId", OtherKeyAttribute.defaultValues("keyAttrId"));

			if ("keyAttr" in parameters)
				/**
     * @type {*}
     * @description keyAttr
     */
				this.keyAttr = getParametersValue(parameters, "keyAttr", OtherKeyAttribute.defaultValues("keyAttr"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(OtherKeyAttribute, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, OtherKeyAttribute.schema({
					names: {
						keyAttrId: "keyAttrId",
						keyAttr: "keyAttr"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for OtherKeyAttribute");
				//endregion

				//region Get internal properties from parsed schema
				this.keyAttrId = asn1.result.keyAttrId.valueBlock.toString();

				if ("keyAttr" in asn1.result) this.keyAttr = asn1.result.keyAttr;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				outputArray.push(new ObjectIdentifier({ value: this.keyAttrId }));

				if ("keyAttr" in this) outputArray.push(this.keyAttr.toSchema());
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					keyAttrId: this.keyAttrId
				};

				if ("keyAttr" in this) _object.keyAttr = this.keyAttr.toJSON();

				return _object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "keyAttrId":
						return "";
					case "keyAttr":
						return {};
					default:
						throw new Error("Invalid member name for OtherKeyAttribute class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "keyAttrId":
						return memberValue === "";
					case "keyAttr":
						return Object.keys(memberValue).length === 0;
					default:
						throw new Error("Invalid member name for OtherKeyAttribute class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//OtherKeyAttribute ::= SEQUENCE {
				//    keyAttrId OBJECT IDENTIFIER,
				//    keyAttr ANY DEFINED BY keyAttrId OPTIONAL }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [optional]
     * @property {string} [keyAttrId]
     * @property {string} [keyAttr]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					optional: names.optional || true,
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.keyAttrId || "" }), new Any({
						optional: true,
						name: names.keyAttr || ""
					})]
				});
			}
		}]);

		return OtherKeyAttribute;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var RecipientKeyIdentifier = function () {
		//**********************************************************************************
		/**
   * Constructor for RecipientKeyIdentifier class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function RecipientKeyIdentifier() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, RecipientKeyIdentifier);

			//region Internal properties of the object
			/**
    * @type {OctetString}
    * @description subjectKeyIdentifier
    */
			this.subjectKeyIdentifier = getParametersValue(parameters, "subjectKeyIdentifier", RecipientKeyIdentifier.defaultValues("subjectKeyIdentifier"));

			if ("date" in parameters)
				/**
     * @type {GeneralizedTime}
     * @description date
     */
				this.date = getParametersValue(parameters, "date", RecipientKeyIdentifier.defaultValues("date"));

			if ("other" in parameters)
				/**
     * @type {OtherKeyAttribute}
     * @description other
     */
				this.other = getParametersValue(parameters, "other", RecipientKeyIdentifier.defaultValues("other"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(RecipientKeyIdentifier, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, RecipientKeyIdentifier.schema({
					names: {
						subjectKeyIdentifier: "subjectKeyIdentifier",
						date: "date",
						other: {
							names: {
								blockName: "other"
							}
						}
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for RecipientKeyIdentifier");
				//endregion

				//region Get internal properties from parsed schema
				this.subjectKeyIdentifier = asn1.result.subjectKeyIdentifier;

				if ("date" in asn1.result) this.date = asn1.result.date;

				if ("other" in asn1.result) this.other = new OtherKeyAttribute({ schema: asn1.result.other });
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				outputArray.push(this.subjectKeyIdentifier);

				if ("date" in this) outputArray.push(this.date);

				if ("other" in this) outputArray.push(this.other.toSchema());
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					subjectKeyIdentifier: this.subjectKeyIdentifier.toJSON()
				};

				if ("date" in this) _object.date = this.date;

				if ("other" in this) _object.other = this.other.toJSON();

				return _object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "subjectKeyIdentifier":
						return new OctetString();
					case "date":
						return new GeneralizedTime();
					case "other":
						return new OtherKeyAttribute();
					default:
						throw new Error("Invalid member name for RecipientKeyIdentifier class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "subjectKeyIdentifier":
						return memberValue.isEqual(RecipientKeyIdentifier.defaultValues("subjectKeyIdentifier"));
					case "date":
						return memberValue.year === 0 && memberValue.month === 0 && memberValue.day === 0 && memberValue.hour === 0 && memberValue.minute === 0 && memberValue.second === 0 && memberValue.millisecond === 0;
					case "other":
						return memberValue.keyAttrId === "" && "keyAttr" in memberValue === false;
					default:
						throw new Error("Invalid member name for RecipientKeyIdentifier class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//RecipientKeyIdentifier ::= SEQUENCE {
				//    subjectKeyIdentifier SubjectKeyIdentifier,
				//    date GeneralizedTime OPTIONAL,
				//    other OtherKeyAttribute OPTIONAL }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [type]
     * @property {string} [setName]
     * @property {string} [values]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new OctetString({ name: names.subjectKeyIdentifier || "" }), new GeneralizedTime({
						optional: true,
						name: names.date || ""
					}), OtherKeyAttribute.schema(names.other || {})]
				});
			}
		}]);

		return RecipientKeyIdentifier;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var KeyAgreeRecipientIdentifier = function () {
		//**********************************************************************************
		/**
   * Constructor for KeyAgreeRecipientIdentifier class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function KeyAgreeRecipientIdentifier() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, KeyAgreeRecipientIdentifier);

			//region Internal properties of the object
			/**
    * @type {number}
    * @description variant
    */
			this.variant = getParametersValue(parameters, "variant", KeyAgreeRecipientIdentifier.defaultValues("variant"));
			/**
    * @type {*}
    * @description values
    */
			this.value = getParametersValue(parameters, "value", KeyAgreeRecipientIdentifier.defaultValues("value"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(KeyAgreeRecipientIdentifier, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, KeyAgreeRecipientIdentifier.schema({
					names: {
						blockName: "blockName"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for KeyAgreeRecipientIdentifier");
				//endregion

				//region Get internal properties from parsed schema
				if (asn1.result.blockName.idBlock.tagClass === 1) {
					this.variant = 1;
					this.value = new IssuerAndSerialNumber({ schema: asn1.result.blockName });
				} else {
					this.variant = 2;

					asn1.result.blockName.idBlock.tagClass = 1; // UNIVERSAL
					asn1.result.blockName.idBlock.tagNumber = 16; // SEQUENCE

					this.value = new RecipientKeyIdentifier({ schema: asn1.result.blockName });
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				switch (this.variant) {
					case 1:
						return this.value.toSchema();
					case 2:
						return new Constructed({
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							value: this.value.toSchema().valueBlock.value
						});
					default:
						return new Any();
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					variant: this.variant
				};

				if (this.variant === 1 || this.variant === 2) _object.value = this.value.toJSON();

				return _object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "variant":
						return -1;
					case "value":
						return {};
					default:
						throw new Error("Invalid member name for KeyAgreeRecipientIdentifier class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "variant":
						return memberValue === -1;
					case "value":
						return Object.keys(memberValue).length === 0;
					default:
						throw new Error("Invalid member name for KeyAgreeRecipientIdentifier class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//KeyAgreeRecipientIdentifier ::= CHOICE {
				//    issuerAndSerialNumber IssuerAndSerialNumber,
				//    rKeyId [0] IMPLICIT RecipientKeyIdentifier }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [issuerAndSerialNumber]
     * @property {string} [rKeyId]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Choice({
					value: [IssuerAndSerialNumber.schema(names.issuerAndSerialNumber || {
						names: {
							blockName: names.blockName || ""
						}
					}), new Constructed({
						name: names.blockName || "",
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: RecipientKeyIdentifier.schema(names.rKeyId || {
							names: {
								blockName: names.blockName || ""
							}
						}).valueBlock.value
					})]
				});
			}
		}]);

		return KeyAgreeRecipientIdentifier;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var RecipientEncryptedKey = function () {
		//**********************************************************************************
		/**
   * Constructor for RecipientEncryptedKey class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function RecipientEncryptedKey() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, RecipientEncryptedKey);

			//region Internal properties of the object
			/**
    * @type {KeyAgreeRecipientIdentifier}
    * @description rid
    */
			this.rid = getParametersValue(parameters, "rid", RecipientEncryptedKey.defaultValues("rid"));
			/**
    * @type {OctetString}
    * @description encryptedKey
    */
			this.encryptedKey = getParametersValue(parameters, "encryptedKey", RecipientEncryptedKey.defaultValues("encryptedKey"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(RecipientEncryptedKey, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, RecipientEncryptedKey.schema({
					names: {
						rid: {
							names: {
								blockName: "rid"
							}
						},
						encryptedKey: "encryptedKey"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for RecipientEncryptedKey");
				//endregion

				//region Get internal properties from parsed schema
				this.rid = new KeyAgreeRecipientIdentifier({ schema: asn1.result.rid });
				this.encryptedKey = asn1.result.encryptedKey;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [this.rid.toSchema(), this.encryptedKey]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					rid: this.rid.toJSON(),
					encryptedKey: this.encryptedKey.toJSON()
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "rid":
						return new KeyAgreeRecipientIdentifier();
					case "encryptedKey":
						return new OctetString();
					default:
						throw new Error("Invalid member name for RecipientEncryptedKey class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "rid":
						return memberValue.variant === -1 && "value" in memberValue === false;
					case "encryptedKey":
						return memberValue.isEqual(RecipientEncryptedKey.defaultValues("encryptedKey"));
					default:
						throw new Error("Invalid member name for RecipientEncryptedKey class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//RecipientEncryptedKey ::= SEQUENCE {
				//    rid KeyAgreeRecipientIdentifier,
				//    encryptedKey EncryptedKey }
				//
				//EncryptedKey ::= OCTET STRING

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [rid]
     * @property {string} [encryptedKey]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [KeyAgreeRecipientIdentifier.schema(names.rid || {}), new OctetString({ name: names.encryptedKey || "" })]
				});
			}
		}]);

		return RecipientEncryptedKey;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var RecipientEncryptedKeys = function () {
		//**********************************************************************************
		/**
   * Constructor for RecipientEncryptedKeys class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function RecipientEncryptedKeys() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, RecipientEncryptedKeys);

			//region Internal properties of the object
			/**
    * @type {Array.<RecipientEncryptedKey>}
    * @description encryptedKeys
    */
			this.encryptedKeys = getParametersValue(parameters, "encryptedKeys", RecipientEncryptedKeys.defaultValues("encryptedKeys"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(RecipientEncryptedKeys, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, RecipientEncryptedKeys.schema({
					names: {
						RecipientEncryptedKeys: "RecipientEncryptedKeys"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for RecipientEncryptedKeys");
				//endregion

				//region Get internal properties from parsed schema
				this.encryptedKeys = Array.from(asn1.result.RecipientEncryptedKeys, function (element) {
					return new RecipientEncryptedKey({ schema: element });
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: Array.from(this.encryptedKeys, function (element) {
						return element.toSchema();
					})
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					encryptedKeys: Array.from(this.encryptedKeys, function (element) {
						return element.toJSON();
					})
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "encryptedKeys":
						return [];
					default:
						throw new Error("Invalid member name for RecipientEncryptedKeys class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "encryptedKeys":
						return memberValue.length === 0;
					default:
						throw new Error("Invalid member name for RecipientEncryptedKeys class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//RecipientEncryptedKeys ::= SEQUENCE OF RecipientEncryptedKey

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [RecipientEncryptedKeys]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Repeated({
						name: names.RecipientEncryptedKeys || "",
						value: RecipientEncryptedKey.schema()
					})]
				});
			}
		}]);

		return RecipientEncryptedKeys;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var KeyAgreeRecipientInfo = function () {
		//**********************************************************************************
		/**
   * Constructor for KeyAgreeRecipientInfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function KeyAgreeRecipientInfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, KeyAgreeRecipientInfo);

			//region Internal properties of the object
			/**
    * @type {number}
    * @description version
    */
			this.version = getParametersValue(parameters, "version", KeyAgreeRecipientInfo.defaultValues("version"));
			/**
    * @type {OriginatorIdentifierOrKey}
    * @description originator
    */
			this.originator = getParametersValue(parameters, "originator", KeyAgreeRecipientInfo.defaultValues("originator"));

			if ("ukm" in parameters)
				/**
     * @type {OctetString}
     * @description ukm
     */
				this.ukm = getParametersValue(parameters, "ukm", KeyAgreeRecipientInfo.defaultValues("ukm"));

			/**
    * @type {AlgorithmIdentifier}
    * @description keyEncryptionAlgorithm
    */
			this.keyEncryptionAlgorithm = getParametersValue(parameters, "keyEncryptionAlgorithm", KeyAgreeRecipientInfo.defaultValues("keyEncryptionAlgorithm"));
			/**
    * @type {RecipientEncryptedKeys}
    * @description recipientEncryptedKeys
    */
			this.recipientEncryptedKeys = getParametersValue(parameters, "recipientEncryptedKeys", KeyAgreeRecipientInfo.defaultValues("recipientEncryptedKeys"));
			/**
    * @type {Certificate}
    * @description recipientCertificate For some reasons we need to store recipient's certificate here
    */
			this.recipientCertificate = getParametersValue(parameters, "recipientCertificate", KeyAgreeRecipientInfo.defaultValues("recipientCertificate"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(KeyAgreeRecipientInfo, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, KeyAgreeRecipientInfo.schema({
					names: {
						version: "version",
						originator: {
							names: {
								blockName: "originator"
							}
						},
						ukm: "ukm",
						keyEncryptionAlgorithm: {
							names: {
								blockName: "keyEncryptionAlgorithm"
							}
						},
						recipientEncryptedKeys: {
							names: {
								blockName: "recipientEncryptedKeys"
							}
						}
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for KeyAgreeRecipientInfo");
				//endregion

				//region Get internal properties from parsed schema
				this.version = asn1.result.version.valueBlock.valueDec;
				this.originator = new OriginatorIdentifierOrKey({ schema: asn1.result.originator });

				if ("ukm" in asn1.result) this.ukm = asn1.result.ukm;

				this.keyEncryptionAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.keyEncryptionAlgorithm });
				this.recipientEncryptedKeys = new RecipientEncryptedKeys({ schema: asn1.result.recipientEncryptedKeys });
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for final sequence
				var outputArray = [];

				outputArray.push(new Integer({ value: this.version }));
				outputArray.push(new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 0 // [0]
					},
					value: [this.originator.toSchema()]
				}));

				if ("ukm" in this) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [this.ukm]
					}));
				}

				outputArray.push(this.keyEncryptionAlgorithm.toSchema());
				outputArray.push(this.recipientEncryptedKeys.toSchema());
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					version: this.version,
					originator: this.originator.toJSON()
				};

				if ("ukm" in this) _object.ukm = this.ukm.toJSON();

				_object.keyEncryptionAlgorithm = this.keyEncryptionAlgorithm.toJSON();
				_object.recipientEncryptedKeys = this.recipientEncryptedKeys.toJSON();

				return _object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "version":
						return 0;
					case "originator":
						return new OriginatorIdentifierOrKey();
					case "ukm":
						return new OctetString();
					case "keyEncryptionAlgorithm":
						return new AlgorithmIdentifier();
					case "recipientEncryptedKeys":
						return new RecipientEncryptedKeys();
					case "recipientCertificate":
						return new Certificate();
					default:
						throw new Error("Invalid member name for KeyAgreeRecipientInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "version":
						return memberValue === 0;
					case "originator":
						return memberValue.variant === -1 && "value" in memberValue === false;
					case "ukm":
						return memberValue.isEqual(KeyAgreeRecipientInfo.defaultValues("ukm"));
					case "keyEncryptionAlgorithm":
						return memberValue.algorithmId === "" && "algorithmParams" in memberValue === false;
					case "recipientEncryptedKeys":
						return memberValue.encryptedKeys.length === 0;
					case "recipientCertificate":
						return false; // For now leave it as is
					default:
						throw new Error("Invalid member name for KeyAgreeRecipientInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//KeyAgreeRecipientInfo ::= SEQUENCE {
				//    version CMSVersion,  -- always set to 3
				//    originator [0] EXPLICIT OriginatorIdentifierOrKey,
				//    ukm [1] EXPLICIT UserKeyingMaterial OPTIONAL,
				//    keyEncryptionAlgorithm KeyEncryptionAlgorithmIdentifier,
				//    recipientEncryptedKeys RecipientEncryptedKeys }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [version]
     * @property {string} [originator]
     * @property {string} [ukm]
     * @property {string} [keyEncryptionAlgorithm]
     * @property {string} [recipientEncryptedKeys]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.version || "" }), new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [OriginatorIdentifierOrKey.schema(names.originator || {})]
					}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [new OctetString({ name: names.ukm || "" })]
					}), AlgorithmIdentifier.schema(names.keyEncryptionAlgorithm || {}), RecipientEncryptedKeys.schema(names.recipientEncryptedKeys || {})]
				});
			}
		}]);

		return KeyAgreeRecipientInfo;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var KEKIdentifier = function () {
		//**********************************************************************************
		/**
   * Constructor for KEKIdentifier class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function KEKIdentifier() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, KEKIdentifier);

			//region Internal properties of the object
			/**
    * @type {OctetString}
    * @description keyIdentifier
    */
			this.keyIdentifier = getParametersValue(parameters, "keyIdentifier", KEKIdentifier.defaultValues("keyIdentifier"));

			if ("date" in parameters)
				/**
     * @type {GeneralizedTime}
     * @description date
     */
				this.date = getParametersValue(parameters, "date", KEKIdentifier.defaultValues("date"));
			if ("other" in parameters)
				/**
     * @type {OtherKeyAttribute}
     * @description other
     */
				this.other = getParametersValue(parameters, "other", KEKIdentifier.defaultValues("other"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(KEKIdentifier, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, KEKIdentifier.schema({
					names: {
						keyIdentifier: "keyIdentifier",
						date: "date",
						other: {
							names: {
								blockName: "other"
							}
						}
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for KEKIdentifier");
				//endregion

				//region Get internal properties from parsed schema
				this.keyIdentifier = asn1.result.keyIdentifier;

				if ("date" in asn1.result) this.date = asn1.result.date;

				if ("other" in asn1.result) this.other = new OtherKeyAttribute({ schema: asn1.result.other });
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				outputArray.push(this.keyIdentifier);

				if ("date" in this) outputArray.push(this.date);

				if ("other" in this) outputArray.push(this.other.toSchema());
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					keyIdentifier: this.keyIdentifier.toJSON()
				};

				if ("date" in this) _object.date = this.date;

				if ("other" in this) _object.other = this.other.toJSON();

				return _object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "keyIdentifier":
						return new OctetString();
					case "date":
						return new GeneralizedTime();
					case "other":
						return new OtherKeyAttribute();
					default:
						throw new Error("Invalid member name for KEKIdentifier class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "keyIdentifier":
						return memberValue.isEqual(KEKIdentifier.defaultValues("keyIdentifier"));
					case "date":
						return memberValue.year === 0 && memberValue.month === 0 && memberValue.day === 0 && memberValue.hour === 0 && memberValue.minute === 0 && memberValue.second === 0 && memberValue.millisecond === 0;
					case "other":
						return memberValue.compareWithDefault("keyAttrId", memberValue.keyAttrId) && "keyAttr" in memberValue === false;
					default:
						throw new Error("Invalid member name for KEKIdentifier class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//KEKIdentifier ::= SEQUENCE {
				//    keyIdentifier OCTET STRING,
				//    date GeneralizedTime OPTIONAL,
				//    other OtherKeyAttribute OPTIONAL }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [keyIdentifier]
     * @property {string} [date]
     * @property {string} [other]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new OctetString({ name: names.keyIdentifier || "" }), new GeneralizedTime({
						optional: true,
						name: names.date || ""
					}), OtherKeyAttribute.schema(names.other || {})]
				});
			}
		}]);

		return KEKIdentifier;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var KEKRecipientInfo = function () {
		//**********************************************************************************
		/**
   * Constructor for KEKRecipientInfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function KEKRecipientInfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, KEKRecipientInfo);

			//region Internal properties of the object
			/**
    * @type {number}
    * @description version
    */
			this.version = getParametersValue(parameters, "version", KEKRecipientInfo.defaultValues("version"));
			/**
    * @type {KEKIdentifier}
    * @description kekid
    */
			this.kekid = getParametersValue(parameters, "kekid", KEKRecipientInfo.defaultValues("kekid"));
			/**
    * @type {AlgorithmIdentifier}
    * @description keyEncryptionAlgorithm
    */
			this.keyEncryptionAlgorithm = getParametersValue(parameters, "keyEncryptionAlgorithm", KEKRecipientInfo.defaultValues("keyEncryptionAlgorithm"));
			/**
    * @type {OctetString}
    * @description encryptedKey
    */
			this.encryptedKey = getParametersValue(parameters, "encryptedKey", KEKRecipientInfo.defaultValues("encryptedKey"));
			/**
    * @type {ArrayBuffer}
    * @description preDefinedKEK KEK using to encrypt CEK
    */
			this.preDefinedKEK = getParametersValue(parameters, "preDefinedKEK", KEKRecipientInfo.defaultValues("preDefinedKEK"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(KEKRecipientInfo, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, KEKRecipientInfo.schema({
					names: {
						version: "version",
						kekid: {
							names: {
								blockName: "kekid"
							}
						},
						keyEncryptionAlgorithm: {
							names: {
								blockName: "keyEncryptionAlgorithm"
							}
						},
						encryptedKey: "encryptedKey"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for KEKRecipientInfo");
				//endregion

				//region Get internal properties from parsed schema
				this.version = asn1.result.version.valueBlock.valueDec;
				this.kekid = new KEKIdentifier({ schema: asn1.result.kekid });
				this.keyEncryptionAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.keyEncryptionAlgorithm });
				this.encryptedKey = asn1.result.encryptedKey;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [new Integer({ value: this.version }), this.kekid.toSchema(), this.keyEncryptionAlgorithm.toSchema(), this.encryptedKey]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					version: this.version,
					kekid: this.originator.toJSON(),
					keyEncryptionAlgorithm: this.keyEncryptionAlgorithm.toJSON(),
					encryptedKey: this.encryptedKey.toJSON()
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "version":
						return 0;
					case "kekid":
						return new KEKIdentifier();
					case "keyEncryptionAlgorithm":
						return new AlgorithmIdentifier();
					case "encryptedKey":
						return new OctetString();
					case "preDefinedKEK":
						return new ArrayBuffer(0);
					default:
						throw new Error("Invalid member name for KEKRecipientInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "KEKRecipientInfo":
						return memberValue === KEKRecipientInfo.defaultValues("version");
					case "kekid":
						return memberValue.compareWithDefault("keyIdentifier", memberValue.keyIdentifier) && "date" in memberValue === false && "other" in memberValue === false;
					case "keyEncryptionAlgorithm":
						return memberValue.algorithmId === "" && "algorithmParams" in memberValue === false;
					case "encryptedKey":
						return memberValue.isEqual(KEKRecipientInfo.defaultValues("encryptedKey"));
					case "preDefinedKEK":
						return memberValue.byteLength === 0;
					default:
						throw new Error("Invalid member name for KEKRecipientInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//KEKRecipientInfo ::= SEQUENCE {
				//    version CMSVersion,  -- always set to 4
				//    kekid KEKIdentifier,
				//    keyEncryptionAlgorithm KeyEncryptionAlgorithmIdentifier,
				//    encryptedKey EncryptedKey }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [version]
     * @property {string} [kekid]
     * @property {string} [keyEncryptionAlgorithm]
     * @property {string} [encryptedKey]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.version || "" }), KEKIdentifier.schema(names.kekid || {}), AlgorithmIdentifier.schema(names.keyEncryptionAlgorithm || {}), new OctetString({ name: names.encryptedKey || "" })]
				});
			}
		}]);

		return KEKRecipientInfo;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var PasswordRecipientinfo = function () {
		//**********************************************************************************
		/**
   * Constructor for PasswordRecipientinfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function PasswordRecipientinfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, PasswordRecipientinfo);

			//region Internal properties of the object
			/**
    * @type {number}
    * @description version
    */
			this.version = getParametersValue(parameters, "version", PasswordRecipientinfo.defaultValues("version"));

			if ("keyDerivationAlgorithm" in parameters)
				/**
     * @type {AlgorithmIdentifier}
     * @description keyDerivationAlgorithm
     */
				this.keyDerivationAlgorithm = getParametersValue(parameters, "keyDerivationAlgorithm", PasswordRecipientinfo.defaultValues("keyDerivationAlgorithm"));

			/**
    * @type {AlgorithmIdentifier}
    * @description keyEncryptionAlgorithm
    */
			this.keyEncryptionAlgorithm = getParametersValue(parameters, "keyEncryptionAlgorithm", PasswordRecipientinfo.defaultValues("keyEncryptionAlgorithm"));
			/**
    * @type {OctetString}
    * @description encryptedKey
    */
			this.encryptedKey = getParametersValue(parameters, "encryptedKey", PasswordRecipientinfo.defaultValues("encryptedKey"));
			/**
    * @type {ArrayBuffer}
    * @description password Password to derive key from
    */
			this.password = getParametersValue(parameters, "password", PasswordRecipientinfo.defaultValues("password"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(PasswordRecipientinfo, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, PasswordRecipientinfo.schema({
					names: {
						version: "version",
						keyDerivationAlgorithm: "keyDerivationAlgorithm",
						keyEncryptionAlgorithm: {
							names: {
								blockName: "keyEncryptionAlgorithm"
							}
						},
						encryptedKey: "encryptedKey"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PasswordRecipientinfo");
				//endregion

				//region Get internal properties from parsed schema
				this.version = asn1.result.version.valueBlock.valueDec;

				if ("keyDerivationAlgorithm" in asn1.result) {
					asn1.result.keyDerivationAlgorithm.idBlock.tagClass = 1; // UNIVERSAL
					asn1.result.keyDerivationAlgorithm.idBlock.tagNumber = 16; // SEQUENCE

					this.keyDerivationAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.keyDerivationAlgorithm });
				}

				this.keyEncryptionAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.keyEncryptionAlgorithm });
				this.encryptedKey = asn1.result.encryptedKey;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create output array for sequence
				var outputArray = [];

				outputArray.push(new Integer({ value: this.version }));

				if ("keyDerivationAlgorithm" in this) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: this.keyDerivationAlgorithm.toSchema().valueBlock.value
					}));
				}

				outputArray.push(this.keyEncryptionAlgorithm.toSchema());
				outputArray.push(this.encryptedKey);
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				return {
					version: this.version,
					keyDerivationAlgorithm: this.keyDerivationAlgorithm.toJSON(),
					keyEncryptionAlgorithm: this.keyEncryptionAlgorithm.toJSON(),
					encryptedKey: this.encryptedKey.toJSON()
				};
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "version":
						return -1;
					case "keyDerivationAlgorithm":
						return new AlgorithmIdentifier();
					case "keyEncryptionAlgorithm":
						return new AlgorithmIdentifier();
					case "encryptedKey":
						return new OctetString();
					case "password":
						return new ArrayBuffer(0);
					default:
						throw new Error("Invalid member name for PasswordRecipientinfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "version":
						return memberValue === -1;
					case "keyDerivationAlgorithm":
					case "keyEncryptionAlgorithm":
						return memberValue.algorithmId === "" && "algorithmParams" in memberValue === false;
					case "encryptedKey":
						return memberValue.isEqual(PasswordRecipientinfo.defaultValues("encryptedKey"));
					case "password":
						return memberValue.byteLength === 0;
					default:
						throw new Error("Invalid member name for PasswordRecipientinfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//PasswordRecipientInfo ::= SEQUENCE {
				//    version CMSVersion,   -- Always set to 0
				//    keyDerivationAlgorithm [0] KeyDerivationAlgorithmIdentifier OPTIONAL,
				//    keyEncryptionAlgorithm KeyEncryptionAlgorithmIdentifier,
				//    encryptedKey EncryptedKey }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [keyDerivationAlgorithm]
     * @property {string} [keyEncryptionAlgorithm]
     * @property {string} [encryptedKey]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.version || "" }), new Constructed({
						name: names.keyDerivationAlgorithm || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: AlgorithmIdentifier.schema().valueBlock.value
					}), AlgorithmIdentifier.schema(names.keyEncryptionAlgorithm || {}), new OctetString({ name: names.encryptedKey || "" })]
				});
			}
		}]);

		return PasswordRecipientinfo;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var OtherRecipientInfo = function () {
		//**********************************************************************************
		/**
   * Constructor for OtherRecipientInfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function OtherRecipientInfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, OtherRecipientInfo);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description oriType
    */
			this.oriType = getParametersValue(parameters, "oriType", OtherRecipientInfo.defaultValues("oriType"));
			/**
    * @type {*}
    * @description oriValue
    */
			this.oriValue = getParametersValue(parameters, "oriValue", OtherRecipientInfo.defaultValues("oriValue"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(OtherRecipientInfo, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, OtherRecipientInfo.schema({
					names: {
						oriType: "oriType",
						oriValue: "oriValue"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for OtherRecipientInfo");
				//endregion

				//region Get internal properties from parsed schema
				this.oriType = asn1.result.oriType.valueBlock.toString();
				this.oriValue = asn1.result.oriValue;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [new ObjectIdentifier({ value: this.oriType }), this.oriValue]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					oriType: this.oriType
				};

				if (OtherRecipientInfo.compareWithDefault("oriValue", this.oriValue) === false) _object.oriValue = this.oriValue.toJSON();

				return _object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "oriType":
						return "";
					case "oriValue":
						return {};
					default:
						throw new Error("Invalid member name for OtherRecipientInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "oriType":
						return memberValue === "";
					case "oriValue":
						return Object.keys(memberValue).length === 0;
					default:
						throw new Error("Invalid member name for OtherRecipientInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//OtherRecipientInfo ::= SEQUENCE {
				//    oriType OBJECT IDENTIFIER,
				//    oriValue ANY DEFINED BY oriType }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [oriType]
     * @property {string} [oriValue]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.oriType || "" }), new Any({ name: names.oriValue || "" })]
				});
			}
		}]);

		return OtherRecipientInfo;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var RecipientInfo = function () {
		//**********************************************************************************
		/**
   * Constructor for RecipientInfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function RecipientInfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, RecipientInfo);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description variant
    */
			this.variant = getParametersValue(parameters, "variant", RecipientInfo.defaultValues("variant"));

			if ("value" in parameters)
				/**
     * @type {*}
     * @description value
     */
				this.value = getParametersValue(parameters, "value", RecipientInfo.defaultValues("value"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(RecipientInfo, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, RecipientInfo.schema({
					names: {
						blockName: "blockName"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for CMS_RECIPIENT_INFO");
				//endregion

				//region Get internal properties from parsed schema
				if (asn1.result.blockName.idBlock.tagClass === 1) {
					this.variant = 1;
					this.value = new KeyTransRecipientInfo({ schema: asn1.result.blockName });
				} else {
					//region Create "SEQUENCE" from "ASN1_CONSTRUCTED"
					var tagNumber = asn1.result.blockName.idBlock.tagNumber;

					asn1.result.blockName.idBlock.tagClass = 1; // UNIVERSAL
					asn1.result.blockName.idBlock.tagNumber = 16; // SEQUENCE
					//endregion

					switch (tagNumber) {
						case 1:
							this.variant = 2;
							this.value = new KeyAgreeRecipientInfo({ schema: asn1.result.blockName });
							break;
						case 2:
							this.variant = 3;
							this.value = new KEKRecipientInfo({ schema: asn1.result.blockName });
							break;
						case 3:
							this.variant = 4;
							this.value = new PasswordRecipientinfo({ schema: asn1.result.blockName });
							break;
						case 4:
							this.variant = 5;
							this.value = new OtherRecipientInfo({ schema: asn1.result.blockName });
							break;
						default:
							throw new Error("Incorrect structure of RecipientInfo block");
					}
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				var _schema = this.value.toSchema();

				switch (this.variant) {
					case 1:
						return _schema;
					case 2:
					case 3:
					case 4:
						//region Create "ASN1_CONSTRUCTED" from "SEQUENCE"
						_schema.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
						_schema.idBlock.tagNumber = this.variant - 1;
						//endregion

						return _schema;
					default:
						return new Any();
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					variant: this.variant
				};

				if (this.variant >= 1 && this.variant <= 4) _object.value = this.value.toJSON();

				return _object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "variant":
						return -1;
					case "value":
						return {};
					default:
						throw new Error("Invalid member name for RecipientInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "variant":
						return memberValue === RecipientInfo.defaultValues(memberName);
					case "value":
						return Object.keys(memberValue).length === 0;
					default:
						throw new Error("Invalid member name for RecipientInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//RecipientInfo ::= CHOICE {
				//    ktri KeyTransRecipientInfo,
				//    kari [1] KeyAgreeRecipientInfo,
				//    kekri [2] KEKRecipientInfo,
				//    pwri [3] PasswordRecipientinfo,
				//    ori [4] OtherRecipientInfo }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [type]
     * @property {string} [setName]
     * @property {string} [values]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Choice({
					value: [KeyTransRecipientInfo.schema({
						names: {
							blockName: names.blockName || ""
						}
					}), new Constructed({
						name: names.blockName || "",
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: KeyAgreeRecipientInfo.schema().valueBlock.value
					}), new Constructed({
						name: names.blockName || "",
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						},
						value: KEKRecipientInfo.schema().valueBlock.value
					}), new Constructed({
						name: names.blockName || "",
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 3 // [3]
						},
						value: PasswordRecipientinfo.schema().valueBlock.value
					}), new Constructed({
						name: names.blockName || "",
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 4 // [4]
						},
						value: OtherRecipientInfo.schema().valueBlock.value
					})]
				});
			}
		}]);

		return RecipientInfo;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var EncryptedContentInfo = function () {
		//**********************************************************************************
		/**
   * Constructor for EncryptedContentInfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function EncryptedContentInfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, EncryptedContentInfo);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description contentType
    */
			this.contentType = getParametersValue(parameters, "contentType", EncryptedContentInfo.defaultValues("contentType"));
			/**
    * @type {AlgorithmIdentifier}
    * @description contentEncryptionAlgorithm
    */
			this.contentEncryptionAlgorithm = getParametersValue(parameters, "contentEncryptionAlgorithm", EncryptedContentInfo.defaultValues("contentEncryptionAlgorithm"));

			if ("encryptedContent" in parameters) {
				/**
     * @type {OctetString}
     * @description encryptedContent (!!!) could be contructive or primitive value (!!!)
     */
				this.encryptedContent = parameters.encryptedContent;

				if (this.encryptedContent.idBlock.tagClass === 1 && this.encryptedContent.idBlock.tagNumber === 4) {
					//region Divide OCTETSTRING value down to small pieces
					if (this.encryptedContent.idBlock.isConstructed === false) {
						var constrString = new OctetString({
							idBlock: { isConstructed: true },
							isConstructed: true
						});

						var offset = 0;
						var length = this.encryptedContent.valueBlock.valueHex.byteLength;

						while (length > 0) {
							var pieceView = new Uint8Array(this.encryptedContent.valueBlock.valueHex, offset, offset + 1024 > this.encryptedContent.valueBlock.valueHex.byteLength ? this.encryptedContent.valueBlock.valueHex.byteLength - offset : 1024);
							var _array = new ArrayBuffer(pieceView.length);
							var _view = new Uint8Array(_array);

							for (var i = 0; i < _view.length; i++) {
								_view[i] = pieceView[i];
							}constrString.valueBlock.value.push(new OctetString({ valueHex: _array }));

							length -= pieceView.length;
							offset += pieceView.length;
						}

						this.encryptedContent = constrString;
					}
					//endregion
				}
			}
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(EncryptedContentInfo, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, EncryptedContentInfo.schema({
					names: {
						contentType: "contentType",
						contentEncryptionAlgorithm: {
							names: {
								blockName: "contentEncryptionAlgorithm"
							}
						},
						encryptedContent: "encryptedContent"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for EncryptedContentInfo");
				//endregion

				//region Get internal properties from parsed schema
				this.contentType = asn1.result.contentType.valueBlock.toString();
				this.contentEncryptionAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.contentEncryptionAlgorithm });

				if ("encryptedContent" in asn1.result) {
					this.encryptedContent = asn1.result.encryptedContent;

					this.encryptedContent.idBlock.tagClass = 1; // UNIVERSAL
					this.encryptedContent.idBlock.tagNumber = 4; // OCTETSTRING (!!!) The value still has instance of "in_window.org.pkijs.asn1.ASN1_CONSTRUCTED / ASN1_PRIMITIVE"
				}
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var sequenceLengthBlock = {
					isIndefiniteForm: false
				};

				var outputArray = [];

				outputArray.push(new ObjectIdentifier({ value: this.contentType }));
				outputArray.push(this.contentEncryptionAlgorithm.toSchema());

				if ("encryptedContent" in this) {
					sequenceLengthBlock.isIndefiniteForm = this.encryptedContent.idBlock.isConstructed;

					var encryptedValue = this.encryptedContent;

					encryptedValue.idBlock.tagClass = 3; // CONTEXT-SPECIFIC
					encryptedValue.idBlock.tagNumber = 0; // [0]

					encryptedValue.lenBlock.isIndefiniteForm = this.encryptedContent.idBlock.isConstructed;

					outputArray.push(encryptedValue);
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					lenBlock: sequenceLengthBlock,
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					contentType: this.contentType,
					contentEncryptionAlgorithm: this.contentEncryptionAlgorithm.toJSON()
				};

				if ("encryptedContent" in this) _object.encryptedContent = this.encryptedContent.toJSON();

				return _object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "contentType":
						return "";
					case "contentEncryptionAlgorithm":
						return new AlgorithmIdentifier();
					case "encryptedContent":
						return new OctetString();
					default:
						throw new Error("Invalid member name for EncryptedContentInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "contentType":
						return memberValue === "";
					case "contentEncryptionAlgorithm":
						return memberValue.algorithmId === "" && "algorithmParams" in memberValue === false;
					case "encryptedContent":
						return memberValue.isEqual(EncryptedContentInfo.defaultValues(memberName));
					default:
						throw new Error("Invalid member name for EncryptedContentInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//EncryptedContentInfo ::= SEQUENCE {
				//    contentType ContentType,
				//    contentEncryptionAlgorithm ContentEncryptionAlgorithmIdentifier,
				//    encryptedContent [0] IMPLICIT EncryptedContent OPTIONAL }
				//
				// Comment: Strange, but modern crypto engines create "encryptedContent" as "[0] EXPLICIT EncryptedContent"
				//
				//EncryptedContent ::= OCTET STRING

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [contentType]
     * @property {string} [contentEncryptionAlgorithm]
     * @property {string} [encryptedContent]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new ObjectIdentifier({ name: names.contentType || "" }), AlgorithmIdentifier.schema(names.contentEncryptionAlgorithm || {}),
					// The CHOICE we need because "EncryptedContent" could have either "constructive"
					// or "primitive" form of encoding and we need to handle both variants
					new Choice({
						value: [new Constructed({
							name: names.encryptedContent || "",
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							},
							value: [new Repeated({
								value: new OctetString()
							})]
						}), new Primitive({
							name: names.encryptedContent || "",
							idBlock: {
								tagClass: 3, // CONTEXT-SPECIFIC
								tagNumber: 0 // [0]
							}
						})]
					})]
				});
			}
		}]);

		return EncryptedContentInfo;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC3447
  */


	var RSAESOAEPParams = function () {
		//**********************************************************************************
		/**
   * Constructor for RSAESOAEPParams class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function RSAESOAEPParams() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, RSAESOAEPParams);

			//region Internal properties of the object
			/**
    * @type {AlgorithmIdentifier}
    * @description hashAlgorithm
    */
			this.hashAlgorithm = getParametersValue(parameters, "hashAlgorithm", RSAESOAEPParams.defaultValues("hashAlgorithm"));
			/**
    * @type {AlgorithmIdentifier}
    * @description maskGenAlgorithm
    */
			this.maskGenAlgorithm = getParametersValue(parameters, "maskGenAlgorithm", RSAESOAEPParams.defaultValues("maskGenAlgorithm"));
			/**
    * @type {AlgorithmIdentifier}
    * @description pSourceAlgorithm
    */
			this.pSourceAlgorithm = getParametersValue(parameters, "pSourceAlgorithm", RSAESOAEPParams.defaultValues("pSourceAlgorithm"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(RSAESOAEPParams, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, RSAESOAEPParams.schema({
					names: {
						hashAlgorithm: {
							names: {
								blockName: "hashAlgorithm"
							}
						},
						maskGenAlgorithm: {
							names: {
								blockName: "maskGenAlgorithm"
							}
						},
						pSourceAlgorithm: {
							names: {
								blockName: "pSourceAlgorithm"
							}
						}
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for RSAESOAEPParams");
				//endregion

				//region Get internal properties from parsed schema
				if ("hashAlgorithm" in asn1.result) this.hashAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.hashAlgorithm });

				if ("maskGenAlgorithm" in asn1.result) this.maskGenAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.maskGenAlgorithm });

				if ("pSourceAlgorithm" in asn1.result) this.pSourceAlgorithm = new AlgorithmIdentifier({ schema: asn1.result.pSourceAlgorithm });
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				if (!this.hashAlgorithm.isEqual(RSAESOAEPParams.defaultValues("hashAlgorithm"))) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [this.hashAlgorithm.toSchema()]
					}));
				}

				if (!this.maskGenAlgorithm.isEqual(RSAESOAEPParams.defaultValues("maskGenAlgorithm"))) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [this.maskGenAlgorithm.toSchema()]
					}));
				}

				if (!this.pSourceAlgorithm.isEqual(RSAESOAEPParams.defaultValues("pSourceAlgorithm"))) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						},
						value: [this.pSourceAlgorithm.toSchema()]
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {};

				if (!this.hashAlgorithm.isEqual(RSAESOAEPParams.defaultValues("hashAlgorithm"))) object.hashAlgorithm = this.hashAlgorithm.toJSON();

				if (!this.maskGenAlgorithm.isEqual(RSAESOAEPParams.defaultValues("maskGenAlgorithm"))) object.maskGenAlgorithm = this.maskGenAlgorithm.toJSON();

				if (!this.pSourceAlgorithm.isEqual(RSAESOAEPParams.defaultValues("pSourceAlgorithm"))) object.pSourceAlgorithm = this.pSourceAlgorithm.toJSON();

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "hashAlgorithm":
						return new AlgorithmIdentifier({
							algorithmId: "1.3.14.3.2.26", // SHA-1
							algorithmParams: new Null()
						});
					case "maskGenAlgorithm":
						return new AlgorithmIdentifier({
							algorithmId: "1.2.840.113549.1.1.8", // MGF1
							algorithmParams: new AlgorithmIdentifier({
								algorithmId: "1.3.14.3.2.26", // SHA-1
								algorithmParams: new Null()
							}).toSchema()
						});
					case "pSourceAlgorithm":
						return new AlgorithmIdentifier({
							algorithmId: "1.2.840.113549.1.1.9", // id-pSpecified
							algorithmParams: new OctetString({ valueHex: new Uint8Array([0xda, 0x39, 0xa3, 0xee, 0x5e, 0x6b, 0x4b, 0x0d, 0x32, 0x55, 0xbf, 0xef, 0x95, 0x60, 0x18, 0x90, 0xaf, 0xd8, 0x07, 0x09]).buffer }) // SHA-1 hash of empty string
						});
					default:
						throw new Error("Invalid member name for RSAESOAEPParams class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//RSAES-OAEP-params ::= SEQUENCE {
				//    hashAlgorithm     [0] HashAlgorithm    DEFAULT sha1,
				//    maskGenAlgorithm  [1] MaskGenAlgorithm DEFAULT mgf1SHA1,
				//    pSourceAlgorithm  [2] PSourceAlgorithm DEFAULT pSpecifiedEmpty
				//}

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [hashAlgorithm]
     * @property {string} [maskGenAlgorithm]
     * @property {string} [pSourceAlgorithm]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						optional: true,
						value: [AlgorithmIdentifier.schema(names.hashAlgorithm || {})]
					}), new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						optional: true,
						value: [AlgorithmIdentifier.schema(names.maskGenAlgorithm || {})]
					}), new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						},
						optional: true,
						value: [AlgorithmIdentifier.schema(names.pSourceAlgorithm || {})]
					})]
				});
			}
		}]);

		return RSAESOAEPParams;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC2898
  */


	var PBKDF2Params = function () {
		//**********************************************************************************
		/**
   * Constructor for PBKDF2Params class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function PBKDF2Params() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, PBKDF2Params);

			//region Internal properties of the object
			/**
    * @type {Object}
    * @description salt
    */
			this.salt = getParametersValue(parameters, "salt", PBKDF2Params.defaultValues("salt"));
			/**
    * @type {number}
    * @description iterationCount
    */
			this.iterationCount = getParametersValue(parameters, "iterationCount", PBKDF2Params.defaultValues("iterationCount"));
			/**
    * @type {number}
    * @description keyLength
    */
			this.keyLength = getParametersValue(parameters, "keyLength", PBKDF2Params.defaultValues("keyLength"));
			/**
    * @type {AlgorithmIdentifier}
    * @description prf
    */
			this.prf = getParametersValue(parameters, "prf", PBKDF2Params.defaultValues("prf"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(PBKDF2Params, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, PBKDF2Params.schema({
					names: {
						saltPrimitive: "salt",
						saltConstructed: {
							names: {
								blockName: "salt"
							}
						},
						iterationCount: "iterationCount",
						keyLength: "keyLength",
						prf: {
							names: {
								blockName: "prf",
								optional: true
							}
						}
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for PBKDF2_params");
				//endregion

				//region Get internal properties from parsed schema
				this.salt = asn1.result.salt;
				this.iterationCount = asn1.result.iterationCount.valueBlock.valueDec;

				if ("keyLength" in asn1.result) this.keyLength = asn1.result.keyLength.valueBlock.valueDec;

				if ("prf" in asn1.result) this.prf = new AlgorithmIdentifier({ schema: asn1.result.prf });
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence 
				var outputArray = [];

				outputArray.push(this.salt);
				outputArray.push(new Integer({ value: this.iterationCount }));

				if (PBKDF2Params.defaultValues("keyLength") !== this.keyLength) outputArray.push(new Integer({ value: this.keyLength }));

				if (PBKDF2Params.defaultValues("prf").isEqual(this.prf) === false) outputArray.push(this.prf.toSchema());
				//endregion 

				//region Construct and return new ASN.1 schema for this object 
				return new Sequence({
					value: outputArray
				});
				//endregion 
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					salt: this.salt.toJSON(),
					iterationCount: this.iterationCount
				};

				if (PBKDF2Params.defaultValues("keyLength") !== this.keyLength) _object.keyLength = this.keyLength;

				if (PBKDF2Params.defaultValues("prf").isEqual(this.prf) === false) _object.prf = this.prf.toJSON();

				return _object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "salt":
						return {};
					case "iterationCount":
						return -1;
					case "keyLength":
						return 0;
					case "prf":
						return new AlgorithmIdentifier();
					default:
						throw new Error("Invalid member name for PBKDF2Params class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//PBKDF2-params ::= SEQUENCE {
				//    salt CHOICE {
				//        specified OCTET STRING,
				//        otherSource AlgorithmIdentifier },
				//  iterationCount INTEGER (1..MAX),
				//  keyLength INTEGER (1..MAX) OPTIONAL,
				//  prf AlgorithmIdentifier
				//    DEFAULT { algorithm hMAC-SHA1, parameters NULL } }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [saltPrimitive]
     * @property {string} [saltConstructed]
     * @property {string} [iterationCount]
     * @property {string} [keyLength]
     * @property {string} [prf]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Choice({
						value: [new OctetString({ name: names.saltPrimitive || "" }), AlgorithmIdentifier.schema(names.saltConstructed || {})]
					}), new Integer({ name: names.iterationCount || "" }), new Integer({
						name: names.keyLength || "",
						optional: true
					}), AlgorithmIdentifier.schema(names.prf || {
						names: {
							optional: true
						}
					})]
				});
			}
		}]);

		return PBKDF2Params;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC6318
  */


	var ECCCMSSharedInfo = function () {
		//**********************************************************************************
		/**
   * Constructor for ECCCMSSharedInfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function ECCCMSSharedInfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, ECCCMSSharedInfo);

			//region Internal properties of the object
			/**
    * @type {AlgorithmIdentifier}
    * @description keyInfo
    */
			this.keyInfo = getParametersValue(parameters, "keyInfo", ECCCMSSharedInfo.defaultValues("keyInfo"));

			if ("entityUInfo" in parameters)
				/**
     * @type {OctetString}
     * @description entityUInfo
     */
				this.entityUInfo = getParametersValue(parameters, "entityUInfo", ECCCMSSharedInfo.defaultValues("entityUInfo"));

			/**
    * @type {OctetString}
    * @description suppPubInfo
    */
			this.suppPubInfo = getParametersValue(parameters, "suppPubInfo", ECCCMSSharedInfo.defaultValues("suppPubInfo"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(ECCCMSSharedInfo, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, ECCCMSSharedInfo.schema({
					names: {
						keyInfo: {
							names: {
								blockName: "keyInfo"
							}
						},
						entityUInfo: "entityUInfo",
						suppPubInfo: "suppPubInfo"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for ECC_CMS_SharedInfo");
				//endregion

				//region Get internal properties from parsed schema
				this.keyInfo = new AlgorithmIdentifier({ schema: asn1.result.keyInfo });

				if ("entityUInfo" in asn1.result) this.entityUInfo = asn1.result.entityUInfo.valueBlock.value[0];

				this.suppPubInfo = asn1.result.suppPubInfo.valueBlock.value[0];
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create output array for sequence 
				var outputArray = [];

				outputArray.push(this.keyInfo.toSchema());

				if ("entityUInfo" in this) {
					outputArray.push(new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [this.entityUInfo]
					}));
				}

				outputArray.push(new Constructed({
					idBlock: {
						tagClass: 3, // CONTEXT-SPECIFIC
						tagNumber: 2 // [2]
					},
					value: [this.suppPubInfo]
				}));
				//endregion 

				//region Construct and return new ASN.1 schema for this object 
				return new Sequence({
					value: outputArray
				});
				//endregion 
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					keyInfo: this.keyInfo.toJSON()
				};

				if ("entityUInfo" in this) _object.entityUInfo = this.entityUInfo.toJSON();

				_object.suppPubInfo = this.suppPubInfo.toJSON();

				return _object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "keyInfo":
						return new AlgorithmIdentifier();
					case "entityUInfo":
						return new OctetString();
					case "suppPubInfo":
						return new OctetString();
					default:
						throw new Error("Invalid member name for ECCCMSSharedInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "keyInfo":
					case "entityUInfo":
					case "suppPubInfo":
						return memberValue.isEqual(ECCCMSSharedInfo.defaultValues(memberName));
					default:
						throw new Error("Invalid member name for ECCCMSSharedInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//ECC-CMS-SharedInfo  ::=  SEQUENCE {
				//    keyInfo      AlgorithmIdentifier,
				//    entityUInfo  [0] EXPLICIT OCTET STRING OPTIONAL,
				//    suppPubInfo  [2] EXPLICIT OCTET STRING }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [keyInfo]
     * @property {string} [entityUInfo]
     * @property {string} [suppPubInfo]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [AlgorithmIdentifier.schema(names.keyInfo || {}), new Constructed({
						name: names.entityUInfo || "",
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						optional: true,
						value: [new OctetString()]
					}), new Constructed({
						name: names.suppPubInfo || "",
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 2 // [2]
						},
						value: [new OctetString()]
					})]
				});
			}
		}]);

		return ECCCMSSharedInfo;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var EnvelopedData = function () {
		//**********************************************************************************
		/**
   * Constructor for EnvelopedData class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function EnvelopedData() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, EnvelopedData);

			//region Internal properties of the object
			/**
    * @type {number}
    * @description version
    */
			this.version = getParametersValue(parameters, "version", EnvelopedData.defaultValues("version"));

			if ("originatorInfo" in parameters)
				/**
     * @type {OriginatorInfo}
     * @description originatorInfo
     */
				this.originatorInfo = getParametersValue(parameters, "originatorInfo", EnvelopedData.defaultValues("originatorInfo"));

			/**
    * @type {Array.<RecipientInfo>}
    * @description recipientInfos
    */
			this.recipientInfos = getParametersValue(parameters, "recipientInfos", EnvelopedData.defaultValues("recipientInfos"));
			/**
    * @type {EncryptedContentInfo}
    * @description encryptedContentInfo
    */
			this.encryptedContentInfo = getParametersValue(parameters, "encryptedContentInfo", EnvelopedData.defaultValues("encryptedContentInfo"));

			if ("unprotectedAttrs" in parameters)
				/**
     * @type {Array.<Attribute>}
     * @description unprotectedAttrs
     */
				this.unprotectedAttrs = getParametersValue(parameters, "unprotectedAttrs", EnvelopedData.defaultValues("unprotectedAttrs"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}

		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(EnvelopedData, [{
			key: "fromSchema",


			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, EnvelopedData.schema({
					names: {
						version: "version",
						originatorInfo: "originatorInfo",
						recipientInfos: "recipientInfos",
						encryptedContentInfo: {
							names: {
								blockName: "encryptedContentInfo"
							}
						},
						unprotectedAttrs: "unprotectedAttrs"
					}
				}));

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for CMS_ENVELOPED_DATA");
				//endregion

				//region Get internal properties from parsed schema
				this.version = asn1.result.version.valueBlock.valueDec;

				if ("originatorInfo" in asn1.result) {
					asn1.result.originatorInfo.idBlock.tagClass = 1; // UNIVERSAL
					asn1.result.originatorInfo.idBlock.tagNumber = 16; // SEQUENCE

					this.originatorInfo = new OriginatorInfo({ schema: asn1.result.originatorInfo });
				}

				this.recipientInfos = Array.from(asn1.result.recipientInfos, function (element) {
					return new RecipientInfo({ schema: element });
				});
				this.encryptedContentInfo = new EncryptedContentInfo({ schema: asn1.result.encryptedContentInfo });

				if ("unprotectedAttrs" in asn1.result) this.unprotectedAttrs = Array.from(asn1.result.unprotectedAttrs, function (element) {
					return new Attribute({ schema: element });
				});
				//endregion
			}

			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Create array for output sequence
				var outputArray = [];

				outputArray.push(new Integer({ value: this.version }));

				if ("originatorInfo" in this) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: this.originatorInfo.toSchema().valueBlock.value
					}));
				}

				outputArray.push(new Set({
					value: Array.from(this.recipientInfos, function (element) {
						return element.toSchema();
					})
				}));

				outputArray.push(this.encryptedContentInfo.toSchema());

				if ("unprotectedAttrs" in this) {
					outputArray.push(new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: Array.from(this.unprotectedAttrs, function (element) {
							return element.toSchema();
						})
					}));
				}
				//endregion

				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: outputArray
				});
				//endregion
			}

			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var _object = {
					version: this.version
				};

				if ("originatorInfo" in this) _object.originatorInfo = this.originatorInfo.toJSON();

				_object.recipientInfos = Array.from(this.recipientInfos, function (element) {
					return element.toJSON();
				});
				_object.encryptedContentInfo = this.encryptedContentInfo.toJSON();

				if ("unprotectedAttrs" in this) _object.unprotectedAttrs = Array.from(this.unprotectedAttrs, function (element) {
					return element.toJSON();
				});

				return _object;
			}

			//**********************************************************************************
			/**
    * Helpers function for filling "RecipientInfo" based on recipient's certificate.
    * Problem with WebCrypto is that for RSA certificates we have only one option - "key transport" and
    * for ECC certificates we also have one option - "key agreement". As soon as Google will implement
    * DH algorithm it would be possible to use "key agreement" also for RSA certificates.
    * @param {Certificate} [certificate] Recipient's certificate
    * @param {Object} [parameters] Additional parameters neccessary for "fine tunning" of encryption process
    * @param {number} [variant] Variant = 1 is for "key transport", variant = 2 is for "key agreement". In fact the "variant" is unneccessary now because Google has no DH algorithm implementation. Thus key encryption scheme would be choosen by certificate type only: "key transport" for RSA and "key agreement" for ECC certificates.
    */

		}, {
			key: "addRecipientByCertificate",
			value: function addRecipientByCertificate(certificate, parameters, variant) {
				//region Initial variables 
				var encryptionParameters = parameters || {};
				//endregion 

				//region Check type of certificate
				if (certificate.subjectPublicKeyInfo.algorithm.algorithmId.indexOf("1.2.840.113549") !== -1) variant = 1; // For the moment it is the only variant for RSA-based certificates
				else {
						if (certificate.subjectPublicKeyInfo.algorithm.algorithmId.indexOf("1.2.840.10045") !== -1) variant = 2; // For the moment it is the only variant for ECC-based certificates
						else throw new Error("Unknown type of certificate's public key: " + certificate.subjectPublicKeyInfo.algorithm.algorithmId);
					}
				//endregion 

				//region Initialize encryption parameters 
				if ("oaepHashAlgorithm" in encryptionParameters === false) encryptionParameters.oaepHashAlgorithm = "SHA-512";

				if ("kdfAlgorithm" in encryptionParameters === false) encryptionParameters.kdfAlgorithm = "SHA-512";

				if ("kekEncryptionLength" in encryptionParameters === false) encryptionParameters.kekEncryptionLength = 256;
				//endregion 

				//region Add new "recipient" depends on "variant" and certificate type 
				switch (variant) {
					case 1:
						// Key transport scheme
						{
							//region keyEncryptionAlgorithm
							var oaepOID = getOIDByAlgorithm({
								name: "RSA-OAEP"
							});
							if (oaepOID === "") throw new Error("Can not find OID for OAEP");
							//endregion

							//region RSAES-OAEP-params
							var hashOID = getOIDByAlgorithm({
								name: encryptionParameters.oaepHashAlgorithm
							});
							if (hashOID === "") throw new Error("Unknown OAEP hash algorithm: " + encryptionParameters.oaepHashAlgorithm);

							var hashAlgorithm = new AlgorithmIdentifier({
								algorithmId: hashOID,
								algorithmParams: new Null()
							});

							var rsaOAEPParams = new RSAESOAEPParams({
								hashAlgorithm: hashAlgorithm,
								maskGenAlgorithm: new AlgorithmIdentifier({
									algorithmId: "1.2.840.113549.1.1.8", // id-mgf1
									algorithmParams: hashAlgorithm.toSchema()
								})
							});
							//endregion

							//region KeyTransRecipientInfo
							var keyInfo = new KeyTransRecipientInfo({
								version: 0,
								rid: new IssuerAndSerialNumber({
									issuer: certificate.issuer,
									serialNumber: certificate.serialNumber
								}),
								keyEncryptionAlgorithm: new AlgorithmIdentifier({
									algorithmId: oaepOID,
									algorithmParams: rsaOAEPParams.toSchema()
								}),
								recipientCertificate: certificate
								// "encryptedKey" will be calculated in "encrypt" function
							});
							//endregion

							//region Final values for "CMS_ENVELOPED_DATA"
							this.recipientInfos.push(new RecipientInfo({
								variant: 1,
								value: keyInfo
							}));
							//endregion
						}
						break;
					case 2:
						// Key agreement scheme
						{
							//region RecipientEncryptedKey
							var encryptedKey = new RecipientEncryptedKey({
								rid: new KeyAgreeRecipientIdentifier({
									variant: 1,
									value: new IssuerAndSerialNumber({
										issuer: certificate.issuer,
										serialNumber: certificate.serialNumber
									})
								})
								// "encryptedKey" will be calculated in "encrypt" function
							});
							//endregion

							//region keyEncryptionAlgorithm
							var aesKWoid = getOIDByAlgorithm({
								name: "AES-KW",
								length: encryptionParameters.kekEncryptionLength
							});
							if (aesKWoid === "") throw new Error("Unknown length for key encryption algorithm: " + encryptionParameters.kekEncryptionLength);

							var aesKW = new AlgorithmIdentifier({
								algorithmId: aesKWoid,
								algorithmParams: new Null()
							});
							//endregion

							//region KeyAgreeRecipientInfo
							var ecdhOID = getOIDByAlgorithm({
								name: "ECDH",
								kdf: encryptionParameters.kdfAlgorithm
							});
							if (ecdhOID === "") throw new Error("Unknown KDF algorithm: " + encryptionParameters.kdfAlgorithm);

							// In fact there is no need in so long UKM, but RFC2631
							// has requirement that "UserKeyMaterial" must be 512 bits long
							var ukmBuffer = new ArrayBuffer(64);
							var ukmView = new Uint8Array(ukmBuffer);
							getRandomValues(ukmView); // Generate random values in 64 bytes long buffer

							var _keyInfo = new KeyAgreeRecipientInfo({
								version: 3,
								// "originator" will be calculated in "encrypt" function because ephemeral key would be generated there
								ukm: new OctetString({ valueHex: ukmBuffer }),
								keyEncryptionAlgorithm: new AlgorithmIdentifier({
									algorithmId: ecdhOID,
									algorithmParams: aesKW.toSchema()
								}),
								recipientEncryptedKeys: new RecipientEncryptedKeys({
									encryptedKeys: [encryptedKey]
								}),
								recipientCertificate: certificate
							});
							//endregion

							//region Final values for "CMS_ENVELOPED_DATA"
							this.recipientInfos.push(new RecipientInfo({
								variant: 2,
								value: _keyInfo
							}));
							//endregion
						}
						break;
					default:
						throw new Error("Unknown \"variant\" value: " + variant);
				}
				//endregion 

				return true;
			}

			//**********************************************************************************
			/**
    * Add recipient based on pre-defined data like password or KEK
    * @param {ArrayBuffer} preDefinedData ArrayBuffer with pre-defined data
    * @param {Object} parameters Additional parameters neccessary for "fine tunning" of encryption process
    * @param {number} variant Variant = 1 for pre-defined "key encryption key" (KEK). Variant = 2 for password-based encryption.
    */

		}, {
			key: "addRecipientByPreDefinedData",
			value: function addRecipientByPreDefinedData(preDefinedData, parameters, variant) {
				//region Initial variables
				var encryptionParameters = parameters || {};
				//endregion

				//region Check initial parameters
				if (preDefinedData instanceof ArrayBuffer === false) throw new Error("Please pass \"preDefinedData\" in ArrayBuffer type");

				if (preDefinedData.byteLength === 0) throw new Error("Pre-defined data could have zero length");
				//endregion

				//region Initialize encryption parameters
				if ("keyIdentifier" in encryptionParameters === false) {
					var keyIdentifierBuffer = new ArrayBuffer(16);
					var keyIdentifierView = new Uint8Array(keyIdentifierBuffer);
					getRandomValues(keyIdentifierView);

					encryptionParameters.keyIdentifier = keyIdentifierBuffer;
				}

				if ("hmacHashAlgorithm" in encryptionParameters === false) encryptionParameters.hmacHashAlgorithm = "SHA-512";

				if ("iterationCount" in encryptionParameters === false) encryptionParameters.iterationCount = 2048;

				if ("keyEncryptionAlgorithm" in encryptionParameters === false) {
					encryptionParameters.keyEncryptionAlgorithm = {
						name: "AES-KW",
						length: 256
					};
				}

				if ("keyEncryptionAlgorithmParams" in encryptionParameters === false) encryptionParameters.keyEncryptionAlgorithmParams = new Null();
				//endregion

				//region Add new recipient based on passed variant
				switch (variant) {
					case 1:
						// KEKRecipientInfo
						{
							//region keyEncryptionAlgorithm
							var kekOID = getOIDByAlgorithm(encryptionParameters.keyEncryptionAlgorithm);
							if (kekOID === "") throw new Error("Incorrect value for \"keyEncryptionAlgorithm\"");
							//endregion

							//region KEKRecipientInfo
							var keyInfo = new KEKRecipientInfo({
								version: 4,
								kekid: new KEKIdentifier({
									keyIdentifier: new OctetString({ valueHex: encryptionParameters.keyIdentifier })
								}),
								keyEncryptionAlgorithm: new AlgorithmIdentifier({
									algorithmId: kekOID,
									/*
          For AES-KW params are NULL, but for other algorithm could another situation.
          */
									algorithmParams: encryptionParameters.keyEncryptionAlgorithmParams
								}),
								preDefinedKEK: preDefinedData
								// "encryptedKey" would be set in "ecrypt" function
							});
							//endregion

							//region Final values for "CMS_ENVELOPED_DATA"
							this.recipientInfos.push(new RecipientInfo({
								variant: 3,
								value: keyInfo
							}));
							//endregion
						}
						break;
					case 2:
						// PasswordRecipientinfo
						{
							//region keyDerivationAlgorithm
							var pbkdf2OID = getOIDByAlgorithm({
								name: "PBKDF2"
							});
							if (pbkdf2OID === "") throw new Error("Can not find OID for PBKDF2");
							//endregion

							//region Salt
							var saltBuffer = new ArrayBuffer(64);
							var saltView = new Uint8Array(saltBuffer);
							getRandomValues(saltView);
							//endregion

							//region HMAC-based algorithm
							var hmacOID = getOIDByAlgorithm({
								name: "HMAC",
								hash: {
									name: encryptionParameters.hmacHashAlgorithm
								}
							});
							if (hmacOID === "") throw new Error("Incorrect value for \"hmacHashAlgorithm\": " + encryptionParameters.hmacHashAlgorithm);
							//endregion

							//region PBKDF2-params
							var pbkdf2Params = new PBKDF2Params({
								salt: new OctetString({ valueHex: saltBuffer }),
								iterationCount: encryptionParameters.iterationCount,
								prf: new AlgorithmIdentifier({
									algorithmId: hmacOID,
									algorithmParams: new Null()
								})
							});
							//endregion

							//region keyEncryptionAlgorithm
							var _kekOID = getOIDByAlgorithm(encryptionParameters.keyEncryptionAlgorithm);
							if (_kekOID === "") throw new Error("Incorrect value for \"keyEncryptionAlgorithm\"");
							//endregion

							//region PasswordRecipientinfo
							var _keyInfo2 = new PasswordRecipientinfo({
								version: 0,
								keyDerivationAlgorithm: new AlgorithmIdentifier({
									algorithmId: pbkdf2OID,
									algorithmParams: pbkdf2Params.toSchema()
								}),
								keyEncryptionAlgorithm: new AlgorithmIdentifier({
									algorithmId: _kekOID,
									/*
          For AES-KW params are NULL, but for other algorithm could be another situation.
          */
									algorithmParams: encryptionParameters.keyEncryptionAlgorithmParams
								}),
								password: preDefinedData
								// "encryptedKey" would be set in "ecrypt" function
							});
							//endregion

							//region Final values for "CMS_ENVELOPED_DATA"
							this.recipientInfos.push(new RecipientInfo({
								variant: 4,
								value: _keyInfo2
							}));
							//endregion
						}
						break;
					default:
						throw new Error("Unknown value for \"variant\": " + variant);
				}
				//endregion
			}

			//**********************************************************************************
			/**
    * Create a new CMS Enveloped Data content with encrypted data
    * @param {Object} contentEncryptionAlgorithm WebCrypto algorithm. For the moment here could be only "AES-CBC" or "AES-GCM" algorithms.
    * @param {ArrayBuffer} contentToEncrypt Content to encrypt
    * @returns {Promise}
    */

		}, {
			key: "encrypt",
			value: function encrypt(contentEncryptionAlgorithm, contentToEncrypt) {
				var _this57 = this;

				//region Initial variables
				var sequence = Promise.resolve();

				var ivBuffer = new ArrayBuffer(16); // For AES we need IV 16 bytes long
				var ivView = new Uint8Array(ivBuffer);
				getRandomValues(ivView);

				var contentView = new Uint8Array(contentToEncrypt);

				var sessionKey = void 0;
				var encryptedContent = void 0;
				var exportedSessionKey = void 0;

				var recipientsPromises = [];

				var _this = this;
				//endregion

				//region Check for input parameters
				var contentEncryptionOID = getOIDByAlgorithm(contentEncryptionAlgorithm);
				if (contentEncryptionOID === "") return Promise.reject("Wrong \"contentEncryptionAlgorithm\" value");
				//endregion

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				//region Generate new content encryption key
				sequence = sequence.then(function () {
					return crypto.generateKey(contentEncryptionAlgorithm, true, ["encrypt"]);
				});
				//endregion
				//region Encrypt content
				sequence = sequence.then(function (result) {
					sessionKey = result;

					return crypto.encrypt({
						name: contentEncryptionAlgorithm.name,
						iv: ivView
					}, sessionKey, contentView);
				}, function (error) {
					return Promise.reject(error);
				});
				//endregion
				//region Export raw content of content encryption key
				sequence = sequence.then(function (result) {
					//region Create output OCTETSTRING with encrypted content
					encryptedContent = result;
					//endregion

					return crypto.exportKey("raw", sessionKey);
				}, function (error) {
					return Promise.reject(error);
				}).then(function (result) {
					exportedSessionKey = result;

					return true;
				}, function (error) {
					return Promise.reject(error);
				});
				//endregion
				//region Append common information to CMS_ENVELOPED_DATA
				sequence = sequence.then(function () {
					_this57.version = 2;
					_this57.encryptedContentInfo = new EncryptedContentInfo({
						contentType: "1.2.840.113549.1.7.1", // "data"
						contentEncryptionAlgorithm: new AlgorithmIdentifier({
							algorithmId: contentEncryptionOID,
							algorithmParams: new OctetString({ valueHex: ivBuffer })
						}),
						encryptedContent: new OctetString({ valueHex: encryptedContent })
					});
				}, function (error) {
					return Promise.reject(error);
				});
				//endregion

				//region Special sub-functions to work with each recipient's type
				function SubKeyAgreeRecipientInfo(index) {
					//region Initial variables
					var currentSequence = Promise.resolve();

					var ecdhPublicKey = void 0;
					var ecdhPrivateKey = void 0;

					var recipientCurve = void 0;
					var recipientCurveLength = void 0;

					var exportedECDHPublicKey = void 0;
					//endregion

					//region Get "namedCurve" parameter from recipient's certificate
					currentSequence = currentSequence.then(function () {
						var curveObject = _this.recipientInfos[index].value.recipientCertificate.subjectPublicKeyInfo.algorithm.algorithmParams;

						if (curveObject instanceof ObjectIdentifier === false) return Promise.reject("Incorrect \"recipientCertificate\" for index " + index);

						var curveOID = curveObject.valueBlock.toString();

						switch (curveOID) {
							case "1.2.840.10045.3.1.7":
								recipientCurve = "P-256";
								recipientCurveLength = 256;
								break;
							case "1.3.132.0.34":
								recipientCurve = "P-384";
								recipientCurveLength = 384;
								break;
							case "1.3.132.0.35":
								recipientCurve = "P-521";
								recipientCurveLength = 528;
								break;
							default:
								return Promise.reject("Incorrect curve OID for index " + index);
						}

						return recipientCurve;
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Generate ephemeral ECDH key
					currentSequence = currentSequence.then(function (result) {
						return crypto.generateKey({
							name: "ECDH",
							namedCurve: result
						}, true, ["deriveBits"]);
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Export public key of ephemeral ECDH key pair
					currentSequence = currentSequence.then(function (result) {
						ecdhPublicKey = result.publicKey;
						ecdhPrivateKey = result.privateKey;

						return crypto.exportKey("spki", ecdhPublicKey);
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Import recipient's public key
					currentSequence = currentSequence.then(function (result) {
						exportedECDHPublicKey = result;

						return _this.recipientInfos[index].value.recipientCertificate.getPublicKey({
							algorithm: {
								algorithm: {
									name: "ECDH",
									namedCurve: recipientCurve
								},
								usages: []
							}
						});
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Create shared secret
					currentSequence = currentSequence.then(function (result) {
						return crypto.deriveBits({
							name: "ECDH",
							public: result
						}, ecdhPrivateKey, recipientCurveLength);
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Apply KDF function to shared secret
					currentSequence = currentSequence.then(function (result) {
						//region Get length of used AES-KW algorithm
						var aesKWAlgorithm = new AlgorithmIdentifier({ schema: _this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmParams });

						var KWalgorithm = getAlgorithmByOID(aesKWAlgorithm.algorithmId);
						if ("name" in KWalgorithm === false) return Promise.reject("Incorrect OID for key encryption algorithm: " + aesKWAlgorithm.algorithmId);
						//endregion

						//region Translate AES-KW length to ArrayBuffer
						var kwLength = KWalgorithm.length;

						var kwLengthBuffer = new ArrayBuffer(4);
						var kwLengthView = new Uint8Array(kwLengthBuffer);

						for (var j = 3; j >= 0; j--) {
							kwLengthView[j] = kwLength;
							kwLength >>= 8;
						}
						//endregion

						//region Create and encode "ECC-CMS-SharedInfo" structure
						var eccInfo = new ECCCMSSharedInfo({
							keyInfo: new AlgorithmIdentifier({
								algorithmId: aesKWAlgorithm.algorithmId,
								/*
         Initially RFC5753 says that AES algorithms have absent parameters.
         But since early implementations all put NULL here. Thus, in order to be
         "backward compatible", index also put NULL here.
         */
								algorithmParams: new Null()
							}),
							entityUInfo: _this.recipientInfos[index].value.ukm,
							suppPubInfo: new OctetString({ valueHex: kwLengthBuffer })
						});

						var encodedInfo = eccInfo.toSchema().toBER(false);
						//endregion

						//region Get SHA algorithm used together with ECDH
						var ecdhAlgorithm = getAlgorithmByOID(_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
						if ("name" in ecdhAlgorithm === false) return Promise.reject("Incorrect OID for key encryption algorithm: " + _this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
						//endregion

						return kdf(ecdhAlgorithm.kdf, result, KWalgorithm.length, encodedInfo);
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Import AES-KW key from result of KDF function
					currentSequence = currentSequence.then(function (result) {
						return crypto.importKey("raw", result, { name: "AES-KW" }, true, ["wrapKey"]);
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Finally wrap session key by using AES-KW algorithm
					currentSequence = currentSequence.then(function (result) {
						return crypto.wrapKey("raw", sessionKey, result, { name: "AES-KW" });
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Append all neccessary data to current CMS_RECIPIENT_INFO object
					currentSequence = currentSequence.then(function (result) {
						//region OriginatorIdentifierOrKey
						var asn1 = fromBER(exportedECDHPublicKey);

						var originator = new OriginatorIdentifierOrKey();
						originator.variant = 3;
						originator.value = new OriginatorPublicKey({ schema: asn1.result });
						// There is option when we can stay with ECParameters, but here index prefer to avoid the params
						if ("algorithmParams" in originator.value.algorithm) delete originator.value.algorithm.algorithmParams;

						_this.recipientInfos[index].value.originator = originator;
						//endregion

						//region RecipientEncryptedKey
						/*
       We will not support using of same ephemeral key for many recipients
       */
						_this.recipientInfos[index].value.recipientEncryptedKeys.encryptedKeys[0].encryptedKey = new OctetString({ valueHex: result });
						//endregion
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion

					return currentSequence;
				}

				function SubKeyTransRecipientInfo(index) {
					//region Initial variables
					var currentSequence = Promise.resolve();
					//endregion

					//region Get recipient's public key
					currentSequence = currentSequence.then(function () {
						//region Get current used SHA algorithm
						var schema = _this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmParams;
						var rsaOAEPParams = new RSAESOAEPParams({ schema: schema });

						var hashAlgorithm = getAlgorithmByOID(rsaOAEPParams.hashAlgorithm.algorithmId);
						if ("name" in hashAlgorithm === false) return Promise.reject("Incorrect OID for hash algorithm: " + rsaOAEPParams.hashAlgorithm.algorithmId);
						//endregion

						return _this.recipientInfos[index].value.recipientCertificate.getPublicKey({
							algorithm: {
								algorithm: {
									name: "RSA-OAEP",
									hash: {
										name: hashAlgorithm.name
									}
								},
								usages: ["encrypt", "wrapKey"]
							}
						});
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Encrypt early exported session key on recipient's public key
					currentSequence = currentSequence.then(function (result) {
						return crypto.encrypt(result.algorithm, result, exportedSessionKey);
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Append all neccessary data to current CMS_RECIPIENT_INFO object
					currentSequence = currentSequence.then(function (result) {
						//region RecipientEncryptedKey
						_this.recipientInfos[index].value.encryptedKey = new OctetString({ valueHex: result });
						//endregion
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion

					return currentSequence;
				}

				function SubKEKRecipientInfo(index) {
					//region Initial variables
					var currentSequence = Promise.resolve();
					var kekAlgorithm = void 0;
					//endregion

					//region Import KEK from pre-defined data
					currentSequence = currentSequence.then(function () {
						//region Get WebCrypto form of "keyEncryptionAlgorithm"
						kekAlgorithm = getAlgorithmByOID(_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
						if ("name" in kekAlgorithm === false) return Promise.reject("Incorrect OID for \"keyEncryptionAlgorithm\": " + _this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
						//endregion

						return crypto.importKey("raw", new Uint8Array(_this.recipientInfos[index].value.preDefinedKEK), kekAlgorithm, true, ["wrapKey"]); // Too specific for AES-KW
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Wrap previously exported session key
					currentSequence = currentSequence.then(function (result) {
						return crypto.wrapKey("raw", sessionKey, result, kekAlgorithm);
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Append all neccessary data to current CMS_RECIPIENT_INFO object
					currentSequence = currentSequence.then(function (result) {
						//region RecipientEncryptedKey
						_this.recipientInfos[index].value.encryptedKey = new OctetString({ valueHex: result });
						//endregion
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion

					return currentSequence;
				}

				function SubPasswordRecipientinfo(index) {
					//region Initial variables
					var currentSequence = Promise.resolve();
					var pbkdf2Params = void 0;
					var kekAlgorithm = void 0;
					//endregion

					//region Check that we have encoded "keyDerivationAlgorithm" plus "PBKDF2_params" in there
					currentSequence = currentSequence.then(function () {
						if ("keyDerivationAlgorithm" in _this.recipientInfos[index].value === false) return Promise.reject("Please append encoded \"keyDerivationAlgorithm\"");

						if ("algorithmParams" in _this.recipientInfos[index].value.keyDerivationAlgorithm === false) return Promise.reject("Incorrectly encoded \"keyDerivationAlgorithm\"");

						try {
							pbkdf2Params = new PBKDF2Params({ schema: _this.recipientInfos[index].value.keyDerivationAlgorithm.algorithmParams });
						} catch (ex) {
							return Promise.reject("Incorrectly encoded \"keyDerivationAlgorithm\"");
						}

						return Promise.resolve();
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Derive PBKDF2 key from "password" buffer
					currentSequence = currentSequence.then(function () {
						var passwordView = new Uint8Array(_this.recipientInfos[index].value.password);

						return crypto.importKey("raw", passwordView, "PBKDF2", false, ["deriveKey"]);
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Derive key for "keyEncryptionAlgorithm"
					currentSequence = currentSequence.then(function (result) {
						//region Get WebCrypto form of "keyEncryptionAlgorithm"
						kekAlgorithm = getAlgorithmByOID(_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
						if ("name" in kekAlgorithm === false) return Promise.reject("Incorrect OID for \"keyEncryptionAlgorithm\": " + _this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
						//endregion

						//region Get HMAC hash algorithm
						var hmacHashAlgorithm = "SHA-1";

						if ("prf" in pbkdf2Params) {
							var algorithm = getAlgorithmByOID(pbkdf2Params.prf.algorithmId);
							if ("name" in algorithm === false) return Promise.reject("Incorrect OID for HMAC hash algorithm");

							hmacHashAlgorithm = algorithm.hash.name;
						}
						//endregion

						//region Get PBKDF2 "salt" value
						var saltView = new Uint8Array(pbkdf2Params.salt.valueBlock.valueHex);
						//endregion

						//region Get PBKDF2 iterations count
						var iterations = pbkdf2Params.iterationCount;
						//endregion

						return crypto.deriveKey({
							name: "PBKDF2",
							hash: {
								name: hmacHashAlgorithm
							},
							salt: saltView,
							iterations: iterations
						}, result, kekAlgorithm, true, ["wrapKey"]); // Usages are too specific for KEK algorithm
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Wrap previously exported session key (Also too specific for KEK algorithm)
					currentSequence = currentSequence.then(function (result) {
						return crypto.wrapKey("raw", sessionKey, result, kekAlgorithm);
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Append all neccessary data to current CMS_RECIPIENT_INFO object
					currentSequence = currentSequence.then(function (result) {
						//region RecipientEncryptedKey
						_this.recipientInfos[index].value.encryptedKey = new OctetString({ valueHex: result });
						//endregion
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion

					return currentSequence;
				}

				//endregion

				//region Create special routines for each "recipient"
				sequence = sequence.then(function () {
					for (var i = 0; i < _this57.recipientInfos.length; i++) {
						//region Initial variables
						var currentSequence = Promise.resolve();
						//endregion

						switch (_this57.recipientInfos[i].variant) {
							case 1:
								// KeyTransRecipientInfo
								currentSequence = SubKeyTransRecipientInfo(i);
								break;
							case 2:
								// KeyAgreeRecipientInfo
								currentSequence = SubKeyAgreeRecipientInfo(i);
								break;
							case 3:
								// KEKRecipientInfo
								currentSequence = SubKEKRecipientInfo(i);
								break;
							case 4:
								// PasswordRecipientinfo
								currentSequence = SubPasswordRecipientinfo(i);
								break;
							default:
								return Promise.reject("Uknown recipient type in array with index " + i);
						}

						recipientsPromises.push(currentSequence);
					}

					return Promise.all(recipientsPromises);
				}, function (error) {
					return Promise.reject(error);
				});
				//endregion

				return sequence;
			}

			//**********************************************************************************
			/**
    * Decrypt existing CMS Enveloped Data content
    * @param {number} recipientIndex Index of recipient
    * @param {Object} parameters Additional parameters
    * @returns {Promise}
    */

		}, {
			key: "decrypt",
			value: function decrypt(recipientIndex, parameters) {
				var _this58 = this;

				//region Initial variables
				var sequence = Promise.resolve();

				var decryptionParameters = parameters || {};

				var _this = this;
				//endregion

				//region Check for input parameters
				if (recipientIndex + 1 > this.recipientInfos.length) return Promise.reject("Maximum value for \"index\" is: " + (this.recipientInfos.length - 1));
				//endregion

				//region Get a "crypto" extension
				var crypto = getCrypto();
				if (typeof crypto === "undefined") return Promise.reject("Unable to create WebCrypto object");
				//endregion

				//region Special sub-functions to work with each recipient's type
				function SubKeyAgreeRecipientInfo(index) {
					//region Initial variables
					var currentSequence = Promise.resolve();

					var recipientCurve = void 0;
					var recipientCurveLength = void 0;

					var curveOID = void 0;

					var ecdhPrivateKey = void 0;
					//endregion

					//region Get "namedCurve" parameter from recipient's certificate
					currentSequence = currentSequence.then(function () {
						if ("recipientCertificate" in decryptionParameters === false) return Promise.reject("Parameter \"recipientCertificate\" is mandatory for \"KeyAgreeRecipientInfo\"");

						if ("recipientPrivateKey" in decryptionParameters === false) return Promise.reject("Parameter \"recipientPrivateKey\" is mandatory for \"KeyAgreeRecipientInfo\"");

						var curveObject = decryptionParameters.recipientCertificate.subjectPublicKeyInfo.algorithm.algorithmParams;

						if (curveObject instanceof ObjectIdentifier === false) return Promise.reject("Incorrect \"recipientCertificate\" for index " + index);

						curveOID = curveObject.valueBlock.toString();

						switch (curveOID) {
							case "1.2.840.10045.3.1.7":
								recipientCurve = "P-256";
								recipientCurveLength = 256;
								break;
							case "1.3.132.0.34":
								recipientCurve = "P-384";
								recipientCurveLength = 384;
								break;
							case "1.3.132.0.35":
								recipientCurve = "P-521";
								recipientCurveLength = 528;
								break;
							default:
								return Promise.reject("Incorrect curve OID for index " + index);
						}

						return crypto.importKey("pkcs8", decryptionParameters.recipientPrivateKey, {
							name: "ECDH",
							namedCurve: recipientCurve
						}, true, ["deriveBits"]);
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Import sender's ephemeral public key
					currentSequence = currentSequence.then(function (result) {
						ecdhPrivateKey = result;

						//region Change "OriginatorPublicKey" if "curve" parameter absent
						if ("algorithmParams" in _this.recipientInfos[index].value.originator.value.algorithm === false) _this.recipientInfos[index].value.originator.value.algorithm.algorithmParams = new ObjectIdentifier({ value: curveOID });
						//endregion

						//region Create ArrayBuffer with sender's public key
						var buffer = _this.recipientInfos[index].value.originator.value.toSchema().toBER(false);
						//endregion

						return crypto.importKey("spki", buffer, {
							name: "ECDH",
							namedCurve: recipientCurve
						}, true, []);
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Create shared secret
					currentSequence = currentSequence.then(function (result) {
						return crypto.deriveBits({
							name: "ECDH",
							public: result
						}, ecdhPrivateKey, recipientCurveLength);
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Apply KDF function to shared secret
					currentSequence = currentSequence.then(function (result) {
						//region Get length of used AES-KW algorithm
						var aesKWAlgorithm = new AlgorithmIdentifier({ schema: _this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmParams });

						var KWalgorithm = getAlgorithmByOID(aesKWAlgorithm.algorithmId);
						if ("name" in KWalgorithm === false) return Promise.reject("Incorrect OID for key encryption algorithm: " + aesKWAlgorithm.algorithmId);
						//endregion

						//region Translate AES-KW length to ArrayBuffer
						var kwLength = KWalgorithm.length;

						var kwLengthBuffer = new ArrayBuffer(4);
						var kwLengthView = new Uint8Array(kwLengthBuffer);

						for (var j = 3; j >= 0; j--) {
							kwLengthView[j] = kwLength;
							kwLength >>= 8;
						}
						//endregion

						//region Create and encode "ECC-CMS-SharedInfo" structure
						var eccInfo = new ECCCMSSharedInfo({
							keyInfo: new AlgorithmIdentifier({
								algorithmId: aesKWAlgorithm.algorithmId,
								/*
         Initially RFC5753 says that AES algorithms have absent parameters.
         But since early implementations all put NULL here. Thus, in order to be
         "backward compatible", index also put NULL here.
         */
								algorithmParams: new Null()
							}),
							entityUInfo: _this.recipientInfos[index].value.ukm,
							suppPubInfo: new OctetString({ valueHex: kwLengthBuffer })
						});

						var encodedInfo = eccInfo.toSchema().toBER(false);
						//endregion

						//region Get SHA algorithm used together with ECDH
						var ecdhAlgorithm = getAlgorithmByOID(_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
						if ("name" in ecdhAlgorithm === false) return Promise.reject("Incorrect OID for key encryption algorithm: " + _this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
						//endregion

						return kdf(ecdhAlgorithm.kdf, result, KWalgorithm.length, encodedInfo);
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Import AES-KW key from result of KDF function
					currentSequence = currentSequence.then(function (result) {
						return crypto.importKey("raw", result, { name: "AES-KW" }, true, ["unwrapKey"]);
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Finally unwrap session key
					currentSequence = currentSequence.then(function (result) {
						//region Get WebCrypto form of content encryption algorithm
						var contentEncryptionAlgorithm = getAlgorithmByOID(_this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId);
						if ("name" in contentEncryptionAlgorithm === false) return Promise.reject("Incorrect \"contentEncryptionAlgorithm\": " + _this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId);
						//endregion

						return crypto.unwrapKey("raw", _this.recipientInfos[index].value.recipientEncryptedKeys.encryptedKeys[0].encryptedKey.valueBlock.valueHex, result, { name: "AES-KW" }, contentEncryptionAlgorithm, true, ["decrypt"]);
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion

					return currentSequence;
				}

				function SubKeyTransRecipientInfo(index) {
					//region Initial variables
					var currentSequence = Promise.resolve();
					//endregion

					//region Import recipient's private key
					currentSequence = currentSequence.then(function () {
						if ("recipientPrivateKey" in decryptionParameters === false) return Promise.reject("Parameter \"recipientPrivateKey\" is mandatory for \"KeyTransRecipientInfo\"");

						//region Get current used SHA algorithm
						var schema = _this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmParams;
						var rsaOAEPParams = new RSAESOAEPParams({ schema: schema });

						var hashAlgorithm = getAlgorithmByOID(rsaOAEPParams.hashAlgorithm.algorithmId);
						if ("name" in hashAlgorithm === false) return Promise.reject("Incorrect OID for hash algorithm: " + rsaOAEPParams.hashAlgorithm.algorithmId);
						//endregion

						return crypto.importKey("pkcs8", decryptionParameters.recipientPrivateKey, {
							name: "RSA-OAEP",
							hash: {
								name: hashAlgorithm.name
							}
						}, true, ["decrypt"]);
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Decrypt encrypted session key
					currentSequence = currentSequence.then(function (result) {
						return crypto.decrypt(result.algorithm, result, _this.recipientInfos[index].value.encryptedKey.valueBlock.valueHex);
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Import decrypted session key
					currentSequence = currentSequence.then(function (result) {
						//region Get WebCrypto form of content encryption algorithm
						var contentEncryptionAlgorithm = getAlgorithmByOID(_this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId);
						if ("name" in contentEncryptionAlgorithm === false) return Promise.reject("Incorrect \"contentEncryptionAlgorithm\": " + _this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId);
						//endregion

						return crypto.importKey("raw", result, contentEncryptionAlgorithm, true, ["decrypt"]);
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion

					return currentSequence;
				}

				function SubKEKRecipientInfo(index) {
					//region Initial variables
					var currentSequence = Promise.resolve();
					var kekAlgorithm = void 0;
					//endregion

					//region Import KEK from pre-defined data
					currentSequence = currentSequence.then(function () {
						if ("preDefinedData" in decryptionParameters === false) return Promise.reject("Parameter \"preDefinedData\" is mandatory for \"KEKRecipientInfo\"");

						//region Get WebCrypto form of "keyEncryptionAlgorithm"
						kekAlgorithm = getAlgorithmByOID(_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
						if ("name" in kekAlgorithm === false) return Promise.reject("Incorrect OID for \"keyEncryptionAlgorithm\": " + _this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
						//endregion

						return crypto.importKey("raw", decryptionParameters.preDefinedData, kekAlgorithm, true, ["unwrapKey"]); // Too specific for AES-KW
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Unwrap previously exported session key
					currentSequence = currentSequence.then(function (result) {
						//region Get WebCrypto form of content encryption algorithm
						var contentEncryptionAlgorithm = getAlgorithmByOID(_this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId);
						if ("name" in contentEncryptionAlgorithm === false) return Promise.reject("Incorrect \"contentEncryptionAlgorithm\": " + _this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId);
						//endregion

						return crypto.unwrapKey("raw", _this.recipientInfos[index].value.encryptedKey.valueBlock.valueHex, result, kekAlgorithm, contentEncryptionAlgorithm, true, ["decrypt"]);
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion

					return currentSequence;
				}

				function SubPasswordRecipientinfo(index) {
					//region Initial variables
					var currentSequence = Promise.resolve();
					var pbkdf2Params = void 0;
					var kekAlgorithm = void 0;
					//endregion

					//region Derive PBKDF2 key from "password" buffer
					currentSequence = currentSequence.then(function () {
						if ("preDefinedData" in decryptionParameters === false) return Promise.reject("Parameter \"preDefinedData\" is mandatory for \"KEKRecipientInfo\"");

						if ("keyDerivationAlgorithm" in _this.recipientInfos[index].value === false) return Promise.reject("Please append encoded \"keyDerivationAlgorithm\"");

						if ("algorithmParams" in _this.recipientInfos[index].value.keyDerivationAlgorithm === false) return Promise.reject("Incorrectly encoded \"keyDerivationAlgorithm\"");

						try {
							pbkdf2Params = new PBKDF2Params({ schema: _this.recipientInfos[index].value.keyDerivationAlgorithm.algorithmParams });
						} catch (ex) {
							return Promise.reject("Incorrectly encoded \"keyDerivationAlgorithm\"");
						}

						return crypto.importKey("raw", decryptionParameters.preDefinedData, "PBKDF2", false, ["deriveKey"]);
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Derive key for "keyEncryptionAlgorithm"
					currentSequence = currentSequence.then(function (result) {
						//region Get WebCrypto form of "keyEncryptionAlgorithm"
						kekAlgorithm = getAlgorithmByOID(_this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
						if ("name" in kekAlgorithm === false) return Promise.reject("Incorrect OID for \"keyEncryptionAlgorithm\": " + _this.recipientInfos[index].value.keyEncryptionAlgorithm.algorithmId);
						//endregion

						//region Get HMAC hash algorithm
						var hmacHashAlgorithm = "SHA-1";

						if ("prf" in pbkdf2Params) {
							var algorithm = getAlgorithmByOID(pbkdf2Params.prf.algorithmId);
							if ("name" in algorithm === false) return Promise.reject("Incorrect OID for HMAC hash algorithm");

							hmacHashAlgorithm = algorithm.hash.name;
						}
						//endregion

						//region Get PBKDF2 "salt" value
						var saltView = new Uint8Array(pbkdf2Params.salt.valueBlock.valueHex);
						//endregion

						//region Get PBKDF2 iterations count
						var iterations = pbkdf2Params.iterationCount;
						//endregion

						return crypto.deriveKey({
							name: "PBKDF2",
							hash: {
								name: hmacHashAlgorithm
							},
							salt: saltView,
							iterations: iterations
						}, result, kekAlgorithm, true, ["unwrapKey"]); // Usages are too specific for KEK algorithm
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion
					//region Unwrap previously exported session key
					currentSequence = currentSequence.then(function (result) {
						//region Get WebCrypto form of content encryption algorithm
						var contentEncryptionAlgorithm = getAlgorithmByOID(_this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId);
						if ("name" in contentEncryptionAlgorithm === false) return Promise.reject("Incorrect \"contentEncryptionAlgorithm\": " + _this.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId);
						//endregion

						return crypto.unwrapKey("raw", _this.recipientInfos[index].value.encryptedKey.valueBlock.valueHex, result, kekAlgorithm, contentEncryptionAlgorithm, true, ["decrypt"]);
					}, function (error) {
						return Promise.reject(error);
					});
					//endregion

					return currentSequence;
				}

				//endregion

				//region Perform steps, specific to each type of session key encryption
				sequence = sequence.then(function () {
					//region Initial variables
					var currentSequence = Promise.resolve();
					//endregion

					switch (_this58.recipientInfos[recipientIndex].variant) {
						case 1:
							// KeyTransRecipientInfo
							currentSequence = SubKeyTransRecipientInfo(recipientIndex);
							break;
						case 2:
							// KeyAgreeRecipientInfo
							currentSequence = SubKeyAgreeRecipientInfo(recipientIndex);
							break;
						case 3:
							// KEKRecipientInfo
							currentSequence = SubKEKRecipientInfo(recipientIndex);
							break;
						case 4:
							// PasswordRecipientinfo
							currentSequence = SubPasswordRecipientinfo(recipientIndex);
							break;
						default:
							return Promise.reject("Uknown recipient type in array with index " + recipientIndex);
					}

					return currentSequence;
				}, function (error) {
					return Promise.reject(error);
				});
				//endregion

				//region Finally decrypt data by session key
				sequence = sequence.then(function (result) {
					//region Get WebCrypto form of content encryption algorithm
					var contentEncryptionAlgorithm = getAlgorithmByOID(_this58.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId);
					if ("name" in contentEncryptionAlgorithm === false) return Promise.reject("Incorrect \"contentEncryptionAlgorithm\": " + _this58.encryptedContentInfo.contentEncryptionAlgorithm.algorithmId);
					//endregion

					//region Get "intialization vector" for content encryption algorithm
					var ivBuffer = _this58.encryptedContentInfo.contentEncryptionAlgorithm.algorithmParams.valueBlock.valueHex;
					var ivView = new Uint8Array(ivBuffer);
					//endregion

					//region Create correct data block for decryption
					var dataBuffer = new ArrayBuffer(0);

					if (_this58.encryptedContentInfo.encryptedContent.idBlock.isConstructed === false) dataBuffer = _this58.encryptedContentInfo.encryptedContent.valueBlock.valueHex;else {
						var _iteratorNormalCompletion18 = true;
						var _didIteratorError18 = false;
						var _iteratorError18 = undefined;

						try {
							for (var _iterator18 = _this58.encryptedContentInfo.encryptedContent.valueBlock.value[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
								var content = _step18.value;

								dataBuffer = utilConcatBuf(dataBuffer, content.valueBlock.valueHex);
							}
						} catch (err) {
							_didIteratorError18 = true;
							_iteratorError18 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion18 && _iterator18.return) {
									_iterator18.return();
								}
							} finally {
								if (_didIteratorError18) {
									throw _iteratorError18;
								}
							}
						}
					}
					//endregion

					return crypto.decrypt({
						name: contentEncryptionAlgorithm.name,
						iv: ivView
					}, result, dataBuffer);
				}, function (error) {
					return Promise.reject(error);
				});
				//endregion

				return sequence;
			}

			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "version":
						return 0;
					case "originatorInfo":
						return new OriginatorInfo();
					case "recipientInfos":
						return [];
					case "encryptedContentInfo":
						return new EncryptedContentInfo();
					case "unprotectedAttrs":
						return [];
					default:
						throw new Error("Invalid member name for EnvelopedData class: " + memberName);
				}
			}

			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "version":
						return memberValue === EnvelopedData.defaultValues(memberName);
					case "originatorInfo":
						return memberValue.certs.certificates.length === 0 && memberValue.crls.crls.length === 0;
					case "recipientInfos":
					case "unprotectedAttrs":
						return memberValue.length === 0;
					case "encryptedContentInfo":
						return EncryptedContentInfo.compareWithDefault("contentType", memberValue.contentType) && EncryptedContentInfo.compareWithDefault("contentEncryptionAlgorithm", memberValue.contentEncryptionAlgorithm) && EncryptedContentInfo.compareWithDefault("encryptedContent", memberValue.encryptedContent);
					default:
						throw new Error("Invalid member name for EnvelopedData class: " + memberName);
				}
			}

			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//EnvelopedData ::= SEQUENCE {
				//    version CMSVersion,
				//    originatorInfo [0] IMPLICIT OriginatorInfo OPTIONAL,
				//    recipientInfos RecipientInfos,
				//    encryptedContentInfo EncryptedContentInfo,
				//    unprotectedAttrs [1] IMPLICIT UnprotectedAttributes OPTIONAL }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [version]
     * @property {string} [originatorInfo]
     * @property {string} [recipientInfos]
     * @property {string} [encryptedContentInfo]
     * @property {string} [unprotectedAttrs]
     */
				var names = getParametersValue(parameters, "names", {});

				return new Sequence({
					name: names.blockName || "",
					value: [new Integer({ name: names.version || "" }), new Constructed({
						name: names.originatorInfo || "",
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: OriginatorInfo.schema().valueBlock.value
					}), new Set({
						value: [new Repeated({
							name: names.recipientInfos || "",
							value: RecipientInfo.schema()
						})]
					}), EncryptedContentInfo.schema(names.encryptedContentInfo || {}), new Constructed({
						optional: true,
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 1 // [1]
						},
						value: [new Repeated({
							name: names.unprotectedAttrs || "",
							value: Attribute.schema()
						})]
					})]
				});
			}
		}]);

		return EnvelopedData;
	}();
	//**************************************************************************************

	//**************************************************************************************
	/**
  * Class from RFC5652
  */


	var ContentInfo = function () {
		//**********************************************************************************
		/**
   * Constructor for ContentInfo class
   * @param {Object} [parameters={}]
   * @property {Object} [schema] asn1js parsed value
   */
		function ContentInfo() {
			var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, ContentInfo);

			//region Internal properties of the object
			/**
    * @type {string}
    * @description contentType
    */
			this.contentType = getParametersValue(parameters, "contentType", ContentInfo.defaultValues("contentType"));
			/**
    * @type {Any}
    * @description content
    */
			this.content = getParametersValue(parameters, "content", ContentInfo.defaultValues("content"));
			//endregion

			//region If input argument array contains "schema" for this object
			if ("schema" in parameters) this.fromSchema(parameters.schema);
			//endregion
		}
		//**********************************************************************************
		/**
   * Return default values for all class members
   * @param {string} memberName String name for a class member
   */


		_createClass(ContentInfo, [{
			key: "fromSchema",

			//**********************************************************************************
			/**
    * Convert parsed asn1js object into current class
    * @param {!Object} schema
    */
			value: function fromSchema(schema) {
				//region Check the schema is valid
				var asn1 = compareSchema(schema, schema, ContentInfo.schema());

				if (asn1.verified === false) throw new Error("Object's schema was not verified against input data for CMS_CONTENT_INFO");
				//endregion

				//region Get internal properties from parsed schema
				this.contentType = asn1.result.contentType.valueBlock.toString();
				this.content = asn1.result.content;
				//endregion
			}
			//**********************************************************************************
			/**
    * Convert current object to asn1js object and set correct values
    * @returns {Object} asn1js object
    */

		}, {
			key: "toSchema",
			value: function toSchema() {
				//region Construct and return new ASN.1 schema for this object
				return new Sequence({
					value: [new ObjectIdentifier({ value: this.contentType }), new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [this.content] // EXPLICIT ANY value
					})]
				});
				//endregion
			}
			//**********************************************************************************
			/**
    * Convertion for the class to JSON object
    * @returns {Object}
    */

		}, {
			key: "toJSON",
			value: function toJSON() {
				var object = {
					contentType: this.contentType
				};

				if (!(this.content instanceof Any)) object.content = this.content.toJSON();

				return object;
			}
			//**********************************************************************************

		}], [{
			key: "defaultValues",
			value: function defaultValues(memberName) {
				switch (memberName) {
					case "contentType":
						return "";
					case "content":
						return new Any();
					default:
						throw new Error("Invalid member name for ContentInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Compare values with default values for all class members
    * @param {string} memberName String name for a class member
    * @param {*} memberValue Value to compare with default value
    */

		}, {
			key: "compareWithDefault",
			value: function compareWithDefault(memberName, memberValue) {
				switch (memberName) {
					case "contentType":
						return memberValue === "";
					case "content":
						return memberValue instanceof Any;
					default:
						throw new Error("Invalid member name for ContentInfo class: " + memberName);
				}
			}
			//**********************************************************************************
			/**
    * Return value of asn1js schema for current class
    * @param {Object} parameters Input parameters for the schema
    * @returns {Object} asn1js schema object
    */

		}, {
			key: "schema",
			value: function schema() {
				var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				//ContentInfo ::= SEQUENCE {
				//    contentType ContentType,
				//    content [0] EXPLICIT ANY DEFINED BY contentType }

				/**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [contentType]
     * @property {string} [content]
     */
				var names = getParametersValue(parameters, "names", {});

				if ("optional" in names === false) names.optional = false;

				return new Sequence({
					name: names.blockName || "ContentInfo",
					optional: names.optional,
					value: [new ObjectIdentifier({ name: names.contentType || "contentType" }), new Constructed({
						idBlock: {
							tagClass: 3, // CONTEXT-SPECIFIC
							tagNumber: 0 // [0]
						},
						value: [new Any({ name: names.content || "content" })] // EXPLICIT ANY value
					})]
				});
			}
		}]);

		return ContentInfo;
	}();
	//**************************************************************************************

	//*********************************************************************************


	var certificateBuffer = new ArrayBuffer(0); // ArrayBuffer with loaded or created CERT 
	var trustedCertificates = []; // Array of root certificates from "CA Bundle"

	var hashAlg = "SHA-1";
	var signAlg = "RSASSA-PKCS1-v1_5";

	var encAlg = {
		name: "AES-CBC",
		length: 128
	};
	//*********************************************************************************
	//region Auxiliary functions 
	//*********************************************************************************
	function formatPEM(pemString) {
		var stringLength = pemString.length;
		var resultString = "";

		for (var i = 0, count = 0; i < stringLength; i++, count++) {
			if (count > 63) {
				resultString = resultString + "\r\n";
				count = 0;
			}

			resultString = "" + resultString + pemString[i];
		}

		return resultString;
	}
	//*********************************************************************************
	//endregion
	//*********************************************************************************
	//region Create CERT  
	//*********************************************************************************
	function createCertificate() {
		//region Initial variables
		var sequence = Promise.resolve();

		var certificate = new Certificate();

		var publicKey = void 0;
		var privateKey = void 0;
		//endregion

		//region Get a "crypto" extension
		var crypto = getCrypto();
		if (typeof crypto === "undefined") {
			alert("No WebCrypto extension found");
			return;
		}
		//endregion

		//region Put a static values
		certificate.version = 2;
		certificate.serialNumber = new Integer({ value: 1 });
		certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
			type: "2.5.4.6", // Country name
			value: new PrintableString({ value: "RU" })
		}));
		certificate.issuer.typesAndValues.push(new AttributeTypeAndValue({
			type: "2.5.4.3", // Common name
			value: new BmpString({ value: "Test" })
		}));
		certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
			type: "2.5.4.6", // Country name
			value: new PrintableString({ value: "RU" })
		}));
		certificate.subject.typesAndValues.push(new AttributeTypeAndValue({
			type: "2.5.4.3", // Common name
			value: new BmpString({ value: "Test" })
		}));

		certificate.notBefore.value = new Date(2016, 1, 1);
		certificate.notAfter.value = new Date(2019, 1, 1);

		certificate.extensions = []; // Extensions are not a part of certificate by default, it"s an optional array

		//region "BasicConstraints" extension
		var basicConstr = new BasicConstraints({
			cA: true,
			pathLenConstraint: 3
		});

		certificate.extensions.push(new Extension({
			extnID: "2.5.29.19",
			critical: false,
			extnValue: basicConstr.toSchema().toBER(false),
			parsedValue: basicConstr // Parsed value for well-known extensions
		}));
		//endregion

		//region "KeyUsage" extension
		var bitArray = new ArrayBuffer(1);
		var bitView = new Uint8Array(bitArray);

		bitView[0] = bitView[0] | 0x02; // Key usage "cRLSign" flag
		bitView[0] = bitView[0] | 0x04; // Key usage "keyCertSign" flag

		var keyUsage = new BitString({ valueHex: bitArray });

		certificate.extensions.push(new Extension({
			extnID: "2.5.29.15",
			critical: false,
			extnValue: keyUsage.toBER(false),
			parsedValue: keyUsage // Parsed value for well-known extensions
		}));
		//endregion
		//endregion

		//region Create a new key pair
		sequence = sequence.then(function () {
			//region Get default algorithm parameters for key generation
			var algorithm = getAlgorithmParameters(signAlg, "generatekey");
			if ("hash" in algorithm.algorithm) algorithm.algorithm.hash.name = hashAlg;
			//endregion

			return crypto.generateKey(algorithm.algorithm, true, algorithm.usages);
		});
		//endregion

		//region Store new key in an interim variables
		sequence = sequence.then(function (keyPair) {
			publicKey = keyPair.publicKey;
			privateKey = keyPair.privateKey;
		}, function (error) {
			alert("Error during key generation: " + error);
		});
		//endregion

		//region Exporting public key into "subjectPublicKeyInfo" value of certificate
		sequence = sequence.then(function () {
			return certificate.subjectPublicKeyInfo.importKey(publicKey);
		});
		//endregion

		//region Signing final certificate
		sequence = sequence.then(function () {
			return certificate.sign(privateKey, hashAlg);
		}, function (error) {
			alert("Error during exporting public key: " + error);
		});
		//endregion

		//region Encode and store certificate
		sequence = sequence.then(function () {
			certificateBuffer = certificate.toSchema(true).toBER(false);

			var certificateString = String.fromCharCode.apply(null, new Uint8Array(certificateBuffer));

			var resultString = "-----BEGIN CERTIFICATE-----\r\n";
			resultString = "" + resultString + formatPEM(window.btoa(certificateString));
			resultString = resultString + "\r\n-----END CERTIFICATE-----\r\n";

			trustedCertificates.push(certificate);

			document.getElementById("new_signed_data").innerHTML = resultString;

			alert("Certificate created successfully!");
		}, function (error) {
			alert("Error during signing: " + error);
		});
		//endregion

		//region Exporting private key
		sequence = sequence.then(function () {
			return crypto.exportKey("pkcs8", privateKey);
		});
		//endregion

		//region Store exported key on Web page
		sequence = sequence.then(function (result) {
			var privateKeyString = String.fromCharCode.apply(null, new Uint8Array(result));

			var resultString = "";

			resultString = resultString + "\r\n-----BEGIN PRIVATE KEY-----\r\n";
			resultString = "" + resultString + formatPEM(window.btoa(privateKeyString));
			resultString = resultString + "\r\n-----END PRIVATE KEY-----\r\n";

			document.getElementById("pkcs8_key").innerHTML = resultString;

			alert("Private key exported successfully!");
		}, function (error) {
			alert("Error during exporting of private key: " + error);
		});
		//endregion

		return sequence;
	}
	//*********************************************************************************
	//endregion 
	//*********************************************************************************
	//region Encrypt input data and format as S/MIME message
	//*********************************************************************************
	function smimeEncrypt() {
		//region Decode input certificate 
		var encodedCertificate = document.getElementById("new_signed_data").innerHTML;
		var clearEncodedCertificate = encodedCertificate.replace(/(-----(BEGIN|END)( NEW)? CERTIFICATE-----|\n)/g, "");
		certificateBuffer = stringToArrayBuffer(window.atob(clearEncodedCertificate));

		var asn1 = fromBER(certificateBuffer);
		var certSimpl = new Certificate({ schema: asn1.result });
		//endregion 

		var cmsEnveloped = new EnvelopedData();

		cmsEnveloped.addRecipientByCertificate(certSimpl);

		cmsEnveloped.encrypt(encAlg, stringToArrayBuffer(document.getElementById("content").value)).then(function () {
			var cmsContentSimpl = new ContentInfo();
			cmsContentSimpl.contentType = "1.2.840.113549.1.7.3";
			cmsContentSimpl.content = cmsEnveloped.toSchema();

			var schema = cmsContentSimpl.toSchema();
			var ber = schema.toBER(false);

			// Insert enveloped data into new Mime message
			var Mimebuilder = window["emailjs-mime-builder"];
			var mimeBuilder = new Mimebuilder("application/pkcs7-mime; name=smime.p7m; smime-type=enveloped-data").setHeader("content-description", "Enveloped Data").setHeader("content-disposition", "attachment; filename=smime.p7m").setHeader("content-transfer-encoding", "base64").setContent(new Uint8Array(ber));
			mimeBuilder.setHeader("from", "sender@example.com");
			mimeBuilder.setHeader("to", "recipient@example.com");
			mimeBuilder.setHeader("subject", "Example S/MIME encrypted message");
			var mimeMessage = mimeBuilder.build();

			document.getElementById("encrypted_content").innerHTML = mimeMessage;

			alert("Encryption process finished successfully");
		}, function (error) {
			return alert("ERROR DURING ENCRYPTION PROCESS: " + error);
		});
	}
	//*********************************************************************************
	//endregion 
	//*********************************************************************************
	//region Decrypt input data 
	//*********************************************************************************
	function smimeDecrypt() {
		//region Decode input certificate 
		var encodedCertificate = document.getElementById("new_signed_data").innerHTML;
		var clearEncodedCertificate = encodedCertificate.replace(/(-----(BEGIN|END)( NEW)? CERTIFICATE-----|\n)/g, "");
		certificateBuffer = stringToArrayBuffer(window.atob(clearEncodedCertificate));

		var asn1 = fromBER(certificateBuffer);
		var certSimpl = new Certificate({ schema: asn1.result });
		//endregion 

		//region Decode input private key 
		var encodedPrivateKey = document.getElementById("pkcs8_key").innerHTML;
		var clearPrivateKey = encodedPrivateKey.replace(/(-----(BEGIN|END)( NEW)? PRIVATE KEY-----|\n)/g, "");
		var privateKeyBuffer = stringToArrayBuffer(window.atob(clearPrivateKey));
		//endregion 

		//region Parse S/MIME message to get CMS enveloped content 

		// Parse MIME message and extract the envelope data
		var parser = new MimeParser();

		var mimeMessage = document.getElementById("encrypted_content").innerHTML;
		parser.write(mimeMessage);
		parser.end();
		//endregion

		// Note: MimeParser handles the base64 decoding to get us back a buffer
		var cmsEnvelopedBuffer = utilConcatBuf(new ArrayBuffer(0), parser.node.content);

		asn1 = fromBER(cmsEnvelopedBuffer);
		var cmsContentSimpl = new ContentInfo({ schema: asn1.result });
		var cmsEnvelopedSimp = new EnvelopedData({ schema: cmsContentSimpl.content });
		//endregion 

		cmsEnvelopedSimp.decrypt(0, {
			recipientCertificate: certSimpl,
			recipientPrivateKey: privateKeyBuffer
		}).then(function (result) {
			document.getElementById("decrypted_content").innerHTML = arrayBufferToString(result);
		}, function (error) {
			return alert("ERROR DURING DECRYPTION PROCESS: " + error);
		});
	}
	//*********************************************************************************
	//endregion 
	//*********************************************************************************
	function handleHashAlgOnChange() {
		var hashOption = document.getElementById("hash_alg").value;
		switch (hashOption) {
			case "alg_SHA1":
				hashAlg = "sha-1";
				break;
			case "alg_SHA256":
				hashAlg = "sha-256";
				break;
			case "alg_SHA384":
				hashAlg = "sha-384";
				break;
			case "alg_SHA512":
				hashAlg = "sha-512";
				break;
			default:
		}
	}
	//*********************************************************************************
	function handleSignAlgOnChange() {
		var signOption = document.getElementById("sign_alg").value;
		switch (signOption) {
			case "alg_RSA15":
				signAlg = "RSASSA-PKCS1-V1_5";
				break;
			case "alg_RSA2":
				signAlg = "RSA-PSS";
				break;
			case "alg_ECDSA":
				signAlg = "ECDSA";
				break;
			default:
		}
	}
	//*********************************************************************************
	function handleEncAlgOnChange() {
		var encryptionAlgorithmSelect = document.getElementById("content_enc_alg").value;
		switch (encryptionAlgorithmSelect) {
			case "alg_CBC":
				encAlg.name = "AES-CBC";
				break;
			case "alg_GCM":
				encAlg.name = "AES-GCM";
				break;
			default:
		}
	}
	//*********************************************************************************
	function handleEncLenOnChange() {
		var encryptionAlgorithmLengthSelect = document.getElementById("content_enc_alg_len").value;
		switch (encryptionAlgorithmLengthSelect) {
			case "len_128":
				encAlg.length = 128;
				break;
			case "len_192":
				encAlg.length = 192;
				break;
			case "len_256":
				encAlg.length = 256;
				break;
			default:
		}
	}
	//*********************************************************************************
	context("Hack for Rollup.js", function () {
		return;

		createCertificate();
		smimeEncrypt();
		smimeDecrypt();
		handleHashAlgOnChange();
		handleSignAlgOnChange();
		handleEncAlgOnChange();
		handleEncLenOnChange();
		setEngine();
	});
	//*********************************************************************************

	window.createCertificate = createCertificate;
	window.smimeEncrypt = smimeEncrypt;
	window.smimeDecrypt = smimeDecrypt;
	window.handleHashAlgOnChange = handleHashAlgOnChange;
	window.handleSignAlgOnChange = handleSignAlgOnChange;
	window.handleEncAlgOnChange = handleEncAlgOnChange;
	window.handleEncLenOnChange = handleEncLenOnChange;

	function context(name, func) {}
})();