// OfferDetailsModal.jsx
import React from "react";
import OfferDetails from "./OfferDetails";

const OfferDetailsModal = ({ id, onClose }) => {
  if (!id) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-[1000]"
      onClick={onClose} // klik na overlay zatvara modal
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative z-[1001]"
        onClick={(e) => e.stopPropagation()} // sprječava zatvaranje kada se klikne unutar modala
      >
        {/* Dugme za zatvaranje */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black text-2xl"
        >
          ×
        </button>

        {/* Renderujemo OfferDetails i prosleđujemo mu modalId */}
        <OfferDetails modalId={id} />
      </div>
    </div>
  );
};

export default OfferDetailsModal;
