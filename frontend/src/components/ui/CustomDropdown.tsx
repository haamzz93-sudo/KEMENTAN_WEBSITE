'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
  description?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Pilih opsi...',
  label,
  className = '',
  disabled = false,
  searchable,
  searchPlaceholder = 'Cari pilihan...',
  size = 'md'
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Auto-enable search if more than 7 options unless explicitly disabled
  const showSearch = searchable !== undefined ? searchable : options.length > 7;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isOpen && showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen, showSearch]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter((opt) => 
      opt.label.toLowerCase().includes(q) || 
      (opt.description && opt.description.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs rounded-lg',
    md: 'px-3.5 py-2.5 text-xs sm:text-sm rounded-xl',
    lg: 'px-4 py-3 text-sm rounded-xl'
  };

  return (
    <div className={`relative ${className} ${isOpen ? 'z-50' : 'z-10'}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Trigger Button with Premium Liquid Glass Style */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between transition-all duration-200 border text-left cursor-pointer ${sizeClasses[size]} ${
          disabled
            ? 'bg-slate-100/70 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 cursor-not-allowed'
            : isOpen
            ? 'bg-white dark:bg-slate-800 text-emerald-950 dark:text-emerald-300 border-emerald-500 shadow-[0_4px_20px_rgba(5,150,105,0.18)] ring-2 ring-emerald-500/20'
            : 'bg-white/95 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-xs'
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className={`truncate ${selectedOption ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
              selectedOption.badgeColor || 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            }`}>
              {selectedOption.badge}
            </span>
          )}
        </span>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ml-2 shrink-0 ${
            isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
          }`}
        />
      </button>

      {/* Solid Non-Bleed Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-[100] mt-1.5 w-full min-w-[200px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl ring-1 ring-black/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Optional Search Bar */}
          {showSearch && (
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors duration-150 text-left cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-emerald-900 dark:hover:text-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <div className="min-w-0">
                        <div className="truncate font-medium">{opt.label}</div>
                        {opt.description && (
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                            {opt.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {opt.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          opt.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                Tidak ada opsi yang sesuai
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

