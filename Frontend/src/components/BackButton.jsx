import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "../styles/BackButton.css";

function BackButton({ fallbackTo = "/", label = "Back", className = "", forceFallback = false }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (!forceFallback && window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackTo);
  };

  return (
    <button
      type="button"
      className={`app-back-button ${className}`.trim()}
      onClick={handleBack}
    >
      <FaArrowLeft aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

export default BackButton;
