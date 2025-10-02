// Dark background images
import dark1 from "../assets/backgrounds/dark1.avif";
import dark2 from "../assets/backgrounds/dark2.avif";
import dark3 from "../assets/backgrounds/dark3.avif";
import dark4 from "../assets/backgrounds/dark4.avif";
import dark5 from "../assets/backgrounds/dark5.avif";
import dark6 from "../assets/backgrounds/dark6.avif";
import dark7 from "../assets/backgrounds/dark7.avif";
import dark8 from "../assets/backgrounds/dark8.avif";
import dark11 from "../assets/backgrounds/dark11.avif";
import dark12 from "../assets/backgrounds/dark12.avif";
import dark13 from "../assets/backgrounds/dark13.avif";
import dark17 from "../assets/backgrounds/dark17.avif";
import dark18 from "../assets/backgrounds/dark18.avif";

export const darkBackgrounds = [
  dark1,
  dark2,
  dark3,
  dark4,
  dark5,
  dark6,
  dark7,
  dark8,
  dark11,
  dark12,
  dark13,
  dark17,
  dark18,
];

/**
 * Get a random dark background image
 * @param seed - Optional seed for consistent randomization (e.g., component name)
 * @returns Random background image URL
 */
export const getRandomDarkBackground = (seed?: string): string => {
  if (seed) {
    // Use seed to generate consistent "random" index for the same component
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    const index = Math.abs(hash) % darkBackgrounds.length;
    return darkBackgrounds[index];
  }

  // True random selection
  const randomIndex = Math.floor(Math.random() * darkBackgrounds.length);
  return darkBackgrounds[randomIndex];
};

/**
 * Generate background styles for dark sections
 * @param backgroundImage - Background image URL
 * @param overlay - Optional overlay opacity (0-1)
 * @returns CSS-in-JS style object
 */
export const getDarkBackgroundStyles = (
  backgroundImage: string,
  overlay: number = 0.7
): React.CSSProperties => ({
  backgroundImage: `linear-gradient(rgba(0, 0, 0, ${overlay}), rgba(0, 0, 0, ${overlay})), url(${backgroundImage})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
});

/**
 * Get CSS classes and styles for dark background sections
 * @param seed - Optional seed for consistent background selection
 * @param overlay - Optional overlay opacity (0-1)
 * @returns Object with className and style properties
 */
export const useDarkBackground = (seed?: string, overlay: number = 0.7) => {
  const backgroundImage = getRandomDarkBackground(seed);
  const style = getDarkBackgroundStyles(backgroundImage, overlay);

  return {
    style,
    className: "relative", // Ensure position relative for overlay effects
  };
};
