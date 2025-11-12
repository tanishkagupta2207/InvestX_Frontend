import { format, parseISO, formatDistanceToNow } from "date-fns";

/**
 * Helper function to format an ISO date string for display.
 * @param {string} dateString - The date string to format (e.g., ISO 8601).
 * @param {("shortDatetime"|"dateOnly"|"timeOnly"|"relative"|"fullDatetime")} [type="shortDatetime"] - The desired format type.
 * @returns {string} The formatted date string.
 */
export const formatDisplayDate = (dateString, type = "shortDatetime") => {
  if (!dateString) return "";

  try {
    const dateObject = parseISO(dateString);

    switch (type) {
      case "dateOnly":
        // Example: Apr 16, 2025
        return format(dateObject, "PPP");
      case "timeOnly":
        // Example: 11:57 AM or 17:27
        return format(dateObject, "p");
      case "relative":
        // Example: 9 months ago, in 2 hours
        return formatDistanceToNow(dateObject, { addSuffix: true });
      case "fullDatetime":
        // Example: Apr 16, 2025, 17:27:28 +05:30
        const options = {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false, // 24-hour format
          timeZoneName: "shortOffset", // Display timezone offset (e.g., GMT+5:30)
        };
        return new Intl.DateTimeFormat("default", options).format(dateObject);
      case "shortDatetime": // Default if type is not specified or unrecognized
      default:
        // Example: Apr 16, 2025, 5:27 PM (using locale-aware 'PPP p' from date-fns)
        return format(dateObject, "PPP p");
    }
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return dateString; // Fallback to raw string if formatting fails
  }
};