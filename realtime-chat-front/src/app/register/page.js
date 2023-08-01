"use client";
import { useState } from "react";
import InputMask from "react-input-mask";
import bg from "../../../public/images/loginbg.jpg";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== repeatPassword) {
      alert("Passwords do not match!");
      return;
    }
    axios
      .post(
        `${
          process.env.NEXT_PUBLIC_BACKEND_SERVER_URL
            ? process.env.NEXT_PUBLIC_BACKEND_SERVER_URL
            : "http://localhost:8080"
        }/auth/register`,
        {
          username: name + " " + lastName,
          phoneNumber: phone,
          password: password,
        }
      )
      .then((res) => {
        router.push("/login");
      })
      .catch((err) => {
        alert("Register failed because of some reason!");
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
          Create Your Account
        </h1>
        <form onSubmit={handleRegister}>
          <div className="mb-5">
            <label htmlFor="name" className="block mb-2 text-sm text-white">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John"
              className="text-black w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring-0"
              required
            />
          </div>
          <div className="mb-5">
            <label htmlFor="lastname" className="block mb-2 text-sm text-white">
              Last Name
            </label>
            <input
              type="text"
              name="lastname"
              id="lastname"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              className="text-black w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring-0"
              required
            />
          </div>
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
          <div className="mb-5">
            <label
              htmlFor="repeatPassword"
              className="block mb-2 text-sm text-white">
              Repeat Password
            </label>
            <input
              type="password"
              name="repeatPassword"
              id="repeatPassword"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              placeholder="********"
              className="text-black w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring-0"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 text-center bg-blue-600 text-white rounded hover:bg-blue-500 focus:outline-none">
            Register
          </button>
        </form>
        <div className="mt-4 w-full">
          <Link
            href={"/login"}
            className="text-blue-900 font-bold text-end w-full">
            <p> Already registered ?</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
