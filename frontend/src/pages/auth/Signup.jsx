import React, { useRef, useState } from "react";
import { User, Mail, Home, Lock, ChevronDown } from "lucide-react";
import {handleSignup} from "@/services/authApi";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Signup = () => {
  const [addresses, setAddresses] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();
  // Refs for form inputs
  const usernameRef = useRef();
  const emailRef = useRef();
  const streetRef = useRef();
  const cityRef = useRef();
  const stateRef = useRef();
  const zipRef = useRef();
  const countryRef = useRef();
  const passwordRef = useRef();
  const roleRef = useRef();

  const validate = () => {
    const newErrors = {};

    if (!usernameRef.current.value.trim()) {
      newErrors.username = "Username is required";
    }

    if (!emailRef.current.value.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(emailRef.current.value)) {
      newErrors.email = "Email is invalid";
    }

    if (!streetRef.current.value.trim()) {
      newErrors.street = "Street is required";
    }

    if (!cityRef.current.value.trim()) {
      newErrors.city = "City is required";
    }

    if (!stateRef.current.value.trim()) {
      newErrors.state = "State is required";
    }

    if (!zipRef.current.value.trim()) {
      newErrors.zip = "ZIP code is required";
    }

    if (!countryRef.current.value.trim()) {
      newErrors.country = "Country is required";
    }

    if (!passwordRef.current.value) {
      newErrors.password = "Password is required";
    } else if (passwordRef.current.value.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      setIsSubmitting(true);
      setApiError(null); // Reset previous errors

      const address = {
        street: streetRef.current.value,
        city: cityRef.current.value,
        state: stateRef.current.value,
        zip: zipRef.current.value,
        country: countryRef.current.value,
      };

      const userData = {
        username: usernameRef.current.value,
        email: emailRef.current.value,
        address: address,
        password: passwordRef.current.value,
        role: roleRef.current.value,
      };

      try {
        setAddresses([...addresses, address]);
        await handleSignup(userData);
        toast.success("Signup Success")
        navigate("/signin"); // Navigate on success
      } catch (error) {
        console.error("Signup error:", error);
        toast("Signup Fail")
        setApiError(
          error.response?.data?.message || "Signup failed. Please try again."
        );
      } finally {
        setIsSubmitting(false); // Reset submitting state
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  ref={usernameRef}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.username ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="john_doe"
                />
              </div>
              {errors.username && (
                <p className="mt-2 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  ref={emailRef}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Address Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 flex items-center">
                <Home className="h-4 w-4 mr-2 text-gray-500" />
                Address Information
              </h3>

              {/* Street */}
              <div>
                <label
                  htmlFor="street"
                  className="block text-sm font-medium text-gray-700"
                >
                  Street
                </label>
                <input
                  id="street"
                  name="street"
                  type="text"
                  ref={streetRef}
                  className={`block w-full mt-1 px-3 py-2 border ${
                    errors.street ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="123 Main St"
                />
                {errors.street && (
                  <p className="mt-2 text-sm text-red-600">{errors.street}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700"
                >
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  ref={cityRef}
                  className={`block w-full mt-1 px-3 py-2 border ${
                    errors.city ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="New York"
                />
                {errors.city && (
                  <p className="mt-2 text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* State */}
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700"
                  >
                    State
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    ref={stateRef}
                    className={`block w-full mt-1 px-3 py-2 border ${
                      errors.state ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="NY"
                  />
                  {errors.state && (
                    <p className="mt-2 text-sm text-red-600">{errors.state}</p>
                  )}
                </div>

                {/* ZIP */}
                <div>
                  <label
                    htmlFor="zip"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ZIP Code
                  </label>
                  <input
                    id="zip"
                    name="zip"
                    type="text"
                    ref={zipRef}
                    className={`block w-full mt-1 px-3 py-2 border ${
                      errors.zip ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="10001"
                  />
                  {errors.zip && (
                    <p className="mt-2 text-sm text-red-600">{errors.zip}</p>
                  )}
                </div>
              </div>

              {/* Country */}
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700"
                >
                  Country
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  ref={countryRef}
                  className={`block w-full mt-1 px-3 py-2 border ${
                    errors.country ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="United States"
                />
                {errors.country && (
                  <p className="mt-2 text-sm text-red-600">{errors.country}</p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  ref={passwordRef}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                I am signing up as a:
              </label>
              <div className="mt-1 relative">
                <select
                  id="role"
                  name="role"
                  ref={roleRef}
                  defaultValue="user"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="user">User</option>
                  <option value="seller">Seller</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Signing up..." : "Sign up"}
              </button>
            </div>
             <div className="flex justify-center items-center">
              <p className="font-bold">
                Already Have an account?
                <Link className="text-blue-600" to={"/signin"}>
                  {" "}
                  Signin
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
