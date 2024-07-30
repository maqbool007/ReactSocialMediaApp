import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import "bootstrap/dist/css/bootstrap.min.css"
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from './store/authcontext.jsx';
import "./index.css"

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
  <AuthProvider>
      <BrowserRouter>
    <App />
      </BrowserRouter>
</AuthProvider>
  </React.StrictMode>,
)
