import { useState, useEffect } from "react";
import "./pages_styles/loginpage.css";
import { Registration } from "../components/registration";
import { Navbar } from "../components/navbar";

function RegistrationPage() {
  return (
    <div>
      <Navbar></Navbar>
      <Registration></Registration>
    </div>
  );
}

export { RegistrationPage };
