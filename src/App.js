import { useState } from "react";
import "./App.css";
import axios from "axios";
import jwt_decode from "jwt-decode";
function App() {
  const [user, setuser] = useState(null);
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");
  const [error, seterror] = useState(false);
  const [success, setsuccess] = useState(false);

  const refreshtoken = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/refresh", { token: user.refeshtoken });
      setuser({
        ...user,
        accesstoken: res.data.accesstoken,
        refreshtoken: res.data.refreshtoken,
      });
    } catch (err) {
      seterror(true);
    }
  };
  axios.interceptors.request.use(
    async (config) => {
      let currentdate = new Date();
      const decodedtoken = jwt_decode(user.accesstoken);
      if (decodedtoken.exp * 1000 < currentdate.getTime()) {
        const data = await refreshtoken();
        config.headers["authorization"] = "Bearer " + data.accesstoken;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const handlesubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/login", { username, password });
      setuser(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  const handledelete = async (id) => {
    seterror(false);
    setsuccess(false);
    try {
      await axios.delete("http://localhost:5000/api/delete" + id, {
        headers: { authorization: "Bearer " + user.accesstoken },
      });
      setsuccess(true);
    } catch (err) {
      seterror(true);
    }
  };

  return (
    <>
      <div className="container">
        {user ? (
          <div className="home">
            <span>
              welcome to the <b>{user.isadmin ? "admin" : "user"}</b> dashboard{" "}
              <b>{user.username}</b>
            </span>
            <span>Delete user:</span>
            <button className="deletebutton" onClick={() => handledelete(1)}>
              Delete john
            </button>
            <button className="deletebutton" onClick={() => handledelete(2)}>
              Delete jane
            </button>
            {error && (
              <span className="error">you are not allowed to delete</span>
            )}
          </div>
        ) : (
          <>
            <div className="login">
              <form onSubmit={handlesubmit}>
                <span className="formtitle">login page</span>
                <input
                  type="text"
                  placeholder="username"
                  onChange={(e) => setusername(e.target.value)}
                ></input>
                <input
                  type="text"
                  placeholder="password"
                  onChange={(e) => setpassword(e.target.value)}
                ></input>
                <button type="submit" className="submitbutton">
                  login
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default App;
