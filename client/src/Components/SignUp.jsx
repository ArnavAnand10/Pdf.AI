import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import url from "../utils/url";

// Define validation schema
const schema = yup.object().shape({
  email: yup.string().email("Invalid email format").required("Email is required"),
  username: yup.string().min(3, "Username must be at least 3 characters").required("Username is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  role: yup.string().oneOf(["Company", "Individual"], "Role is required").required("Role is required"),
});

function SignUP() {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState("");
  const [loader, setLoader] = useState(false); // Stores error message

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    console.log("Sign Up Data:", data);
    setLoader(true);
    try {
     const response = await axios.post(`${url}register`, data);
     console.log(response.data.message);
     
     navigate("/login");

    } catch (error) {
      console.log(error.response.data.error || error);
      
      const errorMsg = error.response?.data?.error || "Something went wrong!";
      console.log(errorMsg);
      setToastMessage(errorMsg);
      setTimeout(() => setToastMessage(""), 2000); // Hide toast after 2 seconds
    }finally{
      setLoader(false);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden items-center justify-center">
      {/* Toast Notification */}
    

      <div className="flex flex-col gap-6 text-center">
        <h1 className="text-5xl">Get Started!</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-80">
          <input {...register("email")} className="input input-bordered" placeholder="Email" />
          <p className="text-red-500 text-left">{errors.email?.message}</p>

          <input {...register("username")} className="input input-bordered" placeholder="Username" />
          <p className="text-red-500 text-left">{errors.username?.message}</p>

          <input {...register("password")} type="password" className="input input-bordered" placeholder="Password" />
          <p className="text-red-500 text-left">{errors.password?.message}</p>

          <select {...register("role")} className="select select-bordered">
            <option value="">Select your role</option>
            <option value="Company">Company</option>
            <option value="Individual">Individual</option>
          </select>
          <p className="text-red-500 text-left">{errors.role?.message}</p>

          <button  type="submit" className="btn btn-primary">{loader ? <span className="flex items-center gap-3">
            <span className="loading loading-spinner loading-md"></span>
            </span> : "Get Started" }</button>
          {toastMessage && (
        <div className=" alert alert-error  shadow-lg text-center flex items-center justify-center">
          <p className="font-medium">{toastMessage}</p>
        </div>
      )}
        </form>

        <p onClick={() => navigate("/login")} className="text-md hover:cursor-pointer">
          Already a User? <b>Log in</b>
        </p>
      </div>
    </div>
  );
}

export default SignUP;
