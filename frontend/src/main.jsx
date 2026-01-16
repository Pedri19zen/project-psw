import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './styles/variables.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Este Provider é como uma antena que liga a tua app ao Google */}
    <GoogleOAuthProvider clientId="250749350765-8nnv7dfbr3bv1o891hqqhnnhomfo6i2j.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);