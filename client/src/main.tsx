import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply theme configuration
document.documentElement.classList.add('dark');

createRoot(document.getElementById("root")!).render(<App />);
