import "./global.css";
import { BrowserRouter } from "react-router-dom";
import LandingPage from "./pages/LandingPage";

const App = () => (
  <BrowserRouter>
    <LandingPage />
  </BrowserRouter>
);

export default App;