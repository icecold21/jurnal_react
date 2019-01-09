import React from 'react'
import ClassNames from 'classnames'

class BreadcrumbProgress extends React.Component {
  render() {
    return (
      <div className="breadcrumb_progress">
        <div className={ClassNames("breadcrumb_icon", {active: !!this.props.is_active}, {disabled: !!this.props.paid})}>
          {this.props.step}
        </div>
        <div className={ClassNames("breadcrumb_label", {active: !!this.props.is_active}, {disabled: !!this.props.paid})}>
          {this.props.label}
        </div>
      </div>
    )
  }
}

export default class EmailTransactionBreadcrumb extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="breadcrumb_content">
        <div className="row zero_margin" style={{padding: "2em"}}>
          <BreadcrumbProgress label='REVIEW DETAIL' step='1' is_active={this.props.step === 1} paid={this.props.transaction_status}/>
          <div className="line_progress"/>
          <BreadcrumbProgress label='SELECT PAYMENT' step='2' is_active={this.props.step === 2} paid={this.props.transaction_status}/>
          <div className="line_progress" />
          <BreadcrumbProgress label='MAKE PAYMENT' step='3' is_active={this.props.step === 3} paid={this.props.transaction_status}/>
        </div>
      </div>
    )
  }
}
