import { Link, Navigate } from "react-router-dom";
import { useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const { setIsAuthenticated } = useContext(AuthContext);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const email = "8888@8888.8888";
    navigator.clipboard
      .writeText(email)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => alert("Failed to copy"));
  }
  async function handleLoginSubmit(ev) {
    ev.preventDefault();
    try {
      const { data } = await axios.post("/login", { email, password });

      alert("Login successful");
      setIsAuthenticated(true);

      setRedirect(true);
    } catch (e) {
      alert("Login failed");
    }
  }

  if (redirect) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="mt-4 grow flex items-center justify-around">
      <div className="mb-64">
        <h1 className="text-4xl text-center mb-4">Login</h1>
        <form className="max-w-md mx-auto" onSubmit={handleLoginSubmit}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
          />
          <button className="primary">Login</button>
          <div className="text-center py-2 text-gray-500">
            Don't have an account yet?{" "}
            <Link className="underline text-blue-500" to={"/register"}>
              Register now
            </Link>
          </div>
        </form>
        <div className="mt-8">
          <h3>TESTING email : 8888@8888.8888</h3>
          <h3>TESTING password : 88888888 (ie. 8 times 8)</h3>
        </div>
        <div className="mt-8 flex items-center gap-2">
          <h3>
            TEST "email" and "password" : 8888@8888.8888 (ie. email = password)
          </h3>
          <button onClick={handleCopy} className="p-2 border rounded">
            📋 Copy
          </button>
        </div>
        {copied && <p className="text-blue-500">Copied to clipboard!</p>}
      </div>
    </div>
  );
}
