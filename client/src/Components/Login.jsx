import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

// Define validation schema
const schema = yup.object().shape({
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  role: yup.string().oneOf(["Company", "Individual"], "Role is required").required("Role is required"),
});

function Login() {
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(""); // Stores error message
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/login", data);
      console.log(response.data.message);
      localStorage.setItem("data", JSON.stringify(response.data.result));
      navigate("/onBoard");
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Something went wrong!";
      console.log(errorMsg);
      setToastMessage(errorMsg);
      setTimeout(() => setToastMessage(""), 2000); // Hide toast after 2 seconds
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen text-center flex flex-col overflow-hidden items-center justify-center">
      {/* Toast Notification */}
     

      <div className="flex flex-col gap-6 text-left w-80">
        <h1 className="text-5xl">Welcome Back!</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <input {...register("email")} className="input input-bordered" placeholder="Email" />
          <p className="text-red-500 text-left">{errors.email?.message}</p>

          <input {...register("password")} type="password" className="input input-bordered" placeholder="Password" />
          <p className="text-red-500 text-left">{errors.password?.message}</p>

          <select {...register("role")} className="select select-bordered">
            <option value="">Select your role</option>
            <option value="Company">Company</option>
            <option value="Individual">Individual</option>
          </select>
          <p className="text-red-500 text-left">{errors.role?.message}</p>

          <button type="submit" className="btn btn-primary">
            {loading ? <span className="loading loading-spinner loading-sm"></span> : "Login"}
          </button>
          {toastMessage && (
        <div className=" alert alert-error  shadow-lg text-center flex items-center justify-center">
          <p className="font-medium">{toastMessage}</p>
        </div>
      )}
        </form>

        <p onClick={() => navigate("/signin")} className="text-md text-center hover:cursor-pointer">
          New User? <b>Sign Up</b>
        </p>
      </div>
    </div>
  );
}

export default Login;
