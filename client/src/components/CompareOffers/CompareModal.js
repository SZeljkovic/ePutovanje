import React from "react";
import "./CompareOffers.css"; // koristi iste stilove za overlay i modal

const CompareModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          style={{
            float: "right",
            border: "none",
            background: "transparent",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default CompareModal;
