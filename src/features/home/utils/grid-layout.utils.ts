/**
 * Grid layout column utility classes mapping numeric column choices to Tailwind utilities.
 */

export function getDesktopGridClass(cols: number): string {
  switch (cols) {
    case 1:
      return "md:grid-cols-1";
    case 2:
      return "md:grid-cols-2";
    case 3:
      return "md:grid-cols-3";
    case 5:
      return "md:grid-cols-3 lg:grid-cols-5";
    case 8:
      return "md:grid-cols-4 lg:grid-cols-8";
    case 6:
      return "md:grid-cols-4 lg:grid-cols-6";
    case 4:
    default:
      return "md:grid-cols-3 lg:grid-cols-4";
  }
}

export function getMobileGridClass(cols: number): string {
  switch (cols) {
    case 1:
      return "grid-cols-1";
    case 3:
      return "grid-cols-3";
    case 4:
      return "grid-cols-4";
    case 2:
    default:
      return "grid-cols-2";
  }
}

