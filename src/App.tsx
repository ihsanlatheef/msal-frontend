import "./App.css";
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { loginRequest } from "./auth/AuthConfig";
import Users from "./Users";

function App() {
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();

  const handleLoginRedirect = () => {
    instance
      .loginRedirect({
        ...loginRequest,
        prompt: "login",
      })
      .catch((error: unknown) => console.log(error));
  };

  const handleLogoutRedirect = () => {
    instance.logoutPopup({ postLogoutRedirectUri: "/" });
    window.location.reload();
  };

  return (
    <div className="card">
      <AuthenticatedTemplate>
        {activeAccount ? (
          <>
            <button onClick={handleLogoutRedirect}>Logout</button>
            <p>You are signed in!</p>
            <Users />
          </>
        ) : null}
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <>
          <button onClick={handleLoginRedirect}>Login</button>
          <p>Please sign in!</p>
        </>
      </UnauthenticatedTemplate>
    </div>
  );
}

export default App;
