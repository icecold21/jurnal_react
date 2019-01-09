import React from 'react';
import Select from 'react-select';

import 'react-select/dist/react-select.css';

export default class EmailTransactionBankSelector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      bank: null
    };
  }

  handleChange(e) {
    var newValue = (e == null) ? null : e.value
    this.setState({
      bank: newValue
    });
    this.props.handleVAUpdateBank(newValue)
  }

  render() {
    return (
      <Select
        value={this.state.bank}
        placeholder="Pilih Bank"
        options={this.props.data_option}
        onChange={this.handleChange.bind(this)}
      />
    )
  }
}