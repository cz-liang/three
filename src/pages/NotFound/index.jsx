import { useNavigate } from "react-router-dom";
import "./index.scss";

const NotFound = () => {
  const navigate = useNavigate();
  const goHome = () => {
    navigate("/");
  };
  return (
    <div className="not-found">
      <div className="not-found-container">
        <h1>404</h1>
        <p>Page not found ......</p>
        <div onClick={goHome} className="home-link">
          Go back to Home
        </div>
      </div>
    </div>
  );
};

export default NotFound;
