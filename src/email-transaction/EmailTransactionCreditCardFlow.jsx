import React from 'react';
import $ from 'jquery'
import ClassNames from 'classnames'
import { Redirect } from 'react-router-dom'

import Globals from './Globals'

class Input extends React.Component {
  render() {
    var container_class = `form-group col-lg-${this.props.col_size} col-md-${this.props.col_size} col-sm-${this.props.col_size}`
    var icon_class = ClassNames("input_validation_icon", "fa",
                                {"fa-check correct": this.props.show_type == 'correct'},
                                {"fa-times wrong": this.props.show_type == 'wrong'},
                                {"hidden": this.props.show_type == 'hidden'},
                                {"size_6": this.props.col_size == 6},
                                {"size_3": this.props.col_size == 3})
    return(
      <div className={container_class}>
        <label className="input_label_text" htmlFor={this.props.id}>{this.props.label}</label>
        <div>
          <input type={this.props.type} className="form-control" id={this.props.id} onChange={this.props.onChange} name={this.props.name} placeholder={this.props.placeholder} maxLength={this.props.maxLength}/>
          <i className={icon_class} aria-hidden="true" />
        </div>
      </div>
    )
  }
}

function SecureAuthIframe(props) {
  return (
    <div className='text-center'>
      <iframe className='secure_auth_iframe' scrolling="yes" src={props.url} />
    </div>
  )
}

class CreditCardForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cc_number: null,
      cc_name: null,
      cc_expiry_month: null,
      cc_expiry_year: null,
      cc_cvv: null,
      cc_number_show_validity: 'hidden',
      cc_name_show_validity: 'hidden',
      cc_expiry_month_show_validity: 'hidden',
      cc_expiry_year_show_validity: 'hidden',
      cc_cvv_show_validity: 'hidden'
    }
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    const show_validity_var = name + '_show_validity';

    var show_validity = null;

    if (name == "cc_number") {
      show_validity = (window.Xendit.card.validateCardNumber(value) == true && value.length == 16) ? 'correct' : 'wrong';
    }
    else if (name == "cc_cvv") {
      show_validity = (window.Xendit.card.validateCvn(value) == true && value.length == 3) ? 'correct' : 'wrong';
    }
    else if (name == "cc_name") {
      show_validity = (value != null && value != '') ? 'correct' : 'wrong';
    }
    else if (name == "cc_expiry_month") {
      var month = value;
      var year = this.state.cc_expiry_year;
      show_validity = (window.Xendit.card.validateExpiry(month, year) == true && month.length == 2 && year.length == 4) ? 'correct' : 'wrong';
    }
    else if (name == "cc_expiry_year") {
      var month = this.state.cc_expiry_month;
      var year = value;
      show_validity = (window.Xendit.card.validateExpiry(month, year) == true && month.length == 2 && year.length == 4) ? 'correct' : 'wrong';
    }

    if (name == "cc_expiry_month" || name == "cc_expiry_year") {
      this.setState({
        [name]: value,
        cc_expiry_month_show_validity: show_validity,
        cc_expiry_year_show_validity: show_validity
      });
    } else {
      this.setState({
        [name]: value,
        [show_validity_var]: show_validity
      });
    }
  }

  handleSubmit(event) {
    var credit_card_info = {
      cc_number: this.state.cc_number,
      cc_name: this.state.cc_name,
      cc_expiry_month: this.state.cc_expiry_month,
      cc_expiry_year: this.state.cc_expiry_year,
      cc_cvv: this.state.cc_cvv
    }

    this.props.handleCreditCardPayment(credit_card_info)
  }

  render() {
    return (
      <div>
        <div className="row zero_margin">
          <Input type="text" label="Nomor Kartu Kredit" name="cc_number" col_size="6" placeholder="4000000000000002"
                  onChange={this.handleInputChange.bind(this)}
                  show_type={this.state.cc_number_show_validity} maxLength='16'/>
          <Input type="text" label="Nama Pemilik Kartu" name="cc_name" col_size="6" placeholder="Alex Siswanto"
                  onChange={this.handleInputChange.bind(this)}
                  show_type={this.state.cc_name_show_validity} />
        </div>
        <div className="row zero_margin">
          <Input type="text" label="Bulan Expiry" name="cc_expiry_month" col_size="3" placeholder="06"
                  onChange={this.handleInputChange.bind(this)}
                  show_type={this.state.cc_expiry_month_show_validity} maxLength='2'/>
          <Input type="text" label="Tahun Expiry" name="cc_expiry_year" col_size="3" placeholder="2020"
                  onChange={this.handleInputChange.bind(this)}
                  show_type={this.state.cc_expiry_year_show_validity} maxLength='4'/>
          <Input type="password" label="CVV" name="cc_cvv" col_size="3" placeholder="145"
                  onChange={this.handleInputChange.bind(this)}
                  show_type={this.state.cc_cvv_show_validity} maxLength='3'/>
        </div>
        <div className="row zero_margin">
          <button className="button success margin-top-24 blue_proceed_btn" onClick={this.handleSubmit.bind(this)}> Proceed to Pay </button>
        </div>
      </div>
    )
  }
}

