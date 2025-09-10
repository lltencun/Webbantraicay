import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../Context/ShopContext";

const Login = () => {
  const [currentStage, setCurrentStage] = useState("Login");
  const { token, setToken, navigate, backendUrl, getUserData } = useContext(ShopContext);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      // Validate form
      if (currentStage === "Sign Up") {
        if (!firstName.trim()) {
          toast.error("First name is required");
          return;
        }
        if (!lastName.trim()) {
          toast.error("Last name is required");
          return;
        }
      }
      if (!email.trim()) {
        toast.error("Email is required");
        return;
      }
      if (!password) {
        toast.error("Password is required");
        return;
      }
      if (currentStage === "Sign Up" && password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }

      let response;
      if (currentStage === "Sign Up") {
        response = await axios.post(`${backendUrl}/api/user/register`, {
          firstName,
          lastName,
          email,
          password,
        });
      } else {
        // Login
        response = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password,
        });

        if (response.data.success) {
          // Lưu token
          localStorage.setItem("token", response.data.token);
          setToken(response.data.token);
          
          // Load user data và cart
          await getUserData();
          
          toast.success("Login successful!");
          navigate("/");
        }
      }      
      if (response.data.success) {
        // Save token and user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userData", JSON.stringify(response.data.user));
        setToken(response.data.token);
        await getUserData(); // Load user data after successful login
        
        if (currentStage === "Sign Up") {
          toast.success("Account created successfully!");
        }
        
        navigate("/");
      } else {
        // Show error message from server
        toast.error(response.data.message || "Authentication failed");
      }
    } catch (error) {
      // Show error message for network/server errors
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {currentStage === "Sign Up"
              ? "Create a new account"
              : "Sign in to your account"}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={onSubmitHandler}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            {currentStage === "Sign Up" && (
              <>
                <div>
                  <label htmlFor="firstName" className="sr-only">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="sr-only">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </>
            )}
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                  currentStage === "Sign Up" ? "" : "rounded-t-md"
                } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {currentStage === "Sign Up" ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </form>
        <div className="text-center">
          <button
            onClick={() => {
              setCurrentStage(
                currentStage === "Sign Up" ? "Sign In" : "Sign Up"
              );
              setName("");
              setEmail("");
              setPassword("");
            }}
            className="font-medium text-black-600 hover:text-white-500"
          >
            {currentStage === "Sign Up"
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
