// src/components/Modal.jsx
import React from 'react'
import ReactDOM from 'react-dom'

export default function Modal({ title, children, onClose }) {
  return ReactDOM.createPortal(
    <div
      className="modal-backdrop"
      onClick={onClose}
    >
      <div
        className="modal-container"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <button
            onClick={onClose}
            className="modal-back-button"
            aria-label="voltar"
          >
            ←
          </button>
          <h3 className="modal-title">{title}</h3>
          <div className="modal-spacer" />
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
