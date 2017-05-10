'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //const React = require('react');


function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

var propTypes = {
  thousandSeparator: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.bool]),
  decimalSeparator: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.bool]),
  decimalPrecision: _react.PropTypes.oneOfType([_react.PropTypes.number, _react.PropTypes.bool]),
  displayType: _react.PropTypes.oneOf(['input', 'text']),
  prefix: _react.PropTypes.string,
  suffix: _react.PropTypes.string,
  format: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.func]),
  mask: _react.PropTypes.string,
  value: _react.PropTypes.oneOfType([_react.PropTypes.number, _react.PropTypes.string]),
  customInput: _react.PropTypes.func,
  allowNegative: _react.PropTypes.bool,
  onKeyDown: _react.PropTypes.func,
  onChange: _react.PropTypes.func
};

var defaultProps = {
  displayType: 'input',
  decimalSeparator: '.',
  decimalPrecision: false
};

var NumberFormat = function (_React$Component) {
  _inherits(NumberFormat, _React$Component);

  function NumberFormat(props) {
    _classCallCheck(this, NumberFormat);

    var _this = _possibleConstructorReturn(this, (NumberFormat.__proto__ || Object.getPrototypeOf(NumberFormat)).call(this, props));

    _this.onChange = _this.onChange.bind(_this);
    _this.onKeyDown = _this.onKeyDown.bind(_this);
    _this.getInitialformattedNumber = _this.getInitialformattedNumber.bind(_this);
    _this.state = {
      value: _this.getInitialformattedNumber(props.value)
    };
    return _this;
  }

  _createClass(NumberFormat, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      if (newProps.value !== this.props.value || newProps.format !== this.props.format) {
        this.setState({
          value: this.getInitialformattedNumber(newProps.value)
        });
      }
    }
  }, {
    key: 'getInitialformattedNumber',
    value: function getInitialformattedNumber(value) {
      if (value === '' || value === '-' || value === this.props.decimalSeparator || value === '-' + this.props.decimalSeparator) {
        return value;
      } else if (value === null) {
        return '';
      }
      return this.props.format(value);
    }
  }, {
    key: 'getSeparators',
    value: function getSeparators() {
      var _props = this.props,
          thousandSeparator = _props.thousandSeparator,
          decimalSeparator = _props.decimalSeparator;

      if (thousandSeparator === true) {
        thousandSeparator = ',';
      }

      if (decimalSeparator && thousandSeparator && typeof decimalSeparator !== 'string') {
        decimalSeparator = thousandSeparator === '.' ? ',' : '.';
      }

      if (thousandSeparator === '.') {
        decimalSeparator = ',';
      }

      if (decimalSeparator === true) {
        decimalSeparator = '.';
      }

      return {
        decimalSeparator: decimalSeparator,
        thousandSeparator: thousandSeparator
      };
    }
  }, {
    key: 'getNumberRegex',
    value: function getNumberRegex(g, ignoreDecimalSeperator) {
      var format = this.props.format;

      var _getSeparators = this.getSeparators(),
          decimalSeparator = _getSeparators.decimalSeparator;

      return new RegExp('\\d' + (decimalSeparator && !ignoreDecimalSeperator && !format ? '|' + escapeRegExp(decimalSeparator) : ''), g ? 'g' : undefined);
    }
  }, {
    key: 'setCaretPosition',
    value: function setCaretPosition(el, caretPos) {
      el.value = el.value;
      // ^ this is used to not only get "focus", but
      // to make sure we don't have it everything -selected-
      // (it causes an issue in chrome, and having it doesn't hurt any other browser)
      if (el !== null) {
        if (el.createTextRange) {
          var range = el.createTextRange();
          range.move('character', caretPos);
          range.select();
          return true;
        }
        // (el.selectionStart === 0 added for Firefox bug)
        if (el.selectionStart || el.selectionStart === 0) {
          el.focus();
          el.setSelectionRange(caretPos, caretPos);
          return true;
        }

        // fail city, fortunately this never happens (as far as I've tested) :)
        el.focus();
        return false;
      }
    }
  }, {
    key: 'formatInput',
    value: function formatInput(val) {
      //change val to string if its number
      if (typeof val === 'number') val = val + '';

      var negativeRegex = new RegExp('(-)');
      var doubleNegativeRegex = new RegExp('(-)(.)*(-)');

      // Check number has '-' value
      var hasNegative = negativeRegex.test(val);
      // Check number has 2 or more '-' values
      var removeNegative = doubleNegativeRegex.test(val);
      var formattedValue = val;
      var nonFormattedValue = val;
      // handle '-', '.|,' and '-.|-,'
      if (formattedValue === '-' || formattedValue === this.props.decimalSeparator || formattedValue === '-' + this.props.decimalSeparator) {
        formattedValue = this.getNonFormattedValue(formattedValue);
        if (this.props.allowNegative && hasNegative && !removeNegative) {
          formattedValue = '-' + formattedValue;
        }
        return {
          value: formattedValue,
          formattedValue: formattedValue
        };
      }
      // handle start with any non digit charactor
      if (formattedValue && formattedValue.replace(/[^\d]/g, '') === '') {
        return {
          value: '',
          formattedValue: ''
        };
      }
      if (this.props.format && val) {
        nonFormattedValue = this.getNonFormattedValue(val);
        formattedValue = this.props.format(nonFormattedValue);
        if (this.props.allowNegative && hasNegative && !removeNegative) {
          formattedValue = '-' + formattedValue;
          nonFormattedValue = '-' + nonFormattedValue;
        }
      }
      return {
        value: nonFormattedValue,
        formattedValue: formattedValue
      };
    }
  }, {
    key: 'getNonFormattedValue',
    value: function getNonFormattedValue(value) {
      if (value) {
        var val = value;
        if (this.props.thousandSeparator !== false) {
          var separator = this.props.thousandSeparator ? this.props.thousandSeparator : ',';
          val = value.split(separator).join('');
        }
        if (this.props.decimalSeparator !== '.') {
          val = val.replace(/,/g, '.');
        }
        var doubleDecimalRegex = new RegExp(/(.)*(\.)(.)*(\.)(.)*/);
        // Check number has 2 or more '.' values
        var ignoreDoubleDecimal = doubleDecimalRegex.test(val);
        if (ignoreDoubleDecimal) {
          val = this.getNonFormattedValue(this.state.value);
        }
        // remove non numeric characters
        val = val.replace(/[^\d\.]/g, '');
        if (val && this.props.decimalPrecision !== false) {
          var precision = this.props.decimalPrecision === true ? 2 : this.props.decimalPrecision;
          var roundedValue = val.toString().match('^-?\\d+(?:\\.\\d{0,' + (precision || -1) + '})?');
          val = roundedValue ? roundedValue[0] : val;
        }
        return val;
      }
      return value;
    }
  }, {
    key: 'getCursorPosition',
    value: function getCursorPosition(inputValue, formattedValue, cursorPos) {
      var numRegex = this.getNumberRegex();
      var j = void 0,
          i = void 0;

      j = 0;
      for (i = 0; i < cursorPos; i++) {
        if (!inputValue[i].match(numRegex) && inputValue[i] !== formattedValue[j]) continue;
        while (inputValue[i] !== formattedValue[j] && j < formattedValue.length) {
          j++;
        }j++;
      }

      return j;
    }
  }, {
    key: 'onChangeHandler',
    value: function onChangeHandler(e, callback) {
      var _this2 = this;

      e.persist();
      var el = e.target;
      var inputValue = el.value;

      var _formatInput = this.formatInput(inputValue),
          formattedValue = _formatInput.formattedValue,
          value = _formatInput.value;

      var cursorPos = el.selectionStart;

      //change the state
      this.setState({ value: formattedValue }, function () {
        cursorPos = _this2.getCursorPosition(inputValue, formattedValue, cursorPos);
        /*
          setting caret position within timeout of 0ms is required for mobile chrome,
          otherwise browser resets the caret position after we set it
          We are also setting it without timeout so that in normal browser we don't see the flickering
          Workaround for this is setTimeout(() => this.setCaretPosition(el, cursorPos), 0);
          But it creates problems in IE to get characters if type fast.
         */
        _this2.setCaretPosition(el, cursorPos);
        if (callback) callback(e, value);
      });

      return value;
    }
  }, {
    key: 'onChange',
    value: function onChange(e) {
      this.onChangeHandler(e, this.props.onChange);
    }
  }, {
    key: 'onKeyDown',
    value: function onKeyDown(e) {
      var el = e.target;
      var selectionStart = el.selectionStart,
          selectionEnd = el.selectionEnd,
          value = el.value;
      var decimalPrecision = this.props.decimalPrecision;
      var key = e.key;

      var numRegex = this.getNumberRegex(false, decimalPrecision !== false);
      var negativeRegex = new RegExp('-');
      //Handle backspace and delete against non numerical/decimal characters
      if (selectionEnd - selectionStart === 0) {
        if (key === 'Delete' && !numRegex.test(value[selectionStart]) && !negativeRegex.test(value[selectionStart])) {
          e.preventDefault();
          var nextCursorPosition = selectionStart;
          while (!numRegex.test(value[nextCursorPosition]) && nextCursorPosition < value.length) {
            nextCursorPosition++;
          }this.setCaretPosition(el, nextCursorPosition);
        } else if (key === 'Backspace' && !numRegex.test(value[selectionStart - 1]) && !negativeRegex.test(value[selectionStart - 1])) {
          e.preventDefault();
          var prevCursorPosition = selectionStart;
          while (!numRegex.test(value[prevCursorPosition - 1]) && prevCursorPosition > 0) {
            prevCursorPosition--;
          }this.setCaretPosition(el, prevCursorPosition);
        }
      }

      if (this.props.onKeyDown) this.props.onKeyDown(e);
    }
  }, {
    key: 'render',
    value: function render() {
      var props = _extends({}, this.props);

      Object.keys(propTypes).forEach(function (key) {
        delete props[key];
      });

      var inputProps = _extends({}, props, {
        type: 'text',
        value: this.state.value,
        onChange: this.onChange,
        onKeyDown: this.onKeyDown
      });

      if (this.props.displayType === 'text') {
        return _react2.default.createElement(
          'span',
          props,
          this.state.value
        );
      } else if (this.props.customInput) {
        var CustomInput = this.props.customInput;
        return _react2.default.createElement(CustomInput, inputProps);
      }

      return _react2.default.createElement('input', inputProps);
    }
  }]);

  return NumberFormat;
}(_react2.default.Component);

NumberFormat.propTypes = propTypes;
NumberFormat.defaultProps = defaultProps;

module.exports = NumberFormat;
