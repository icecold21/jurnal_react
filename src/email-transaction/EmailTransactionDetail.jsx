/* eslint no-undef: 0 */

import React from 'react'
import { Link } from 'react-router-dom'
import NumberFormat from 'react-number-format'
import Globals from './Globals'

function StatusLabel(props) {
  if (props.status_label == null) {
    return null;
  }
  var label_class = null
  if (props.status_label === I18n.t('transaction_status.open')) { label_class = 'open' }
  else if (props.status_label === I18n.t('transaction_status.paid')) { label_class = 'paid' }
  else if (props.status_label === I18n.t('transaction_status.partial')) { label_class = 'partial' }
  else if (props.status_label === I18n.t('transaction_status.overdue')) { label_class = 'overdue' }
  return (
    <div>
      <i id="status_label" style={{display:'inline', verticalAlign:'35%'}} className={"fa fa-circle fa-lg "+label_class}></i>
      <div className="transaction_status" style={{display:'inline'}}>{props.status_label}</div>
    </div>
  )
}

export default class EmailTransactionDetail extends React.Component {
  checkPaid(transaction_status){
    return transaction_status === I18n.t('transaction_status.paid')
  }

  render() {
    return (
      <div className="main_content">
        <div className="header_container">
          <div className="row">
            <div className="col-xs-5 col-sm-5 col-md-5 col-lg-5">
              <div className="ribbon_header">
                <span>
                  <div className="transaction_label">{this.props.email_preview.type_label} #{this.props.transaction.transaction_no}</div>
                  <div className="with_label" style={{display:'inline'}}>{I18n.t('transaction_email.from-label')}</div>
                  <div className="person_style" style={{display:'inline'}}>{this.props.transaction.person_name}</div>
                </span>
              </div>
            </div>
            <div className="col-xs-7 col-sm-7 col-md-7 col-lg-7 text-right">
              <div className="balance_due_label">{I18n.t('transaction_email.balance-due-label')}</div>
              <div className="balance_due_amount">{this.props.transaction.balance_due_text}</div>
            </div>
          </div>
          <div className="row status_container">
            <div className="col-xs-5 col-sm-5 col-md-5 col-lg-5">
              <div className="status_label">{I18n.t('transaction_email.status-label')}</div>
              <StatusLabel status_label={this.props.email_preview.status_label} />
            </div>
            { this.checkPaid(this.props.email_preview.status_label) || !this.props.payment_service_active ?
              <a target="_new" href={Globals.rails_app_base_url + "/email_previews/transaction_pdf.pdf?id=" + this.props.email_preview.custom_id} className="save_links col-xs-7 col-sm-7 col-md-7 col-lg-7 text-right">
                Simpan ke PDF
              </a>
              :
              <div className="col-xs-7 col-sm-7 col-md-7 col-lg-7 text-right">
                <div style={{marginBottom:'10px'}}>
                  <Link to="/payment" className="pay_now_button pay_now_border text-center">{I18n.t('transaction_email.pay-now-label')}</Link>
                </div>
                <div>
                  <a target="_new" href={Globals.rails_app_base_url + "/email_previews/transaction_pdf.pdf?id=" + this.props.email_preview.custom_id} className="save_links text-right" style={{paddingRight:'0'}}>
                    Simpan ke PDF
                  </a>
                </div>
              </div>
            }
          </div>
        </div>
        <div className="iframe_container">
          <div className="iframe_wrapper">
            <iframe src={Globals.rails_app_base_url + "/email_previews/transaction_pdf.pdf?id=" + this.props.email_preview.custom_id}/>
          </div>
        </div>
      </div>
    )
  }
}
