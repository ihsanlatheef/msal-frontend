import React, { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

const Users = () => {
  const { instance, accounts } = useMsal();
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accounts.length === 0) {
      return;
    }

    const request = {
      scopes: ["https://testmsalintegration.onmicrosoft.com/auth-backend/access_as_user"],
      account: accounts[0],
    };

    // Fetch the access token for the backend API
    instance
      .acquireTokenSilent(request)
      .then((response) => {
        const token = response.accessToken;

        // Fetch users from backend
        fetch("http://localhost:8000/api/users", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Error fetching users: ${res.statusText}`);
            }
            return res.json();
          })
          .then((data) => {
            setUsers(data);
            setLoading(false);
          })
          .catch((fetchError) => {
            console.error("Error fetching users:", fetchError);
            setError(fetchError.message);
            setLoading(false);
          });
      })
      .catch((authError) => {
        if (authError instanceof InteractionRequiredAuthError) {
          instance.acquireTokenRedirect(request);
        } else {
          console.error("Token acquisition failed:", authError);
          setError("Token acquisition failed. Please sign in again.");
        }
        setLoading(false);
      });
  }, [accounts, instance]);

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Users List</h1>
      {users ? (
        <ul>
          {users.map((user, index) => (
            <li key={index}>
              <strong>
                {user.first_name} {user.last_name}
              </strong>{" "}
              - {user.email}
            </li>
          ))}
        </ul>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
};

export default Users;
