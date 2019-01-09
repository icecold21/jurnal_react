import React from 'react'
import $ from 'jquery'
import PaymentFlow from './EmailTransactionPaymentFlow'
import InfoPanel from './EmailTransactionInfoPanel'
import PaymentMethod from './EmailTransactionPaymentMethod'

import Globals from './Globals'

export default class EmailTransactionPayment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      payment_show_methods: true,
      payment_method_selected: null,
      va_banks_available: null,
      va_bank_selected: null,
      va_step: 0,
      va_transaction_info: null,
      va_transaction_payments: null,
      cc_step: 1,
      cc_secure_auth_url: null
    }
  }

  componentDidMount() {
    this.props.handleUpdateBreadcrumbStep(2)
  }

  handleClickPaymentMethod(payment_type) {
    if (payment_type === "va") {
      $.ajax({
        type: "GET",
        dataType: 'json',
        url: Globals.payment_service_base_url + '/api/transactions/get_virtual_account_code',
        headers: {
          "cache-control": "no-cache",
          "access-token": this.props.email_preview.payment_service_access_token
        },
        success: function(response) {
          this.setState({
            payment_method_selected: payment_type,
            payment_show_methods: true,
            va_banks_available: response,
            va_bank_selected: null,
            va_step: 0
          });
        }.bind(this),
        error: function(response) {
          this.setState({
            payment_method_selected: payment_type,
            payment_show_methods: true,
            va_banks_available: null,
            va_bank_selected: null,
            va_step: 0
          });
          this.props.setErrorMessage("Kode Virtual Account tidak dapat dibuat, mohon dicoba kembali.");
        }.bind(this)
      });
    } else if (payment_type === "cc") {
      this.setState({
        payment_method_selected: payment_type,
        payment_show_methods: true
      });
    }

    // /transactions
    // /transactions/payment
    // var payment_only = {
    //   "payment":{
    //     "type": "virtual_account",
    //     "virtual_account": {
    //         "bank_code": "BCA",
    //         "amount": this.props.transaction.balance_due,
    //         "transaction_id": "asdsada"
    //     }
    //   }
    // };
  }

  initCreditCardForm() {
    this.setState({
      cc_step: 1,
      cc_secure_auth_url: null
    });
  }

  initCreditCardSecureAuth(url) {
    this.setState({
      cc_step: 2,
      cc_secure_auth_url: url
    });
  }

  handleCreditCardSuccess() {
    this.setState({
      cc_step: 3,
      cc_secure_auth_url: null
    });
  }

  handleVAUpdateBank(bank) {
    this.setState({
      va_bank_selected: bank,
      va_step: 1
    });
  }

  setLoading(is_loading) {
    this.setState({
      loading: is_loading
    })
  }

  handleVAProceed() {
    this.props.setErrorMessage("reset");
    this.setState({
      loading: true
    });

    var sendInfo = {
      "transaction": {
        "transaction_id": this.props.transaction.id,
        "transaction_no": this.props.transaction.transaction_no,
        "amount": this.props.transaction.balance_due,
        "person_name": this.props.transaction.person_name,
        "email": this.props.transaction.email,
        "email_cc": this.props.transaction.email_cc,
        "transaction_type": this.props.transaction.transaction_type_id
      },
      "payment":{
        "type": "virtual_account",
        "virtual_account": {
            "bank_code": this.state.va_bank_selected,
            "amount": this.props.transaction.balance_due,
        }
      }
    };

    $.ajax({
      type: "POST",
      url: Globals.payment_service_base_url + "/api/transactions",
      dataType: "json",
      headers: {
        "cache-control": "no-cache",
        "access-token": this.props.email_preview.payment_service_access_token
      },
      success: function(response) {
        if (response.virtual_account == null) {
          this.setState({
            loading: false
          });
        } else {
          this.setState({
            loading: false,
            payment_show_methods: false,
            va_step: 2,
            va_transaction_info: response
          });
        }
      }.bind(this),
      error: function(response) {
        this.setState({
          loading: false,
          va_step: 0
        });
        this.props.setErrorMessage("general");
      }.bind(this),
      data: sendInfo
    });
  }

  handleChooseDifferentPaymentMethod() {
    this.setState({
      loading: false,
      payment_show_methods: true,
      payment_method_selected: null,
      va_banks_available: null,
      va_bank_selected: null,
      va_step: 0,
      va_transaction_info: null,
      va_transaction_payments: null,
      cc_step: 1,
      cc_secure_auth_url: null
    });
  }

  handleVAConfirmPayment() {
    this.setState({
      loading: true
    });

    $.ajax({
      type: "GET",
      dataType: 'json',
      url: Globals.payment_service_base_url + `/api/transactions/${this.state.va_transaction_info.id}/status`,
      headers: {
        "cache-control": "no-cache",
        "access-token": this.props.email_preview.payment_service_access_token
      },
      success: function(response) {

        var payments = response.payments;
        var payment_array = payments.map(function(x){ return x.status === "paid" ? x.amount : 0 });
        var amount_paid = (payment_array.length > 0) ? payment_array.reduce(function(sum,value){ return sum + value }) : 0;
        var amount = this.state.va_transaction_info.amount
        var remaining = amount - amount_paid

        if (remaining == 0) {
          this.props.handleSuccessPayment()
        }

        this.setState({
          va_transaction_payments: response,
          payment_show_methods: false,
          va_step: 3,
          loading: false
        });
      }.bind(this),
      error: function(response) {
        this.setState({
          payment_show_methods: false,
          va_step: 3,
          loading: false
        });
        this.props.setErrorMessage("general");
      }.bind(this)
    });
  }

  goToVAStep2() {
    this.setState({
      va_step: 2
    });
  }

  render() {
    return (
      <div className="main_content">

        <div className="only_small_screen_container">
          <InfoPanel email_preview={this.props.email_preview} transaction={this.props.transaction} />
        </div>

        <div className="left_container">
          <PaymentMethod show={this.state.payment_show_methods}
                          available_payment_methods={this.props.available_payment_methods}
                          payment_method_selected={this.state.payment_method_selected}
                          handleClickPaymentMethod={this.handleClickPaymentMethod.bind(this)} />

          {(this.state.loading == true) ? (
            <div className="loading-container">
              <i className="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <PaymentFlow step={this.state.payment_step}
                          payment_method_selected={this.state.payment_method_selected}
                          va_banks_available={this.state.va_banks_available}
                          va_bank_selected={this.state.va_bank_selected}
                          va_step={this.state.va_step}
                          va_transaction_info={this.state.va_transaction_info}
                          va_transaction_payments={this.state.va_transaction_payments}
                          cc_step={this.state.cc_step}
                          cc_secure_auth_url={this.state.cc_secure_auth_url}
                          initCreditCardSecureAuth={this.initCreditCardSecureAuth.bind(this)}
                          initCreditCardForm={this.initCreditCardForm.bind(this)}
                          handleCreditCardSuccess={this.handleCreditCardSuccess.bind(this)}
                          handleVAUpdateBank={this.handleVAUpdateBank.bind(this)}
                          handleVAProceed={this.handleVAProceed.bind(this)}
                          handleVAConfirmPayment={this.handleVAConfirmPayment.bind(this)}
                          handleChooseDifferentPaymentMethod={this.handleChooseDifferentPaymentMethod.bind(this)}
                          goToVAStep2={this.goToVAStep2.bind(this)}
                          handleSuccessPayment={this.props.handleSuccessPayment}
                          email_preview={this.props.email_preview}
                          setLoading={this.setLoading.bind(this)}
                          setErrorMessage={this.props.setErrorMessage} />

          )}
        </div>

        <div className="right_container">
          <InfoPanel email_preview={this.props.email_preview} transaction={this.props.transaction} />
        </div>
      </div>
    )
  }
}