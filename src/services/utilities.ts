const adjectives = [
  'Adamant',
  'Instinctive',
  'Actually',
  'Husky',
  'Bent',
  'Fascinated',
  'Sexual',
  'Mute',
  'Silent',
  'Coherent',
  'Juvenile',
  'Naughty',
  'Foreign',
  'Earthy',
  'Diligent',
  'Anxious',
  'Adorable',
  'Quack',
  'Unequal',
  'Sharp',
];

const animals = [
  'Chimpanzee',
  'Bison',
  'Squirrel',
  'Lemur',
  'Wolf',
  'Dingo',
  'Colt',
  'Seal',
  'Cougar',
  'Ram',
  'Parakeet',
  'Goat',
  'Ape',
  'Basilisk',
  'Oryx',
  'Iguana',
  'Stallion',
  'Jackal',
  'Snake',
  'Zebra',
];

export const generateAnonName = (): string => {
  const adj: string = adjectives[Math.floor(Math.random() * 20)];
  const animal: string = animals[Math.floor(Math.random() * 20)];
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
