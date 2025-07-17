type Datelike = Date | string | number;

type Platform = 'youtube' | 'tiktok' | 'instagram';
type PlatformData<T> = {
  youtube: T,
  tiktok: T,
  instagram: T,
};

type ExtendedPlatform = 'all' | Platform;
type ExtendedPlatformData<T> = PlatformData<T> & {
  all: T
};

type Producer = {
  id: string,
  name: string,
  fullName: string,
  color: string
};

type VideoMetadata = {
  id: string,
  title: string,
  link: string,
  producers: string[]
};

type VideoViewData = PlatformData<number[]> & {
  id: string
};

type Video = PlatformData<number[]> & {
  id: string,
  title: string,
  links: PlatformData<string>,
  contributions: {
      [producerId: string]: number
  }
};

type ViewData = {
  times: Date[],
  videos: {
      [videoId: string]: PlatformData<number[]>
  }
};

type VideoMetadataCollection = {
  [videoId: string]: {
      title: string,
      links: PlatformData<string>,
      contributions: {
          [producerId: string]: number
      }
  }
};

type PlatformConfig = {
  label: string,
  borderColor: string,
  backgroundColor: string,
  pointBackgroundColor: string,
  borderWidth?: number,
  fill?: boolean,
  pointRadius?: number,
  pointHoverRadius?: number,
  pointBorderWidth?: number
}
