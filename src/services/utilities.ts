const adjectives = [
  'Abaft',
  'Actually',
  'Adamant',
  'Adorable',
  'Anxious',
  'Awesome',
  'Barbarous',
  'Bent',
  'Bright',
  'Careful',
  'Clean',
  'Coherent',
  'Curious',
  'Diligent',
  'Disastrous',
  'Earthy',
  'Erratic',
  'Famous',
  'Fascinated',
  'Foreign',
  'Hateful',
  'Husky',
  'Instinctive',
  'Jagged',
  'Juvenile',
  'Military',
  'Mute',
  'Naughty',
  'Neat',
  'Nifty',
  'Nostalgic',
  'Parallel',
  'Quack',
  'Questionable',
  'Roomy',
  'Sedate',
  'Sharp',
  'Silent',
  'Terrible',
  'Unequal',
];

const animals = [
  'Ape',
  'Basilisk',
  'Bison',
  'Chameleon',
  'Chimpanzee',
  'Chinchilla',
  'Chipmunk',
  'Colt',
  'Cougar',
  'Cow',
  'Dingo',
  'Fawn',
  'Fish',
  'Goat',
  'Iguana',
  'Jackal',
  'Lemur',
  'Lion',
  'Moose',
  'Ocelot',
  'Opossum',
  'Oryx',
  'Parakeet',
  'Ram',
  'Seal',
  'Snake',
  'Squirrel',
  'Stallion',
  'Wolf',
  'Zebra',
];

// const links: { [index: string]: RegExp } = {
//   MATCH_URL_YOUTUBE: /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})|youtube\.com\/playlist\?list=|youtube\.com\/user\//,
//   MATCH_URL_SOUNDCLOUD: /(?:soundcloud\.com|snd\.sc)\/[^.]+$/,
//   MATCH_URL_VIMEO: /vimeo\.com\/.+/,
//   MATCH_URL_FACEBOOK: /^https?:\/\/(www\.)?facebook\.com.*\/(video(s)?|watch|story)(\.php?|\/).+$/,
//   MATCH_URL_STREAMABLE: /streamable\.com\/([a-z0-9]+)$/,
//   MATCH_URL_WISTIA: /(?:wistia\.com|wi\.st)\/(?:medias|embed)\/(.*)$/,
//   MATCH_URL_TWITCH_VIDEO: /(?:www\.|go\.)?twitch\.tv\/videos\/(\d+)($|\?)/,
//   MATCH_URL_TWITCH_CHANNEL: /(?:www\.|go\.)?twitch\.tv\/([a-zA-Z0-9_]+)($|\?)/,
//   MATCH_URL_DAILYMOTION: /^(?:(?:https?):)?(?:\/\/)?(?:www\.)?(?:(?:dailymotion\.com(?:\/embed)?\/video)|dai\.ly)\/([a-zA-Z0-9]+)(?:_[\w_-]+)?$/,
//   MATCH_URL_MIXCLOUD: /mixcloud\.com\/([^/]+\/[^/]+)/,
//   MATCH_URL_VIDYARD: /vidyard.com\/(?:watch\/)?([a-zA-Z0-9-]+)/,
// };

const MATCH_URL_ROOM = /((^(http:\/\/)?localhost:3000)|(^(https?:\/\/(www\.)?)?turtletv\.app))\/room\/([-a-zA-Z0-9]*)/;
const MATCH_URL_NETFLIX = /https?:\/\/(www\.)?netflix\.com\/watch\/([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

export const matchUrl = (url: string) => {
  if (!!url.match(MATCH_URL_NETFLIX)) {
    return 'NETFLIX';
  } else {
    return 'DEFAULT';
  }
};

export const matchRoomUrl = (url: string) => {
  if (url.match(MATCH_URL_ROOM)) {
    return true;
  }
  return false;
};

export const generateAnonName = (): string => {
  const adj: string = adjectives[Math.floor(Math.random() * 40)];
  const animal: string = animals[Math.floor(Math.random() * 30)];
  return adj + ' ' + animal;
};

export const secondsToTimestamp = (seconds: number): string => {
  const timestamp = new Date(seconds * 1000).toISOString().substr(11, 8);
  if (timestamp.substr(0, 2) === '00') {
    return timestamp.substr(3);
  }
  return timestamp;
};

export const timestampToSeconds = (timestamp: string): number => {
  let arr: string[];
  arr = timestamp.split(':');
  if (timestamp.length === 8) {
    return +arr[0] * 60 * 60 + +arr[1] * 60 + +arr[2];
  }
  return +arr[0] * 60 + +arr[1];
};

export const SYNC_MARGIN = 3000; // in milliseconds
