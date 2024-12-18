import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useGetAuthenticatedUser from '@/hooks/useGetAuthenticatedUser';
import { userService } from '@/services/users';
import { InfoIcon, Dices } from 'lucide-react';
import Avatar from '@/Avatar';

interface CreateParticipantProps {
  handleAddParticipant: (
    name: string,
    avatar: string,
    collectionName: string
  ) => void;
}

function createRandomId() {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 10 }, () =>
    chars.charAt(Math.random() * chars.length)
  ).join('');
}

export default function CreateParticipant({
  handleAddParticipant,
}: CreateParticipantProps) {
  const [showError, setShowError] = useState(false);
  const [user, setUser] = useState<{
    username: string;
    avatar: string;
    collectionName: string;
    isLoggedIn: boolean;
  }>({ username: '', avatar: '', isLoggedIn: false, collectionName: '' });
  const [guestName, setGuestName] = useState('');
  const [guestAvatar, setGuestAvatar] = useState(createRandomId());
  const [addingUser, setAddingUser] = useState(false);

  const { user: authenticatedUser } = useGetAuthenticatedUser();

  useEffect(() => {
    async function initializeUser() {
      if (!authenticatedUser?.id || !authenticatedUser?.email) return;

      try {
        const { data, error } = await userService.findOrCreate(
          authenticatedUser.id,
          authenticatedUser.email
        );
        if (error) {
          console.error('Error in findOrCreate:', error);
          return;
        }

        if (data) {
          console.log(data);
          setUser({
            username: data.username || '',
            avatar: data.avatar || createRandomId(),
            isLoggedIn: true,
            collectionName: data.collectionName,
          });
        }
      } catch (error) {
        console.error('Failed to initialize user:', error);
      }
    }

    initializeUser();
  }, [authenticatedUser]);

  const handleSubmit = (userType: 'me' | 'guest') => {
    const nameToUse = userType === 'me' ? user.username : guestName;
    const avatarToUse = userType === 'me' ? user.avatar : guestAvatar;
    const collectiontoUse = userType === 'me' ? user.collectionName : 'micah';

    if (!nameToUse) {
      setShowError(true);
      return;
    }

    if (addingUser) {
      return;
    }

    setAddingUser(true);
    handleAddParticipant(nameToUse, avatarToUse, collectiontoUse);

    setTimeout(() => {
      setAddingUser(false);
    }, 1000);
  };

  return (
    <div className="flex-1 w-full flex items-center justify-center overflow-hidden p-8">
      {user.isLoggedIn ? (
        <Tabs defaultValue="me">
          <div className="bg-component-background mx-auto rounded-lg flex flex-col items-center justify-center p-6">
            <TabsList className="flex-1 w-full pt-4 pb-8 rounded-lg">
              <TabsTrigger className="bg-white rounded w-full" value="me">
                Play as {user.username}
              </TabsTrigger>
              <TabsTrigger className="bg-white rounded w-full" value="guest">
                Play as Guest
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="me"
              className="flex flex-col items-center justify-center space-y-4"
            >
              <Avatar
                avatarString={user.avatar}
                collectionName={user.collectionName}
              />
              <Input
                disabled
                className="text-[#333333] text-center font-display md:text-lg text-lg py-8 px-12 w-full shadow-lg"
                value={user.username}
              />
              <Button
                onClick={() => handleSubmit('me')}
                disabled={addingUser}
                className="bg-[#333333] text-3xl text-[#fefefe] hover:bg-[#86D293] py-8 px-12 font-display w-full shadow-lg"
              >
                Play
              </Button>
            </TabsContent>
            <TabsContent
              value="guest"
              className="flex flex-col items-center justify-center space-y-4"
            >
              <Avatar avatarString={guestAvatar} collectionName="micah" />
              <Button
                onClick={() => setGuestAvatar(createRandomId())}
                className="m-2 bg-yellow-300 hover:bg-yellow-400 flex items-center justify-center p-2 rounded-lg"
                title="Randomize Avatar"
                isInteractive
              >
                <p className="font-display text-black">New Avatar</p>
                <Dices className="w-6 h-6 text-black ml-1" />
              </Button>
              <Input
                placeholder="Guest Name"
                className="text-[#333333] text-center font-display md:text-lg text-2xl py-8 px-12 w-full shadow-lg"
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
                onClick={() => handleSubmit('guest')}
                disabled={addingUser}
                className="bg-[#333333] text-3xl text-[#fefefe] hover:bg-[#86D293] py-8 px-12 font-display w-full shadow-lg"
              >
                Play
              </Button>
            </TabsContent>
          </div>
        </Tabs>
      ) : (
        <div className="bg-component-background w-full mx-auto rounded-lg flex flex-col items-center justify-center p-6  space-y-4">
          <Avatar avatarString={guestAvatar} collectionName="micah" />
          <Button
            onClick={() => setGuestAvatar(createRandomId())}
            className="m-2 bg-yellow-300 hover:bg-yellow-400 flex items-center justify-center p-2 rounded-lg"
            title="Randomize Avatar"
            isInteractive
          >
            <p className="font-display text-black">New Avatar</p>
            <Dices className="w-6 h-6 text-black ml-1" />
          </Button>
          <Input
            placeholder="Enter Name"
            className="text-[#333333] text-center font-display md:text-2xl text-2xl py-8 px-12 w-full shadow-lg"
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
            onClick={() => handleSubmit('guest')}
            disabled={addingUser}
            className="bg-[#333333] text-3xl text-[#fefefe] hover:bg-[#86D293] py-8 px-12 font-display w-full shadow-lg"
          >
            Play
          </Button>
        </div>
      )}
    </div>
  );
}
