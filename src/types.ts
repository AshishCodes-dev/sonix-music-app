export interface Song {
  id: number;
  title: string;
  artist_id: number;
  artist_name: string;
  album_id: number;
  album_name: string;
  cover: string;
  audio_url: string;
  duration: number;
  genre: string;
  mood: string;
  plays: number;
  lyrics: string;
  created_at: string;
}

export interface Artist {
  id: number;
  name: string;
  slug: string;
  image: string;
  cover: string;
  bio: string;
  genre: string;
  followers: number;
  monthly_listeners: number;
  verified: boolean;
}

export interface Album {
  id: number;
  title: string;
  artist_id: number;
  artist_name: string;
  cover: string;
  year: number;
  genre: string;
  description: string;
}

export interface Playlist {
  id: number;
  name: string;
  description: string;
  user_id: string;
  owner_name: string;
  cover: string | null;
  song_ids: number[];
  is_public: boolean;
  is_featured: boolean;
  mood: string | null;
  created_at: string;
}
