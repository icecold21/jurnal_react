import $ from 'jquery'

class Globals {
  constructor() {
    if ($('#app_env_id').attr('data') == 'production') {
      this.rails_app_base_url = new URL(window.location.href).origin
      this.payment_service_base_url = 'https://payment.jurnal.id'
    }
    else {
      this.rails_app_base_url = new URL(window.location.href).origin
      this.payment_service_base_url = 'https://payment.jurnal.id'
    }
    this.error_message_general = "Maaf, telah terjadi kesalahan dan pembayaran Anda belum terproses. Silahkan coba kembali atau hubungi support kami: support@jurnal.id"
    this.error_message_cc = "Pembayaran Anda gagal di proses. Mohon coba kembali, atau gunakan kartu lainnya."
  }

}

export default (new Globals)