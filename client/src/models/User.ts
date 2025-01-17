interface User {
  id: string;
  email: string;
  created_at: string;
  username: string;
  avatar: string;
  collectionName: string;
  completedTutorials: string[];
  tutorialsDisabled?: boolean;
}

export default User;
