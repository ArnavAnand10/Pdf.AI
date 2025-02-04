import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function OnboardingScreen() {
  let data = JSON.parse(localStorage.getItem("data"));
  const [mainLoader,setMainLoader] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadText, setUploadText] = useState("Uploading...");

  const navigate = useNavigate();

  useEffect(() => {
    setMainLoader(true)
    if (data == null) {
      navigate("/signin");
    }

    const checkNS = async ()=>{
      try{
        const response = await axios.get(`http://localhost:5000/check-namespace?email=${data.email}&role=${data.role}`)
        if(response.data.result==1){
          navigate('/dashboard')
        }
        
      }catch(e){
          console.log(e)
      }
      finally{
        setMainLoader(false)
      }
    }
    checkNS()
  }, []);

  // Dynamic AI-themed upload messages
  useEffect(() => {
    if (loading) {
      const messages = [
        " Initializing Neural Upload...",
        " Processing with Quantum Precision...",
        " Encrypting with Cybersecurity Protocols...",
        " Almost There... Deploying to the Matrix!"
      ];
      let index = 0;

      const interval = setInterval(() => {
        setUploadText(messages[index]);
        index = (index + 1) % messages.length;
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      setError("A file is required");
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("A file is required");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", data.email);
    formData.append("user_type", data.role);

    try {
      const response = await axios.post("http://127.0.0.1:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload Successful:", response.data);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Upload Error:", error);
      setError("File upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen text-center h-screen flex flex-col items-center justify-center overflow-x-hidden">
    { mainLoader ?    <span className="loading loading-dots  loading-lg"></span> :   <div className="flex flex-col p-4 gap-6">
        <h1 className="text-5xl mb-3">Upload Document to Get Started</h1>
        <input type="file" onChange={handleFileChange} className="file-input file-input-bordered w-full" />
        {error && <p className="text-red-500 text-left">{error}</p>}
        
        <button
          onClick={handleUpload}
          className="btn btn-primary w-full text-lg btn-md flex items-center justify-center gap-3"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-3">
              <span className="loading loading-dots t loading-lg"></span>
              <span className="text-md ">{uploadText}</span>
            </span>
          ) : (
            "Upload"
          )}
        </button>

        <p onClick={() => navigate("/login")} className=" text-sm hover:cursor-pointer">
          You can add more files later!
        </p>
      </div>
}
    </div>
  );
}

export default OnboardingScreen;
