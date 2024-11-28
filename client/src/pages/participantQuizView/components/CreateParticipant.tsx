import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Avatar, { genConfig } from "react-nice-avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useGetAuthenticatedUser from "@/hooks/useGetAuthenticatedUser";
import { userService } from "@/services/users";
import { InfoIcon, Dices } from "lucide-react";

interface CreateParticipantProps {
  handleAddParticipant: (name: string, avatar: string) => void;
}

function createRandomId() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 10 }, () =>
    chars.charAt(Math.random() * chars.length),
  ).join("");
}

export default function CreateParticipant({
  handleAddParticipant,
}: CreateParticipantProps) {
  const [showError, setShowError] = useState(false);
  const [user, setUser] = useState<{
    username: string;
    avatar: string;
    isLoggedIn: boolean;
  }>({ username: "", avatar: "", isLoggedIn: false });
  const [guestName, setGuestName] = useState("");
  const [guestAvatar, setGuestAvatar] = useState(createRandomId());

  const { user: authenticatedUser } = useGetAuthenticatedUser();

  useEffect(() => {
    async function initializeUser() {
      if (!authenticatedUser?.id || !authenticatedUser?.email) return;

      try {
        const { data, error } = await userService.findOrCreate(
          authenticatedUser.id,
          authenticatedUser.email,
        );
        if (error) {
          console.error("Error in findOrCreate:", error);
          return;
        }

        if (data) {
          setUser({
            username: data.username || "",
            avatar: data.avatar || createRandomId(),
            isLoggedIn: true,
          });
        }
      } catch (error) {
        console.error("Failed to initialize user:", error);
      }
    }

    initializeUser();
  }, [authenticatedUser]);

  const handleSubmit = (userType: "me" | "guest") => {
    const nameToUse = userType === "me" ? user.username : guestName;
    const avatarToUse = userType === "me" ? user.avatar : guestAvatar;

    if (!nameToUse) {
      setShowError(true);
      return;
    }

    handleAddParticipant(nameToUse, avatarToUse);
  };

  return (
    <div className="flex-1 w-full flex items-center justify-center overflow-hidden p-8">
      {user.isLoggedIn ? (
        <Tabs defaultValue="me">
          <div className="bg-component-background w-3/4 mx-auto rounded-lg flex flex-col items-center justify-center p-6">
            <TabsList className="flex-1 w-full grid-cols-2 p-8 rounded-lg">
              <TabsTrigger value="me">Play as {user.username}</TabsTrigger>
              <TabsTrigger value="guest">Play as Guest</TabsTrigger>
            </TabsList>
            <TabsContent
              value="me"
              className="flex flex-col items-center justify-center space-y-4"
            >
              <Avatar
                style={{ width: "6rem", height: "6rem" }}
                {...genConfig(user.avatar)}
              />
              <Input
                disabled
                className="text-[#333333] text-center font-display md:text-lg text-lg py-8 px-12 w-full shadow-lg"
                value={user.username}
              />
              <Button
                onClick={() => handleSubmit("me")}
                className="bg-[#333333] text-3xl text-[#fefefe] hover:bg-[#86D293] py-8 px-12 font-display w-full shadow-lg"
              >
                Play
              </Button>
            </TabsContent>
            <TabsContent
              value="guest"
              className="flex flex-col items-center justify-center space-y-4"
            >
              <Avatar
                style={{ width: "6rem", height: "6rem" }}
                {...genConfig(guestAvatar)}
              />
              <button
                onClick={() => setGuestAvatar(createRandomId())}
                className="m-2 p-2 rounded-full bg-yellow-300 hover:bg-yellow-400 flex items-center justify-center"
                title="Randomize Avatar"
              >
                <Dices className="w-6 h-6 text-gray-500" />
              </button>
              <Input
                placeholder="Guest Name"
                className="text-[#333333] text-center font-display md:text-lg text-lg py-8 px-12 w-full shadow-lg"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                maxLength={15}
              />
              {showError && (
                <div className="flex justify-start items-center w-full text-red-500">
                  <InfoIcon className="w-5 h-5 mr-1 animate-shake" />
                  <p className="font-display">Please enter a guest name</p>
                </div>
              )}
              <Button
                onClick={() => handleSubmit("guest")}
                className="bg-[#333333] text-3xl text-[#fefefe] hover:bg-[#86D293] py-8 px-12 font-display w-full shadow-lg"
              >
                Play
              </Button>
            </TabsContent>
          </div>
        </Tabs>
      ) : (
        <div className="bg-component-background w-3/4 mx-auto rounded-lg flex flex-col items-center justify-center p-6  space-y-4">
          <Avatar
            style={{ width: "6rem", height: "6rem" }}
            {...genConfig(guestAvatar)}
          />
          <button
            onClick={() => setGuestAvatar(createRandomId())}
            className="m-2 p-2 rounded-full bg-yellow-300 hover:bg-yellow-400 flex items-center justify-center"
            title="Randomize Avatar"
          >
            <Dices className="w-6 h-6 text-gray-500" />
          </button>
          <Input
            placeholder="Enter Name"
            className="text-[#333333] text-center font-display md:text-lg text-lg py-8 px-12 w-full shadow-lg"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            maxLength={15}
          />
          {showError && (
            <div className="flex justify-start items-center w-full text-red-500">
              <InfoIcon className="w-5 h-5 mr-1 animate-shake" />
              <p className="font-display">Please enter a name</p>
            </div>
          )}
          <Button
            onClick={() => handleSubmit("guest")}
            className="bg-[#333333] text-3xl text-[#fefefe] hover:bg-[#86D293] py-8 px-12 font-display w-full shadow-lg"
          >
            Play
          </Button>
        </div>
      )}
    </div>
  );
}
