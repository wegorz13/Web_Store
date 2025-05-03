import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { ProductPage } from "./pages/ProductPage";
import { NoPage } from "./pages/NoPage";
import { CartPage } from "./pages/CartPage";
import { RegistrationPage } from "./pages/RegistrationPage";
import { LoginPage } from "./pages/LoginPage";
import { OrderPage } from "./pages/OrderPage";
import { OrdHistoryPage } from "./pages/OrdHistoryPage";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home></Home>}></Route>
          <Route
            path="/product/:id"
            element={<ProductPage></ProductPage>}
          ></Route>
          <Route path="/*" element={<NoPage></NoPage>}></Route>
          <Route path="/cart" element={<CartPage></CartPage>}></Route>
          <Route
            path="/registration"
            element={<RegistrationPage></RegistrationPage>}
          ></Route>
          <Route path="/login" element={<LoginPage></LoginPage>}></Route>
          <Route path="/order" element={<OrderPage></OrderPage>}></Route>
          <Route
            path="/order/history"
            element={<OrdHistoryPage></OrdHistoryPage>}
          ></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
