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
          <div className="flex space-x-2 justify-center items-center bg-gray-50 h-screen dark:invert">
            <span className="sr-only"> Loading {text}...</span>
            <div className="h-8 w-8 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-8 w-8 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-8 w-8 bg-primary rounded-full animate-bounce"></div>
          </div>
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
