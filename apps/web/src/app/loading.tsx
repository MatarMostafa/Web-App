/**
 * Global Loading Component
 * Displays loading state for pages and route transitions
 */

export default function Loading({ text = "ERP" }) {
  return (
   <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {/* Spinner */}
        <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-primary">
          <svg
            className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading {text}...
        </div>

        {/* Progress bar (optional) */}
        <div className="mt-4 w-64 mx-auto">
          <div className="bg-gray-200 rounded-full h-1">
            <div
              className="bg-primary h-1 rounded-full animate-pulse"
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
