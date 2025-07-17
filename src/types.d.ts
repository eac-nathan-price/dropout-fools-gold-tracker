// Global type declarations for the Producer Performance Tracker
interface Producer {
  id: string;
  name: string;
  fullName: string;
  color: string;
}

interface VideoMetadata {
  id: string;
  title: string;
  link: string;
  producers: string[];
}

interface VideoViewData {
  id: string;
  youtubeViews: number[];
  tiktokViews: number[];
  instagramViews: number[];
}

interface Video {
  id: string;
  title: string;
  links: {
      youtube: string;
      tiktok: string;
      instagram: string;
  };
  contributions: {
      [producerId: string]: number;
  };
  youtubeViews: number[];
  tiktokViews: number[];
  instagramViews: number[];
}

interface ViewData {
  times: Date[];
  videos: {
      [videoId: string]: {
          youtube: number[];
          tiktok: number[];
          instagram: number[];
      };
  };
}

interface VideoMetadataCollection {
  [videoId: string]: {
      title: string;
      links: {
          youtube: string;
          tiktok: string;
          instagram: string;
      };
      contributions: {
          [producerId: string]: number; // Dollar amount contributed
      };
  };
}

type Platform = 'all' | 'youtube' | 'tiktok' | 'instagram';
