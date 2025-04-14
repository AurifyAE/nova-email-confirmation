import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  Phone, 
  Mail, 
  MapPin, 
  Home, 
  XCircle,
  ArrowRight 
} from 'lucide-react';

const App = ({ navigate = () => {}, location = { search: window.location.search } }) => {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing your request...');
  const [showFallback, setShowFallback] = useState(false);

  // Memoize request data to prevent unnecessary re-computations
  const requestData = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      orderId: params.get('orderId'),
      itemId: params.get('itemId'),
      action: params.get('action'),
    };
  }, [location.search]);

  // Create a memoized callback for processing confirmation
  const processConfirmation = useCallback(async () => {
    // Validate request data before making the request
    if (!requestData.orderId || !requestData.itemId || !requestData.action) {
      setMessage('Invalid request. Missing parameters.');
      setStatus('error');
      return;
    }

    // Create an AbortController to handle request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      setShowFallback(true);
      setMessage('Request timed out. Please try again.');
      setStatus('error');
    }, 15000); // 15 seconds timeout

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/orders/confirm-quantity`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Secret-Key': import.meta.env.VITE_API_KEY
          },
          withCredentials: true,
          signal: controller.signal,
          timeout: 15000,
        }
      );

      // Clear timeout if request succeeds
      clearTimeout(timeoutId);
       console.log(response.data)
      if (response.data.success) {
        setMessage(response.data.message);
        setStatus('success');
        navigate('/');
     
      } else {
        setMessage(response.data.message || 'Order update was not successful.');
        setStatus('rejected');
      }

   

      return () => {
        clearTimeout(timer);
        clearTimeout(timeoutId);
      };
    } catch (err) {
      clearTimeout(timeoutId);

      // Handle different types of errors
      if (axios.isCancel(err)) {
        // Request was cancelled due to timeout
        setMessage('Request timed out. Please try again.');
      } else {
        // Ensure the correct error message is displayed
        const errorMessage = err.response?.data?.message || 'Error processing request. Please try again.';
        setMessage(errorMessage);
      }
      setStatus('error');
    }
  }, [requestData]);

  // Use useEffect to trigger the request once
  useEffect(() => {
    processConfirmation();
  }, [processConfirmation]);
  

  const renderStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500 animate-bounce" />;
      case 'rejected':
        return <XCircle className="h-16 w-16 text-red-500 animate-pulse" />;
      case 'error':
        return <AlertTriangle className="h-16 w-16 text-red-500 animate-shake" />;
      default:
        return null;
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleHomeNavigation = () => {
    window.location.href = '/';
  };

  // Fallback UI when processing takes too long
  if (showFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">Connection Delay</h2>
          <p className="text-gray-600 mb-6">
            Your request is taking longer than expected. Please check your internet connection or try again.
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={handleRetry}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
            >
              Retry <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            <button
              onClick={handleHomeNavigation}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center"
            >
              <Home className="mr-2 h-4 w-4" /> Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
    <div className="w-full max-w-4xl grid gap-6 bg-white shadow-2xl rounded-2xl overflow-hidden">
      {/* Status Section */}
      <div className="flex flex-col items-center justify-center p-8 bg-blue-50">
        <div className="mb-6">
          {renderStatusIcon()}
        </div>

        <h2 className={`text-2xl font-bold mb-4 text-center ${
          status === 'success' ? 'text-green-600' : 
          status === 'rejected' ? 'text-red-600' :
          status === 'error' ? 'text-red-600' : 'text-blue-600'
        }`}>
          {status === 'processing' ? 'Processing' : 
           status === 'success' ? 'Order Confirmed' : 
           status === 'rejected' ? 'Order Rejected' : 
           'Processing Failed'}
        </h2>

        <p className="text-gray-600 text-center mb-6">{message}</p>

        {(status === 'error' || status === 'rejected') && (
          <div className="flex space-x-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
            >
              Try Again <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center"
            >
              <Home className="mr-2 h-4 w-4" /> Home
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default App;
