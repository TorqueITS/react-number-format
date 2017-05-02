//const React = require('react');
import React, {PropTypes} from 'react';

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

const propTypes = {
  thousandSeparator: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  decimalSeparator: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  decimalPrecision: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  displayType: PropTypes.oneOf(['input', 'text']),
  prefix: PropTypes.string,
  suffix: PropTypes.string,
  format: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func
  ]),
  mask: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  customInput: PropTypes.func,
  allowNegative: PropTypes.bool,
  onKeyDown: PropTypes.func,
  onChange: PropTypes.func
};

const defaultProps = {
  id: 'number_format',
  displayType: 'input',
  decimalSeparator: '.',
  decimalPrecision: false
};

class NumberFormat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    }
    this.onChange = this.onChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  componentWillReceiveProps(newProps) {
    if(newProps.value !== this.props.value) {
      this.setState({
        value : newProps.value
      });
    }
  }

  getSeparators() {
    let {thousandSeparator, decimalSeparator} = this.props;
    if (thousandSeparator === true) {
      thousandSeparator = ','
    }

    if (decimalSeparator && thousandSeparator && typeof decimalSeparator !== 'string') {
      decimalSeparator = thousandSeparator === '.' ? ',' : '.';
    }

    if (thousandSeparator === '.') {
      decimalSeparator = ',';
    }

    if (decimalSeparator === true) {
      decimalSeparator = '.'
    }

    return {
      decimalSeparator,
      thousandSeparator
    }
  }

  getNumberRegex(g, ignoreDecimalSeperator) {
    const {format} = this.props;
    const {decimalSeparator} = this.getSeparators();
    return new RegExp('\\d' + (decimalSeparator && !ignoreDecimalSeperator && !format ? '|' + escapeRegExp(decimalSeparator) : ''), g ? 'g' : undefined);
  }

  setCaretPosition(el, caretPos) {
    el.value = el.value;
    // ^ this is used to not only get "focus", but
    // to make sure we don't have it everything -selected-
    // (it causes an issue in chrome, and having it doesn't hurt any other browser)
    if (el !== null) {
      if (el.createTextRange) {
        const range = el.createTextRange();
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

  formatInput(val) {
    //change val to string if its number
    if(typeof val === 'number') val = val + '';

    const negativeRegex = new RegExp('(-)');
    const doubleNegativeRegex = new RegExp('(-)(.)*(-)');

    // Check number has '-' value
    const hasNegative = negativeRegex.test(val);
    // Check number has 2 or more '-' values
    const removeNegative = doubleNegativeRegex.test(val);
    let formattedValue = val;
    if(this.props.format){
        val = this.getNonFormattedValue(val);
        formattedValue = this.props.format(val);
        if (this.props.allowNegative && hasNegative && !removeNegative) {
            formattedValue = '-' + formattedValue;
        }
    }
    return {
        value : this.getNonFormattedValue(formattedValue),
        formattedValue : formattedValue
    }
  }

  getNonFormattedValue(value) {
    const separator = this.props.thousandSeparator ? this.props.thousandSeparator : ',';
    let val = value.split(separator).join('');
    if (this.props.decimalSeparator !== '.') {
        val = val.replace(/,/g, '.');
    }
    const doubleDecimalRegex = new RegExp(/(.)*(\.)(.)*(\.)(.)*/);
    // Check number has 2 or more '.' values
    const ignoreDoubleDecimal = doubleDecimalRegex.test(val);
    if (ignoreDoubleDecimal) {
        val = this.getNonFormattedValue(this.state.value);
    }
    val = val.replace(/[^\d\.]/g, '');
    if (val && this.props.decimalPrecision !== false) {
        const precision = this.props.decimalPrecision === true ? 2 : this.props.decimalPrecision;
        val = val.toString().match('^-?\\d+(?:\\.\\d{0,' + (precision || -1) + '})?')[0];
    }
    return val;
  }

  getCursorPosition(inputValue, formattedValue, cursorPos) {
    const numRegex = this.getNumberRegex();
    let j, i;

    j=0;
    for(i=0; i<cursorPos; i++){
      if(!inputValue[i].match(numRegex) && inputValue[i] !== formattedValue[j]) continue;
      while(inputValue[i] !== formattedValue[j] && j<formattedValue.length) j++;
      j++;
    }

    return j;
  }

  onChangeHandler(e,callback) {
    e.persist();
    const el = e.target;
    const inputValue = el.value;
    const {formattedValue,value} = this.formatInput(inputValue);
    let cursorPos = el.selectionStart;

    //change the state
    this.setState({value : formattedValue},()=>{
      cursorPos = this.getCursorPosition(inputValue, formattedValue, cursorPos );
      /*
        setting caret position within timeout of 0ms is required for mobile chrome,
        otherwise browser resets the caret position after we set it
        We are also setting it without timeout so that in normal browser we don't see the flickering
       */
      this.setCaretPosition(el, cursorPos);
      // setTimeout(() => this.setCaretPosition(el, cursorPos), 0);
      if(callback) callback(e,value);
    });

    return value;
  }

  onChange(e) {
    this.onChangeHandler(e,this.props.onChange);
  }
  onKeyDown(e) {
    const el = e.target;
    const {selectionStart, selectionEnd, value} = el;
    const {decimalPrecision} = this.props;
    const {key} = e;
    const numRegex = this.getNumberRegex(false, decimalPrecision !== false);
    const negativeRegex = new RegExp('-');
    //Handle backspace and delete against non numerical/decimal characters
    if(selectionEnd - selectionStart === 0) {
      if (key === 'Delete' && !numRegex.test(value[selectionStart]) && !negativeRegex.test(value[selectionStart])) {
        e.preventDefault();
        let nextCursorPosition = selectionStart;
        while (!numRegex.test(value[nextCursorPosition]) && nextCursorPosition < value.length) nextCursorPosition++;
        this.setCaretPosition(el, nextCursorPosition);
      } else if (key === 'Backspace' && !numRegex.test(value[selectionStart - 1]) && !negativeRegex.test(value[selectionStart-1])) {
        e.preventDefault();
        let prevCursorPosition = selectionStart;
        while (!numRegex.test(value[prevCursorPosition - 1]) && prevCursorPosition > 0) prevCursorPosition--;
        this.setCaretPosition(el, prevCursorPosition);
      }
    }

    if (this.props.onKeyDown) this.props.onKeyDown(e);
  }
  render() {
    const props = Object.assign({}, this.props);

    Object.keys(propTypes).forEach((key) => {
      delete props[key];
    });

    const inputProps = Object.assign({}, props, {
      type:'text',
      value:this.formatInput(this.state.value).formattedValue,
      onChange:this.onChange,
      onKeyDown:this.onKeyDown,
    })

    if( this.props.displayType === 'text'){
      return (<span {...props}>{this.state.value}</span>);
    }

    else if (this.props.customInput) {
      const CustomInput = this.props.customInput;
      return (
        <CustomInput
          {...inputProps}
        />
      )
    }

    return (
      <input
        {...inputProps}
      />
    )
  }
}

NumberFormat.propTypes = propTypes;
NumberFormat.defaultProps = defaultProps;

module.exports =  NumberFormat;