import { BaseAPI } from "./base";
import Game from "@/models/Game";
import supabase from "./client";
import { PostgrestError } from "@supabase/supabase-js";
class GameAPI extends BaseAPI<Game> {
  constructor() {
    super("Game");
  }

  // Add game-specific methods here
  async getByUserId(userId: string): Promise<{ data: Game[] | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("userId", userId);

    return { data: data as Game[], error };
  }
}

export const gameAPI = new GameAPI(); 