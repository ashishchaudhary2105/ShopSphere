import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SellerPageWarning() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border-l-4 border-red-500 p-8 text-center">
        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>
        
        {/* Warning Message */}
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Access Restricted
        </h1>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-red-700 mb-2">
            This is Seller Page
          </h2>
          <p className="text-red-600 text-sm">
            You are trying to access the seller dashboard. This page is only accessible to registered sellers.
          </p>
        </div>
        
        <div className="text-gray-600 mb-6">
          <p className="text-sm">
            If you're a user looking to shop, please go back to the user page. 
            If you're a seller, please log in with your seller credentials.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <button onClick={ () =>{ navigate("/") }} className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 mr-2"  />
            Go Back to User Page
          </button>
          
          <button onClick={ () =>{ navigate("/signin") }} className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200">
            Seller Login
          </button>
        </div>
        
        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact support if you believe this is an error.
          </p>
        </div>
      </div>
    </div>
  );
}