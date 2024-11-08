import { ApiResponse, BaseAPI } from "./base";
import User from "@/models/User";

class UserAPI extends BaseAPI<User> {
  constructor() {
    super("User");
  }

  async findOrCreate(id: string, email: string): Promise<ApiResponse<User>> {
    // First try to find the user
    const { data: existingUser, error: fetchError } = await this.getById(id);

    if (fetchError && fetchError.code !== "PGRST116") {
      return { data: null, error: fetchError };
    }

    if (existingUser) {
      return { data: existingUser, error: null };
    }

    // If user doesn't exist, create new user
    return await this.create({
      id,
      email,
      created_at: new Date().toISOString(),
    });
  }
}

export const userAPI = new UserAPI(); 