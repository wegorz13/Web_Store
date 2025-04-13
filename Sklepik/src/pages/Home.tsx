import { Searcher } from "../components/searcher";
import { Navbar } from "../components/navbar";
import "./pages_styles/home.css";

function Home() {
  return (
    <div className="home">
      <Navbar></Navbar>
      <Searcher></Searcher>
    </div>
  );
}

export { Home };
