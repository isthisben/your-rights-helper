import React, { useState, useMemo, useCallback } from 'react';
import { t } from '@/lib/i18n';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ChatWidget } from '@/components/ChatWidget';
import { DocumentPrepCard } from '@/components/DocumentPrepCard';
import { DocumentWizard } from '@/components/DocumentWizard';
import { DocumentType, DocumentDraft } from '@/types/documents';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const fadeUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export default function DocumentsPage() {
  const { caseState, updateCaseState } = useApp();
  const [activeDocument, setActiveDocument] = useState<DocumentType | null>(null);

  // Memoize document drafts
  const documentDrafts = useMemo(() => {
    return caseState.documentDrafts || {};
  }, [caseState.documentDrafts]);

  // Document wizard handlers
  const handleStartDocument = useCallback((type: DocumentType) => {
    setActiveDocument(type);
  }, []);

  const handleEditDocument = useCallback((type: DocumentType) => {
    setActiveDocument(type);
  }, []);

  const handleDocumentComplete = useCallback((draft: DocumentDraft) => {
    updateCaseState({
      documentDrafts: {
        ...documentDrafts,
        [draft.type]: {
          type: draft.type,
          sections: draft.sections,
          createdAt: draft.createdAt,
          updatedAt: draft.updatedAt,
          completed: draft.completed,
        },
      },
    });
    setActiveDocument(null);
    toast.success(t('documents.saved'));
  }, [documentDrafts, updateCaseState]);

  const handleDocumentCancel = useCallback(() => {
    setActiveDocument(null);
  }, []);

  const handleDocumentHelp = useCallback((prompt: string) => {
    // Open chat widget with the help prompt
    // This would require exposing a method from ChatWidget, but for now we'll just show a toast
    toast.info('Open the chat widget for help with: ' + prompt);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="skip-link">
        {t('app.skipToMain')}
      </a>

      <Header />

      <main id="main-content" className="flex-1 pb-28">
        <div className="container mx-auto px-3 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Page Header */}
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUpVariants}
            >
              <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-2">
                {t('documents.prepTitle')}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t('documents.prepDescription')}
              </p>
            </motion.div>

            {/* Document Preparation */}
            {!activeDocument && (
              <motion.section 
                custom={1}
                initial="hidden"
                animate="visible"
                variants={fadeUpVariants}
              >
                <DocumentPrepCard
                  drafts={documentDrafts}
                  onStartDocument={handleStartDocument}
                  onEditDocument={handleEditDocument}
                />
              </motion.section>
            )}

            {/* Document Wizard */}
            {activeDocument && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <DocumentWizard
                  documentType={activeDocument}
                  onComplete={handleDocumentComplete}
                  onCancel={handleDocumentCancel}
                  onAskForHelp={handleDocumentHelp}
                  existingDraft={documentDrafts[activeDocument]}
                />
              </motion.section>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
      <ChatWidget />
    </div>
  );
}

