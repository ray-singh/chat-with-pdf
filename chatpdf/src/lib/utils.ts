import { clsx, type ClassValue } from "clsx"; 
import { twMerge } from "tailwind-merge";     

/**
 * cn (Class Name Utility)
 * 
 * Merges multiple class names, handling conditional classes using `clsx`
 * and resolving Tailwind CSS class conflicts with `twMerge`.
 * 
 * @param {...ClassValue[]} inputs - List of class names or conditional class objects
 * @returns {string} - A single merged class string
 * 
 * Example:
 * ```tsx
 * cn("text-red-500", { "font-bold": isActive }) 
 * // Outputs: "text-red-500 font-bold" if isActive is true
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)); // Merges class names while preventing Tailwind conflicts
}

/**
 * convertToAscii
 * 
 * Removes all non-ASCII characters from the provided string,
 * ensuring the result contains only standard ASCII characters (0x00 to 0x7F).
 * 
 * @param {string} inputString - The original string containing potential non-ASCII characters
 * @returns {string} - A new string with only ASCII characters
 * 
 * Example:
 * ```tsx
 * convertToAscii("Héllo Wørld!") 
 * // Outputs: "Hllo Wrld!"
 * ```
 */
export function convertToAscii(inputString: string) {
  const asciiString = inputString.replace(/[^\x00-\x7F]+/g, ""); // Regex to filter out non-ASCII characters
  return asciiString;
}
