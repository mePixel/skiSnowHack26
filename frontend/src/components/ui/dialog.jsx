import React from 'react';
import { Button } from './button';
import { Card } from './card';

export default function Dialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Delete", 
  cancelText = "Cancel",
  variant = "destructive"
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog Content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <Card className="p-6 shadow-xl">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {title}
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                {message}
              </p>
            </div>
            
            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-4"
              >
                {cancelText}
              </Button>
              <Button
                variant={variant}
                onClick={onConfirm}
                className="px-4"
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}