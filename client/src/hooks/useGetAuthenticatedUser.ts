import { userAPI } from "@/api/users";
import User from "@/models/User";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useEffect, useState } from "react";

function useGetAuthenticatedUser() {
  const { user } = useKindeAuth();
  const [dbUser, setDbUser] = useState<User | null>(null);

  useEffect(() => {
    if (!user || dbUser) return;

    const { id } = user;

    if (!id) return;

    const fetchUser = async (id: string) => {
      const { data, error } = await userAPI.findOrCreate(id, user.email ?? "");

      if (error) {
        console.error("Error fetching/creating user:", error);
        return;
      }

      if (data) {
        setDbUser(data);
      }
    };

    fetchUser(id);
  }, [user, dbUser]);

  return { user: dbUser };
}

export default useGetAuthenticatedUser;