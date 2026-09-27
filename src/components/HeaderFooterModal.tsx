import React from 'react';
import { X } from 'lucide-react';
import { BookSettings, PageDocument } from '../types';
import { HeaderFooterEditor } from './HeaderFooterEditor';

interface HeaderFooterModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BookSettings;
  onChangeSettings: (updated: BookSettings) => void;
  currentPage?: PageDocument;
  totalPages?: number;
  onUpdatePage?: (id: number, updated: Partial<PageDocument>) => void;
}

export const HeaderFooterModal: React.FC<HeaderFooterModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
  currentPage,
  totalPages = 8,
  onUpdatePage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
        <div className="sticky top-0 bg-white/95 backdrop-blur-xs z-10 px-5 py-3 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-base text-stone-900">
              Formatar Topo & Rodapé (Estilo Word)
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <HeaderFooterEditor
            settings={settings}
            onChange={onChangeSettings}
            currentPageNumber={currentPage?.editorialNumber}
            totalPages={totalPages}
            customPageHeader={currentPage?.customHeader}
            customPageFooter={currentPage?.customFooter}
            onUpdatePageCustomHF={(h, f) => {
              if (currentPage && onUpdatePage) {
                onUpdatePage(currentPage.id, {
                  customHeader: h,
                  customFooter: f,
                });
              }
            }}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};