export default class EmailTransactionCreditCardFlow extends React.Component {

  handleCreditCardPayment(credit_card_info) {
    this.props.setErrorMessage("reset");
    this.props.setLoading(true);
    var xendit_key = null;

    // GET CC CREDENTIALS from JurnalPaymentService
    $.ajax({
      type: "GET",
      dataType: 'json',
      async: false,
      url: Globals.payment_service_base_url + '/api/transactions/credit_card_credential',
      headers: {
        "cache-control": "no-cache",
        "access-token": this.props.email_preview.payment_service_access_token
      },
      success: function(response) {
        xendit_key = response.token;
      }.bind(this),
      error: function(response) {
        this.props.setErrorMessage("Informasi Kartu Kredit salah, silahkan coba kembali atau coba dengan kartu lainnya.");
      }.bind(this)
    });

    if (xendit_key != null) {
      // Set Xendit Key
      window.Xendit.setPublishableKey(xendit_key);

      // Request a token from Xendit:
      window.Xendit.card.createToken({
        amount: this.props.transaction.balance_due,
        card_number: credit_card_info.cc_number,
        card_exp_month: credit_card_info.cc_expiry_month,
        card_exp_year: credit_card_info.cc_expiry_year,
        card_cvn: credit_card_info.cc_cvv,
        is_multiple_use: false
      }, xenditResponseHandler.bind(this));
    }

    function xenditResponseHandler (err, creditCardCharge) {
      if (err) {
        // Show the errors on console
        console.log(err);
        this.props.setLoading(false);
        this.props.setErrorMessage("Kartu Kredit Anda tidak dapat diproses karena: (" + err.error_code + ")" + " - " + err.message);
        return;
      }

      if (creditCardCharge.status === 'VERIFIED') {
        // Get the token ID:
        var token = creditCardCharge.id;
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
            "type": "credit_card",
            "credit_card": {
                "token": token,
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
          statusCode: {
            500: function() {
              this.props.setErrorMessage("general");
              this.props.initCreditCardForm()
            }.bind(this)
          },
          success: function(response) {
            if (response.payments.length == 0) {
              this.props.setErrorMessage("credit_card")
              this.props.initCreditCardForm()
            }
            else {
              this.props.handleCreditCardSuccess()
              this.props.handleSuccessPayment()
            }
          }.bind(this),
          error: function(response) {
            this.props.setErrorMessage("general");
            this.props.initCreditCardForm()
          }.bind(this),
          data: sendInfo
        });
      } else if (creditCardCharge.status === 'IN_REVIEW') {
        this.props.initCreditCardSecureAuth(creditCardCharge.payer_authentication_url)
      } else if (creditCardCharge.status === 'FAILED') {
        // show failed reason on the console
        this.props.initCreditCardForm()
        this.props.setErrorMessage("Pembayaran Anda gagal di proses. Mohon coba kembali, atau gunakan kartu lainnya. Alasan: " + creditCardCharge.failure_reason + ".")
      }

      this.props.setLoading(false);
    }
  }


  render() {
    var CCStep = null
    if (this.props.cc_step == 2 && this.props.cc_secure_auth_url != null) {
      CCStep = <SecureAuthIframe url={this.props.cc_secure_auth_url} />
    } else if (this.props.cc_step == 3) {
      CCStep = <Redirect to='/?success_payment=true'/>
    }
    else {
      CCStep = <CreditCardForm handleCreditCardPayment={this.handleCreditCardPayment.bind(this)}/>
    }

    return(
      <div className="payment_flows_container">
        <div className="row zero_margin">
          <div className="title_text float-left"> Kartu Kredit </div>
          <div className="float-right">
            <img src="https://s3-ap-southeast-1.amazonaws.com/jurnal-assets/images/subscription/mastercard_logo.png" width="50" height="25" alt="MASTERCARD" style={{margin: "0 1px"}}/>
            <img src="https://s3-ap-southeast-1.amazonaws.com/jurnal-assets/images/subscription/visa_logo.png" width="50" height="20" alt="VISA" />
          </div>
        </div>
        {CCStep}
      </div>
    )
  }
}
