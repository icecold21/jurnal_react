import React from 'react';
import VirtualAccountFlow from './EmailTransactionVirtualAccountFlow'
import CreditCardFlow from './EmailTransactionCreditCardFlow'

function InitFlow() {
  return (
    <div className="payment_flows_container">
      <div className="title_text">
        Proceed Payment
      </div>
      <div className="blank_grey_box">
        Please choose payment method above before continuing
      </div>
    </div>
  )
}

export default class EmailTransactionPaymentFlow extends React.Component {
  render() {
    if(this.props.payment_method_selected == "va") {
      return (
        <VirtualAccountFlow va_banks_available={this.props.va_banks_available}
                            va_bank_selected={this.props.va_bank_selected}
                            va_step={this.props.va_step}
                            va_transaction_info={this.props.va_transaction_info}
                            va_transaction_payments={this.props.va_transaction_payments}
                            handleVAUpdateBank={this.props.handleVAUpdateBank}
                            handleVAProceed={this.props.handleVAProceed}
                            handleVAConfirmPayment={this.props.handleVAConfirmPayment}
                            handleChooseDifferentPaymentMethod={this.props.handleChooseDifferentPaymentMethod}
                            goToVAStep2={this.props.goToVAStep2} />
      )
    } else if (this.props.payment_method_selected == "cc") {
      return (
        <CreditCardFlow email_preview={this.props.email_preview}
                        transaction={this.props.email_preview.transaction}
                        setLoading={this.props.setLoading}
                        cc_step={this.props.cc_step}
                        cc_secure_auth_url={this.props.cc_secure_auth_url}
                        initCreditCardForm={this.props.initCreditCardForm}
                        initCreditCardSecureAuth={this.props.initCreditCardSecureAuth}
                        handleCreditCardSuccess={this.props.handleCreditCardSuccess}
                        handleSuccessPayment={this.props.handleSuccessPayment}
                        setErrorMessage={this.props.setErrorMessage} />
      )
    } else {
      return (
        <InitFlow />
      )
    }
  } 
}

