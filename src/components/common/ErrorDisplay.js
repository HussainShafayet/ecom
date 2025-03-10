const ErrorDisplay = ({ errors }) => {
    if (!errors || !Array.isArray(errors) || errors.length === 0) return null;
  
    return (
      <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-md mb-4">
        <h3 className="font-semibold mb-2">Error</h3>
        <ul className="list-disc list-inside space-y-1">
          {errors?.map((error, index) => (
            <li key={index} className="text-sm">
              {error}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  export default ErrorDisplay;