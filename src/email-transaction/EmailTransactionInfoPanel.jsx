import React from 'react'
import Globals from './Globals'

class DetailContent extends React.Component {
  render() {
    return (
      <div className={`row zero_margin ${this.props.onlyMobile ? "only_mobile_900" : ""}`}>
        <div className="detail_label"> {this.props.label} </div>
        <div className={`detail_description ${this.props.bold ? "bold" : ""}`}> {this.props.description} </div>
      </div>
    )
  }
}

export default class EmailTransactionInfoPanel extends React.Component {
  render() {
    return (
      <div className="transaction_detail">
        <div className="heading_text_thin">
          {this.props.transaction.company_name}
        </div>
        <div className="title_text">
          {this.props.transaction.transaction_type_name}
        </div>
        <div className="details">
          <DetailContent label="No." description={this.props.transaction.transaction_no} />
          <DetailContent label="Jatuh Tempo" description={this.props.transaction.due_date} />
          <DetailContent label="Jumlah Total" description={this.props.transaction.original_amount_text} />
          <DetailContent label="Sisa Tagihan" description={this.props.transaction.balance_due_text} bold={true} onlyMobile={true} />
        </div>

        <div className="text-right only_desktop_900">
          <div className="label_text">
            Sisa Tagihan
          </div>
          <div className="title_text">
            {this.props.transaction.balance_due_text}
          </div>
        </div>

        <div className="text-right">
          <a target="_new" href={Globals.rails_app_base_url + "/email_previews/transaction_pdf.pdf?id=" + this.props.email_preview.custom_id}>
            Lihat Detail
          </a>
        </div>
      </div>
    )
  }
}

