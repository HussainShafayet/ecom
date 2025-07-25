import { useSelector, useDispatch } from "react-redux";
import {clearAllErrors} from "../../redux/slice/globalErrorSlice";

const GlobalErrorHandler = ({ children }) => {
  const { globalError } = useSelector(state => state.globalError);
  const dispatch = useDispatch();

  // Retry button to re-check API status
  const handleRetry = () => {
    dispatch(clearAllErrors());
    window.location.reload(); // Reload to check if API is back
  };

  if (globalError) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100vh",
        display: "flex", justifyContent: "center", alignItems: "center",
        backgroundColor: "#f8d7da", color: "#721c24", textAlign: "center", padding: "20px"
      }}>
        <div>
          <h2>⚠️ Error Detected</h2>
          <p>{globalError}</p>
          <button onClick={handleRetry} style={{
            backgroundColor: "#721c24", color: "white", border: "none",
            padding: "10px 20px", cursor: "pointer", marginTop: "10px"
          }}>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return children; // ✅ Render normal content if no error
};

export default GlobalErrorHandler;
