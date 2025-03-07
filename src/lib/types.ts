export interface Channel {
  id: string;
  name: string;
  streamUrl: string;
  thumbnailUrl?: string;
  logoUrl?: string;
  category: string;
  description: string;
  isFavorite?: boolean;
  channelNumber?: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface AdminCredentials {
  username: string;
  password: string;
}
