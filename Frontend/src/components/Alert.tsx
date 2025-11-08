import React, { useEffect, useState } from "react";
import { useAlert } from "../hooks/useAlert";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const Alert: React.FC = () => {
  const { alert, clearAlert } = useAlert();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (alert) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [alert]);

  if (!alert) return null;

  const isSuccess = alert.type === "success";
  const isError = alert.type === "error";

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => clearAlert(), 300); // Esperar la animación antes de limpiar
  };

  return (
    <>
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes slideOutRight {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%);
              opacity: 0;
            }
          }

          .alert-container {
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            min-width: 300px !important;
            max-width: 400px !important;
            padding: 16px 20px !important;
            border-radius: 12px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2) !important;
            font-weight: 600 !important;
            z-index: 10000 !important;
            border: 2px solid ${isSuccess ? "#c3e6cb" : isError ? "#f5c6cb" : "#b3d7ff"} !important;
            backdrop-filter: blur(10px) !important;
            animation: ${isVisible ? "slideInRight 0.3s ease-out" : "slideOutRight 0.3s ease-in"} !important;
          }

          .alert-success {
            background-color: #d4edda !important;
            color: #155724 !important;
          }

          .alert-error {
            background-color: #f8d7da !important;
            color: #721c24 !important;
          }

          .alert-info {
            background-color: #cce5ff !important;
            color: #004085 !important;
          }
        `}
      </style>
      <div
        className={`alert-container ${isSuccess ? 'alert-success' : isError ? 'alert-error' : 'alert-info'}`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <span style={{ marginRight: 12, flexShrink: 0 }}>
            {isSuccess && <CheckCircle2 color="#155724" size={24} />}
            {isError && <AlertCircle color="#721c24" size={24} />}
            {!isSuccess && !isError && (
              <CheckCircle2 color="#004085" size={24} />
            )}
          </span>
          <span style={{ flex: 1, fontSize: "14px", lineHeight: "1.4" }}>
            {alert.message}
          </span>
        </div>
        <button
          onClick={handleClose}
          style={{
            background: "none",
            border: "none",
            color: isSuccess ? "#155724" : isError ? "#721c24" : "#004085",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: "12px",
            flexShrink: 0,
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isSuccess ? "#c3e6cb" : isError ? "#f5c6cb" : "#b3d7ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          aria-label="Cerrar alerta"
        >
          <X size={16} />
        </button>
      </div>
    </>
  );
};

export default Alert;
