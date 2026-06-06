import React, { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { useQuickLinks } from "./useQuickLinks";

import Header from "./components/Header";
import LinksTable from "./components/LinksTable";
import LinkModal from "./modals/LinkModal";
import CategoryModal from "./modals/CategoryModal";

export default function QuickLinksScreen() {
  const { user } = useAuth();
  const currentUser = user?.name || "موظف النظام";

  // استدعاء العقل المدبر (Custom Hook)
  const {
    links, categories, groupedLinks, stats, isLoadingLinks,
    searchQuery, setSearchQuery, sortBy, setSortBy, mutations
  } = useQuickLinks(currentUser);

  // حالات النوافذ المنبثقة
  const [modalState, setModalState] = useState({ isOpen: false, linkToEdit: null });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Handlers (ربط الواجهة بالوظائف)
  const handleOpenLink = (link) => {
    mutations.incrementUsage.mutate(link.id);
    window.open(link.url, "_blank");
  };

  const handlePinToggle = (link) => {
    if (!link.isPinned && stats.pinned >= 10) return toast.error("لا يمكن تثبيت أكثر من 10 روابط.");
    mutations.togglePin.mutate({ id: link.id, isPinned: !link.isPinned });
  };

  const handleMovePinned = (catLinks, index, direction) => {
    const pinnedOnly = catLinks.filter((l) => l.isPinned);
    const globalIndex = pinnedOnly.findIndex((l) => l.id === catLinks[index].id);

    if (direction === "up" && globalIndex > 0) {
      mutations.reorderLinks.mutate({
        link1Id: pinnedOnly[globalIndex].id, link1Order: pinnedOnly[globalIndex - 1].pinOrder || 0,
        link2Id: pinnedOnly[globalIndex - 1].id, link2Order: pinnedOnly[globalIndex].pinOrder || 0,
      });
    } else if (direction === "down" && globalIndex < pinnedOnly.length - 1) {
      mutations.reorderLinks.mutate({
        link1Id: pinnedOnly[globalIndex].id, link1Order: pinnedOnly[globalIndex + 1].pinOrder || 0,
        link2Id: pinnedOnly[globalIndex + 1].id, link2Order: pinnedOnly[globalIndex].pinOrder || 0,
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col gap-2 overflow-hidden bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white p-2 font-sans md:p-3 2xl:p-4" dir="rtl">
      
      <Header 
        stats={stats} 
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        sortBy={sortBy} setSortBy={setSortBy}
        onOpenLinkModal={() => setModalState({ isOpen: true, linkToEdit: null })}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
      />

      <div className="min-h-0 flex-1 overflow-auto rounded-[20px] border border-[#d8b46a]/30 bg-white shadow-[0_14px_34px_rgba(18,63,89,0.10)] 2xl:rounded-[26px]">
        {isLoadingLinks ? (
           <div className="p-12 text-center text-[#123f59] font-bold text-sm">جاري تحميل الروابط...</div>
        ) : (
          <LinksTable 
            groupedLinks={groupedLinks} 
            sortBy={sortBy}
            onOpenLink={handleOpenLink}
            onPinToggle={handlePinToggle}
            onMovePinned={handleMovePinned}
            onEdit={(link) => setModalState({ isOpen: true, linkToEdit: link })}
            onDelete={(link) => { if (window.confirm("هل أنت متأكد من حذف هذا الرابط؟")) mutations.deleteLink.mutate(link.id); }}
          />
        )}
      </div>

      {modalState.isOpen && (
        <LinkModal 
          categories={categories} 
          linkToEdit={modalState.linkToEdit} 
          onClose={() => setModalState({ isOpen: false, linkToEdit: null })} 
          onSave={(payload) => mutations.saveLink.mutate({ payload, isEditing: !!modalState.linkToEdit, id: modalState.linkToEdit?.id })}
          isSaving={mutations.saveLink.isPending}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryModal 
          categories={categories} 
          onClose={() => setIsCategoryModalOpen(false)}
          onAdd={(name) => mutations.addCategory.mutate(name)}
          onDelete={(id) => { if (window.confirm("سيتم حذف التصنيف، تأكيد؟")) mutations.deleteCategory.mutate(id); }}
        />
      )}
    </div>
  );
}