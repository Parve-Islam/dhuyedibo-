import React from 'react';
import { ChefHat, Code, Loader2, Coffee, Flame } from 'lucide-react';

const Page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-lg w-full">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <ChefHat className="text-purple-600" size={32} />
          <Flame className="text-orange-500" size={28} />
        </div>
        
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Developer is cooking this page
        </h1>
        
        <p className="text-gray-600 text-center mb-6">
          We're preparing something amazing for you. Please check back soon!
        </p>
        
        <div className="flex justify-center items-center space-x-4 mb-8">
          <div className="flex flex-col items-center">
            <Code className="text-indigo-500 mb-2" size={24} />
            <span className="text-sm text-gray-600">Coding</span>
          </div>
          <div className="flex flex-col items-center">
            <Loader2 className="text-blue-500 mb-2 animate-spin" size={24} />
            <span className="text-sm text-gray-600">Processing</span>
          </div>
          <div className="flex flex-col items-center">
            <Coffee className="text-amber-600 mb-2" size={24} />
            <span className="text-sm text-gray-600">Brewing</span>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-purple-800 text-center">
            Our chef developers are crafting the perfect experience just for you.
          </p>
        </div>
      </div>
      
      <footer className="mt-8 text-gray-500 text-sm">
        © {new Date().getFullYear()} Developer Kitchen
      </footer>
    </div>
  );
};

export default Page;