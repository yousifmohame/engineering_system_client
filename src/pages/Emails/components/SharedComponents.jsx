import React from "react";

export const LoadingSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="p-4 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-3.5 h-3.5 bg-gray-200 rounded-full mt-1"></div>
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <div className="h-3 bg-gray-200 rounded w-32"></div>
              <div className="h-2 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white">
    <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center mb-4">
      <Icon className="w-10 h-10 text-blue-300" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 max-w-sm mb-4">{message}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all"
      >
        {action.label}
      </button>
    )}
  </div>
);