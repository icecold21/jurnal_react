import React from 'react';
import $ from 'jquery'
import { Link, Redirect } from 'react-router-dom'
import NumberFormat from 'react-number-format'

import BankSelector from './EmailTransactionBankSelector'

function getBankIcon(bank_code) {
 if (bank_code == 'BCA') {
   return <img src="https://s3-ap-southeast-1.amazonaws.com/jurnal-assets/images/icon/ibca.png" width="80" height="40" alt={bank_code} />
 } else if (bank_code == 'BNI') {
   return <img src="https://s3-ap-southeast-1.amazonaws.com/jurnal-assets/images/icon/ibni.png" width="80" height="40" alt={bank_code} />
 } else if (bank_code == 'MANDIRI') {
   return <img src="https://s3-ap-southeast-1.amazonaws.com/jurnal-assets/images/icon/imandiri.png" width="80" height="40" alt={bank_code} />
 } else if (bank_code == 'BRI') {
   return <img src="https://s3-ap-southeast-1.amazonaws.com/jurnal-assets/images/icon/bri.png" width="80" height="40" alt={bank_code} />
 } else {
   return null
 }
}

function VAStep0(props) {
  return(
    <div className="row zero_margin">
      <div className="notice_box">
        <div className="header blank_content" />
        <div className="content blank_content" />
      </div>
      <div className="button disabled">
        Lanjutkan Pembayaran
      </div>
    </div>
  )
}

function VAStep1(props) {
  var content = (
   <ul>
     {props.bank == 'MANDIRI' &&
       <li style={{color:'red'}}><strong>Hanya untuk pembayaran dari rekening sesama Mandiri, bila dari bank lain mohon untuk menggunakan virtual akun selain Bank Mandiri.</strong></li>
     }
     <li>Mohon review informasi dalam Invoice Anda sebelum melakukan pembayaran.</li>
     <li>Anda akan menerima kode pembayaran Virtual Account {props.bank} yang akan digunakan untuk melunaskan pembayaran tagihan ini.</li>
   </ul>
 )

  var bankIcon = getBankIcon(props.bank)

  return(
    <div className="row zero_margin">
      <div className="notice_box">

        <div className="header">
          <div className="text-left float-left" style={{padding: "0.6em 0.5em"}}>
            Mohon Baca Sebelum Melakukan Pembayaran
          </div>
          <div className="text-right">
            {bankIcon}
          </div>
        </div>

        <div className="content">
          {content}
        </div>
      </div>
      <button className="button success blue_proceed_btn" onClick={() => props.handleVAProceed()}>
        Lanjutkan Pembayaran
      </button>
    </div>
  )
}


