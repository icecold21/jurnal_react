import React from 'react'
import { Link } from 'react-router-dom'
import ClassNames from 'classnames'

class PaymentMethodBox extends React.Component {
  render() {
    var method_icon = null
    if (this.props.name == 'va') {
      method_icon = <img src="https://s3-ap-southeast-1.amazonaws.com/jurnal-assets/images/icon/va_icon3.svg" width="80" height="30" />
    } else if (this.props.name == 'cc') {
      method_icon = <img src="https://s3-ap-southeast-1.amazonaws.com/jurnal-assets/images/icon/cc_icon.svg" width="80" height="30" />
    }
    return (
      <div className="payment_method_box">
        <button className={ClassNames("payment_method_icon", {active: this.props.active})}
                name={this.props.name} onClick={() => this.props.handleClick(this.props.name)}>
          {method_icon}
        </button>
        { this.props.active == true &&
          <i className="fa fa-check payment_method_box_check" aria-hidden="true" />
        }
        <div className={ClassNames("payment_method_label", {active: this.props.active})}> {this.props.label} </div>
      </div>
    )
  }
};

export default class EmailTransactionPaymentMethod extends React.Component {
  render() {
    if (this.props.show == true) {
      return (
        <div className="payment_methods_container">
          <div className="title_text"> Metode Pembayaran </div>
          <div className="row">
            { (this.props.available_payment_methods != null && this.props.available_payment_methods.virtual_account) &&
              <PaymentMethodBox icon="VA" label="Virtual Account" name="va"
                                handleClick={this.props.handleClickPaymentMethod}
                                active={this.props.payment_method_selected == "va"} />
            }
            { (this.props.available_payment_methods != null && this.props.available_payment_methods.credit_card) &&
              <PaymentMethodBox icon="CC" label="Kartu Kredit" name="cc"
                                handleClick={this.props.handleClickPaymentMethod}
                                active={this.props.payment_method_selected == "cc"} />
            }
          </div>
        </div>
      )
    }
    else {
      return null
    }
  }
};