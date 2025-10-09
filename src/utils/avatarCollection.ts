// Avatar collection with diverse, professional avatars
export interface AvatarOption {
  id: string;
  name: string;
  url: string;
  category: "professional" | "casual" | "artistic" | "minimal";
}

export const AVATAR_COLLECTION: AvatarOption[] = [
  // Professional Avatars
  {
    id: "prof-1",
    name: "Professional Male 1",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=b6e3f4",
    category: "professional",
  },
  {
    id: "prof-2",
    name: "Professional Female 1",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=c0aede",
    category: "professional",
  },
  {
    id: "prof-3",
    name: "Professional Male 2",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael&backgroundColor=d1d4f9",
    category: "professional",
  },
  {
    id: "prof-4",
    name: "Professional Female 2",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=ffd93d",
    category: "professional",
  },

  // Casual Avatars
  {
    id: "casual-1",
    name: "Casual Male 1",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=ffdfbf",
    category: "casual",
  },
  {
    id: "casual-2",
    name: "Casual Female 1",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa&backgroundColor=c0aede",
    category: "casual",
  },
  {
    id: "casual-3",
    name: "Casual Male 2",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=d1d4f9",
    category: "casual",
  },
  {
    id: "casual-4",
    name: "Casual Female 2",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nina&backgroundColor=b6e3f4",
    category: "casual",
  },

  // Artistic Avatars
  {
    id: "art-1",
    name: "Artistic Style 1",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Frida&backgroundColor=ffad7a",
    category: "artistic",
  },
  {
    id: "art-2",
    name: "Artistic Style 2",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pablo&backgroundColor=ffd93d",
    category: "artistic",
  },
  {
    id: "art-3",
    name: "Artistic Style 3",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vincent&backgroundColor=c0aede",
    category: "artistic",
  },
  {
    id: "art-4",
    name: "Artistic Style 4",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Georgia&backgroundColor=b6e3f4",
    category: "artistic",
  },

  // Minimal Avatars
  {
    id: "minimal-1",
    name: "Minimal Style 1",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&backgroundColor=ffffff",
    category: "minimal",
  },
  {
    id: "minimal-2",
    name: "Minimal Style 2",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia&backgroundColor=f8f9fa",
    category: "minimal",
  },
  {
    id: "minimal-3",
    name: "Minimal Style 3",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan&backgroundColor=e9ecef",
    category: "minimal",
  },
  {
    id: "minimal-4",
    name: "Minimal Style 4",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ava&backgroundColor=dee2e6",
    category: "minimal",
  },
];

export const AVATAR_CATEGORIES = [
  { id: "professional", name: "Professional", iconName: "HiBriefcase" },
  { id: "casual", name: "Casual", iconName: "HiUser" },
  { id: "artistic", name: "Artistic", iconName: "HiColorSwatch" },
  { id: "minimal", name: "Minimal", iconName: "HiSparkles" },
] as const;

export const getAvatarsByCategory = (category: AvatarOption["category"]) => {
  return AVATAR_COLLECTION.filter((avatar) => avatar.category === category);
};

export const getRandomAvatar = (): AvatarOption => {
  const randomIndex = Math.floor(Math.random() * AVATAR_COLLECTION.length);
  return AVATAR_COLLECTION[randomIndex];
};

export const getAvatarById = (id: string): AvatarOption | undefined => {
  return AVATAR_COLLECTION.find((avatar) => avatar.id === id);
};