function VAStep2(props) {
  class BuildPaymentInstruction extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        is_opened: false
      };
      this.handleToggle = this.handleToggle.bind(this)
    }

    componentDidMount() {
      this.setState({
        is_opened: false
      });
    }

    handleToggle() {
      this.setState({
        is_opened: !this.state.is_opened
      });
    }

    render() {
      return (
        <a data-toggle="collapse" data-target={"#"+this.props.id} onClick={this.handleToggle}>
          <div className='row zero_margin'>
            <div className='collapsible_link'>
              <div className="row zero_margin">
                <div className="float-left">
                  {this.props.title}
                </div>
                { this.state.is_opened ? (
                  <i className="fa fa-caret-right icon_positioned" aria-hidden="true" />
                ) : (
                  <i className="fa fa-caret-down icon_positioned" aria-hidden="true" />
                )}
              </div>
            </div>
            <div className='collapse collapsible_content' dangerouslySetInnerHTML={{__html: this.props.content}} id={this.props.id} />
          </div>
        </a>
      )
    }
  }

  function BuildVAInformation(props) {
    return (
      <div className='notice_box_blue'>
        <div className='header'>
          <div className='text-left'>
            {props.bank_code}
          </div>
        </div>
        <div className='content'>
          <div className='details'>
            <div className='row zero_margin'>
              <div className='detail_label'>
                Nomor Rekening VA
              </div>
              <div className='detail_description'>
                {': ' + props.account_number.match(/.{1,5}/g).join('-')}
              </div>
            </div>
            <div className='row zero_margin'>
              <div className='detail_label'>
                Nama Rekening
              </div>
              <div className='detail_description'>
                {': ' + props.account_holder}
              </div>
            </div>
            <div className='row zero_margin'>
              <div className='detail_label'>
                Jumlah Transfer
              </div>
              <div className='detail_description'>
                : <NumberFormat value={props.transfer_amount} displayType={'text'} thousandSeparator={'.'} decimalPrecision={true} decimalSeparator={','} prefix={'IDR '} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  var bank_code = props.va_transaction_info.virtual_account.bank_code

  var instructions_object = []

  if (props.va_transaction_info != null) {
    var instructions_given = props.va_transaction_info.instruction

    for (var i=0; i < instructions_given.length; i++) {
      instructions_object.push( <BuildPaymentInstruction title={instructions_given[i].title} content={instructions_given[i].content} key={i} id={'collapse'+i} /> )
    }
  }

  return (
    <div>
      <div className='row zero_margin'>
        <div className='text-left float-left title_text'>
          Bayar dengan {bank_code} Virtual Account
        </div>
        <div className='text-right'>
          { getBankIcon(bank_code) == null ? bank_code : getBankIcon(bank_code)}
        </div>
      </div>
      <div className='row zero_margin'>
        <hr className='divider' />
        <div className='h2_text margin_top_2em'>
          Mohon Transfer Kepada:
        </div>
        <BuildVAInformation account_number={props.va_transaction_info.virtual_account.account_number}
                            account_holder={props.va_transaction_info.virtual_account.name}
                            transfer_amount={props.va_transaction_info.virtual_account.amount}
                            bank_code={bank_code} />

        <div style={{marginBottom: "12px"}}>
          Langkah untuk Melakukan Pembayaran:
        </div>

        {instructions_object}

        <div className="row zero_margin">
          <button className='button success margin-top-24 blue_proceed_btn' onClick={() => props.handleVAConfirmPayment()}>
            Saya Sudah Melakukan Pembayaran
          </button>
          <button className='button margin-top-24 blue_proceed_btn' onClick={() => props.handleChooseDifferentPaymentMethod()}>
            Pilih Metode Pembayaran Lain
          </button>
        </div>
      </div>
    </div>
  )
}

function VAStep3(props) {
  function CalculatePaidAmount(props) {
    var payments = props.va_transaction_payments.payments;
    var payment_array = payments.map(function(x){ return x.status == "paid" ? x.amount : 0 });
    var amount_paid = (payment_array.length > 0) ? payment_array.reduce(function(sum,value){ return sum + value }) : 0;
    var amount = props.va_transaction_info.amount
    var remaining = amount - amount_paid

    var info_text = (payment_array.length == 0 ? "Pembayaran Anda tidak dapat ditemukan." :
                                                  `Anda telah membayar ${amount_paid} dari ${amount}, sisa tagihan ${remaining}.`)

    if (remaining == 0) {
      return (
        <Redirect to='/?success_payment=true'/>
      )
    } else {
      return (
        <div className='flex_center row zero_margin margin_bottom_2em shadow background_light_blue alert_box_height'>
          <div className='fa fa-exclamation-circle alert_holder blue_notif'></div>
          <div className='alert_content blue_notif'>
            {"Info: " + info_text}
          </div>
        </div>
      )
    }
  }


  return (
    <div>
      <CalculatePaidAmount va_transaction_payments={props.va_transaction_payments} va_transaction_info={props.va_transaction_info}/>
      <div className='row zero_margin'>
        <div className='h2_text'>
          Ikuti langkah berikut ini
        </div>
      </div>
      <div className='notice_box'>
        <div className='header'>
          <div className='text-left medium_text'>
            1. Informasi Virtual Account
          </div>
        </div>
        <div className='content smaller_padding row zero_margin'>
          <ul>
            <li>
              Pastikan pembayaran Anda ditujukan ke rekening yang telah diinformasikan sebelumnya.
            </li>
          </ul>
          <button className='button_smaller success blue_proceed_btn' onClick={() => props.goToVAStep2()}>
            Review Informasi Pembayaran
          </button>
        </div>
      </div>
      <div className='notice_box'>
        <div className='header'>
          <div className='text-left medium_text'>
            2. Cek Status Pembayaran
          </div>
        </div>
        <div className='content smaller_padding row zero_margin'>
          <ul>
            <li>
              Pembayaran Anda masih belum diterima, mohon cek kembali beberapa saat lagi.
            </li>
          </ul>
          <button className='button_smaller success blue_proceed_btn' onClick={() => props.handleVAConfirmPayment()}>
            Konfirmasi Ulang Pembayaran
          </button>
        </div>
      </div>
      <div className='notice_box'>
        <div className='header'>
          <div className='text-left medium_text'>
            3. Hubungi Support
          </div>
        </div>
        <div className='content smaller_padding row zero_margin'>
          <ul>
            <li>
              Jika Anda sudah mengikuti seluruh langkah-langkah di atas dan belum mendapatkan konfirmasi pembayaran, mohon hubungi support di:
            </li>
          </ul>
          <div className='text-right footer_text'>
            (021) 2902 5471 | <a style={{textDecoration: "underline"}}>support@jurnal.id</a>
          </div>
        </div>
      </div>
    </div>
  )
}


function VAStepSwitch(props) {
  var options = []
  $.each( props.available_banks, function(index, value) {
    options.push({value: value.bank_code, label: value.bank_code})
  });

  if (props.bank == null || props.step == 0) {
    return (
      <div>
        <div className="title_text"> Lanjutkan Pembayaran </div>
        <BankSelector data_option={options} handleVAUpdateBank={props.handleVAUpdateBank}/>
        <VAStep0 />
      </div>
    )
  } else if (props.bank != null ) {
    if (props.step == 1) {
      return (
        <div>
          <div className="title_text"> Proceed Payment </div>
          <BankSelector data_option={options} handleVAUpdateBank={props.handleVAUpdateBank}/>
          <VAStep1 bank={props.bank} step={props.step} handleVAProceed={props.handleVAProceed} />
        </div>
      )
    } else if (props.step == 2) {
      return (
        <VAStep2 va_transaction_info={props.va_transaction_info}
                  handleVAConfirmPayment={props.handleVAConfirmPayment}
                  handleChooseDifferentPaymentMethod={props.handleChooseDifferentPaymentMethod} />
      )
    } else if (props.step == 3) {
      return (
        <VAStep3 va_transaction_info={props.va_transaction_info}
                  va_transaction_payments={props.va_transaction_payments}
                  goToVAStep2={props.goToVAStep2}
                  handleVAConfirmPayment={props.handleVAConfirmPayment} />
      )
    }
  }

  return (
    null
  )
}


/*
  VA Steps:
    - 0: initialize, bank is not chosen, show blank box
    - 1: show chosen bank to proceed
    - 2: proceeded to get VA number
    - 3: clicked confirm payment, show not found/confirmed page
*/
export default class VirtualAccountFlow extends React.Component {
  render() {
    return(
      <div className="payment_flows_container">
        <VAStepSwitch bank={this.props.va_bank_selected}
                      step={this.props.va_step}
                      available_banks={this.props.va_banks_available}
                      va_transaction_info={this.props.va_transaction_info}
                      va_transaction_payments={this.props.va_transaction_payments}
                      goToVAStep2={this.props.goToVAStep2}
                      handleVAProceed={this.props.handleVAProceed}
                      handleVAUpdateBank={this.props.handleVAUpdateBank}
                      handleVAConfirmPayment={this.props.handleVAConfirmPayment}
                      handleChooseDifferentPaymentMethod={this.props.handleChooseDifferentPaymentMethod} />
      </div>
    )
  }
}
