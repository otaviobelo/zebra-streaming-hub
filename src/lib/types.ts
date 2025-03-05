
export interface Channel {
  id: string;
  name: string;
  streamUrl: string;
  thumbnailUrl: string;
  category: string;
  description: string;
  isFavorite?: boolean;
}

export type Category = {
  id: string;
  name: string;
}
