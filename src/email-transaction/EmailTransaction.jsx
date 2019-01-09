/* eslint no-undef: 0 */

import React from 'react'
import $ from 'jquery'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import createHistory from 'history/createBrowserHistory'

import EmailTransactionPayment from './EmailTransactionPayment'
import EmailTransactionDetail from './EmailTransactionDetail'
import EmailTransactionBreadcrumb from './EmailTransactionBreadcrumb'
import Globals from './Globals'

import './EmailTransaction.css'

export default class EmailTransaction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email_preview: null,
      transaction: null,
      available_payment_methods: null,
      breadcrumb_step: 1,
      success_payment: false,
      error_message: null
    }
  }

  // type "credit_card" or "general" or "reset"
  setErrorMessage(type) {
    var message = Globals.error_message_general
    if (type == "credit_card") {
      message = Globals.error_message_cc
    }
    else if (type == "reset") {
      message = null
    }
    else if (type == "general") {
      message = Globals.error_message_general
    }
    else if (type != null) {
      message = type
    }

    this.setState({
      error_message: message
    });
  }

  componentDidMount() {
    var current_url = new URL(window.location.href)
    var url_query_hash = current_url.search.substr(1)
      .split("&")
      .map( el => el.split("=") )
      .reduce( (pre, cur) => { pre[cur[0]] = cur[1]; return pre; }, {} );

    var custom_id = url_query_hash['id']

    if (custom_id != null) {
      var get_url = Globals.rails_app_base_url + "/api/v1/email_previews/detail?id=" + custom_id
      var data_response = null

      // GET EMAIL PREVIEW DETAIL
      $.ajax({
        type: "GET",
        dataType: 'json',
        url: get_url,
        async: false,
        success: function(response) {
          data_response = response
          this.setState({
            email_preview: data_response,
            transaction: data_response.transaction,
            success_payment: (url_query_hash['success_payment'] === "true" ? true : false)
          });
        }.bind(this),
        error: function(response) {
          this.setErrorMessage("Transaksi yang Anda cari tidak tersedia.");
        }.bind(this)
      });

      if (data_response != null && data_response.payment_service_access_token != null
                                && ((data_response.transaction.transaction_type_id == 1 &&
                                      data_response.transaction.transaction_status_id != 3)||
                                    (data_response.transaction.transaction_type_id == 3 &&
                                      data_response.transaction.has_invoice == false))
                                && data_response.transaction.balance_due > 0) {
        // GET AVAILABLE PAYMENT OPTIONS
        $.ajax({
          type: "GET",
          dataType: 'json',
          url: Globals.payment_service_base_url + '/api/transactions/available_payment_options',
          headers: {
            "cache-control": "no-cache",
            "access-token": data_response.payment_service_access_token
          },
          success: function(response) {
            this.setState({
              available_payment_methods: response
            });
          }.bind(this),
          error: function(response) {
            this.setErrorMessage("Metode pembayaran dengan Jurnal Pay tidak tersedia.");
          }.bind(this)
        });
      }
    }
  }

  handleUpdateBreadcrumbStep(step) {
    this.setState({
      breadcrumb_step: step
    });
  }

  handleSuccessPayment() {
    this.setState({
      success_payment: true,
      breadcrumb_step: 3
    });
  }


  render() {
    var payment_service_active = (this.state.available_payment_methods != null && (this.state.available_payment_methods.virtual_account || this.state.available_payment_methods.credit_card))

    if (this.state.email_preview == null) {
      return (
        <div className="transaction_not_available container_full_width">
          <div className="transaction_not_available box">
            <i className="fa fa-times red_icon" aria-hidden="true" />
            <div>Transaksi tidak ditemukan</div>
          </div>
          <a href="/">Kembali ke halaman Login</a>
        </div>
      )
    }
    else {
      return (
        <Router basename="/email_previews/detail" history={createHistory}>
          <div className="email_transaction_detail">
            <div className="blue_void">
              { payment_service_active == true && this.state.email_preview.company_currency_id == 1 &&
                <EmailTransactionBreadcrumb step={this.state.breadcrumb_step} transaction_status={this.state.success_payment || this.state.email_preview.status_label === I18n.t('transaction_status.paid')}/>
              }
              {this.state.error_message != null &&
                <div className="header_container et_limited_sizing">
                  <div className="alert_container">
                    <div className='flex_center background_light_red row zero_margin shadow alert_box_height'>
                      <div className='fa fa-times alert_holder red_notif'></div>
                      <div className='alert_content red_notif'>
                        {this.state.error_message}
                      </div>
                    </div>
                  </div>
                </div>
              }
              <Switch>
                <Route path="/" exact render={() => (<EmailTransactionDetail email_preview={this.state.email_preview}
                                                                              transaction={this.state.transaction}
                                                                              available_payment_methods={this.state.available_payment_methods}
                                                                              success_payment={this.state.success_payment}
                                                                              payment_service_active={payment_service_active} />)}/>
                <Route path="/payment" render={() => (<EmailTransactionPayment show_payment_method={this.state.payment_show_methods}
                                                                                email_preview={this.state.email_preview}
                                                                                transaction={this.state.transaction}
                                                                                step={this.state.payment_step}
                                                                                available_payment_methods={this.state.available_payment_methods}
                                                                                handleUpdateBreadcrumbStep={this.handleUpdateBreadcrumbStep.bind(this)}
                                                                                handleSuccessPayment={this.handleSuccessPayment.bind(this)}
                                                                                setErrorMessage={this.setErrorMessage.bind(this)} />)} />
              </Switch>
              <div className="col-xs-6 col-sm-6 col-md-6 col-lg-6 footer-text left">
                 {I18n.t("footer-payment-left",{current_year: new Date().getFullYear()})}
              </div>
              <div className="col-xs-6 col-sm-6 col-md-6 col-lg-6 footer-text right text-right">
                {I18n.t("footer-payment-right",{company_name: this.state.transaction.company_name})}
                <a href="https://www.jurnal.id/" className="link-text">{I18n.t("footer-click-here")}</a>
                {I18n.t("footer-check-it-out")}
              </div>
            </div>
          </div>
        </Router>
      )
    }
  }
}
