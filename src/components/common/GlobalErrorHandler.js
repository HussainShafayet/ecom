import { useSelector, useDispatch } from "react-redux";
import {clearGlobalError} from "../../redux/slice/globalErrorSlice";

const GlobalErrorHandler = ({ children }) => {
  const { hasError, message } = useSelector(state => state.globalError);
  const dispatch = useDispatch();

  // Retry button to re-check API status
  const handleRetry = () => {
    dispatch(clearGlobalError());
    window.location.reload(); // Reload to check if API is back
  };

  if (hasError) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100vh",
        display: "flex", justifyContent: "center", alignItems: "center",
        backgroundColor: "#f8d7da", color: "#721c24", textAlign: "center", padding: "20px"
      }}>
        <div>
          <h2>⚠️ Error Detected</h2>
          <p>{message}</p>
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
