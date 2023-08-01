"use client";
import { useState } from "react";
import InputMask from "react-input-mask";
import bg from "../../../public/images/loginbg.jpg";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Login() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    axios
      .post(
        `${
          process.env.NEXT_PUBLIC_BACKEND_SERVER_URL
            ? process.env.NEXT_PUBLIC_BACKEND_SERVER_URL
            : "http://localhost:8080"
        }/auth/login`,
        {
          phoneNumber: phone,
          password: password,
        }
      )
      .then(async (res) => {
        console.log(res);
        Cookies.set("token", res.data.token);
        Cookies.set("username", res.data.user);
        Cookies.set("phoneNumber", res.data.phoneNumber);
        Cookies.set("userId", res.data.userId);
        router.push("/");
      })
      .catch((err) => {
        alert(err);
      });
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen w-full "
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)), url(${bg.src})`,
      }}>
      <div className="p-10 bg-white bg-opacity-30 rounded shadow-xl w-96 backdrop-blur-md">
        <p className="text-6xl text-center text-white font-chocolate">
          Chattie
        </p>
        <h1 className="text-2xl font-bold my-6 text-white">
          Log in to Your Account
        </h1>
        <form onSubmit={handleLogin}>
          <div className="mb-5">
            <label htmlFor="phone" className="block mb-2 text-sm text-white">
              Phone
            </label>
            <InputMask
              mask="999 999 9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}>
              {(inputProps) => (
                <input
                  {...inputProps}
                  type="text"
                  name="phone"
                  id="phone"
                  placeholder="543 543 5443"
                  className="text-black w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring-0"
                  required
                />
              )}
            </InputMask>
          </div>
          <div className="mb-5">
            <label htmlFor="password" className="block mb-2 text-sm text-white">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="text-black w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring-0"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 text-center bg-blue-600 text-white rounded hover:bg-blue-500 focus:outline-none">
            Log in
          </button>
        </form>
        <div className="mt-4 w-full">
          <Link
            href={"/register"}
            className="text-blue-900 font-bold text-end w-full">
            <p>Not registered yet?</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
