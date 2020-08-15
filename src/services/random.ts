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
