import { useState } from "react";
import "./App.css";
import SignUP from "./Components/SignUp";
import OnboardingScreen from "./Components/OnboardingScreen";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import UploadFiles from "./Components/UploadFiles";

function App() {
 

  return (
   
    <Routes>
      <Route path='/signin' element={<SignUP/>}/>
      <Route path='/onBoard' element={<OnboardingScreen/>}/>
      <Route path = '/login' element={<Login/>} />
      <Route path = '/dashboard' element={<Dashboard/>} />
      <Route path="/uploadfiles" element={<UploadFiles/>} />


    </Routes>
   

  )
}

export default App;
