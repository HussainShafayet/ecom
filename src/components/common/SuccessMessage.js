const SuccessMessage = ({ message }) => {
    if (!message) return null;
  
    return (
      <div className="bg-green-50 border border-green-300 text-green-700 p-4 rounded-md mb-4">
        <h3 className="font-semibold mb-2">Success</h3>
        <p className="text-sm">{message}</p>
      </div>
    );
  };

  export default SuccessMessage;