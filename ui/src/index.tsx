import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './buttons.css';
import App from './App';
import i18n from './i18n/i18n';

ReactDOM.render(
  <React.StrictMode>
      <I18nextProvider i18n={ i18n }>
        <App />
      </I18nextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
