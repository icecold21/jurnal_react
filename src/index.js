import React from 'react';
import ReactDOM from 'react-dom';
import EmailTransaction from './email-transaction/EmailTransaction'


document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <EmailTransaction />,
    document.body.appendChild(document.createElement('div')),
  )
})
