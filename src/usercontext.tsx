import { createContext, useContext, createSignal, JSX } from 'solid-js';

type UserContextType = {
  logged_in: () => boolean;
  set_logged_in: (logged_in: boolean) => void;
  user_id: () => number;
  set_user_id: (id: number) => void;
  username: () => string;
  set_username: (name: string) => void;
  discord_id: () => string;
  set_discord_id: (id: string) => void;
  avatar: () => string;
  set_avatar: (avatar: string) => void;
  accepted_policy: () => boolean;
  set_accepted_policy: (accepted: boolean) => void;
};

const UserContext = createContext<UserContextType>();

export const UserProvider = (props: { children: JSX.Element }) => {
  const [logged_in, set_logged_in] = createSignal(false);
  const [user_id, set_user_id] = createSignal<number>(-1);
  const [username, set_username] = createSignal<string>("");

  const [discord_id, set_discord_id] = createSignal<string>("");
  const [avatar, set_avatar] = createSignal<string>("");
  const [accepted_policy, set_accepted_policy] = createSignal<boolean>(false);

  return (
    <UserContext.Provider value={{
      logged_in, set_logged_in,
      user_id, set_user_id, username, set_username,
      discord_id, set_discord_id, avatar, set_avatar,
      accepted_policy, set_accepted_policy
    }}>
      {props.children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};