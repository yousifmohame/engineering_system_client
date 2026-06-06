import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../../api/axios"; // مسار الـ API بناءً على مشروعك

export const useQuickLinks = (currentUser) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("usage");

  // Fetch Data
  const { data: links = [], isLoading: isLoadingLinks } = useQuery({
    queryKey: ["quick-links"],
    queryFn: async () => (await api.get("/quick-links")).data.data,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["link-categories"],
    queryFn: async () => (await api.get("/quick-links/categories")).data.data,
  });

  // Mutations
  const mutations = {
    saveLink: useMutation({
      mutationFn: async ({ payload, isEditing, id }) => {
        const data = { ...payload };
        if (data.hasInfiniteExpiry) data.validUntil = null;
        
        if (isEditing) {
          data.updatedBy = currentUser;
          return api.put(`/quick-links/${id}`, data);
        }
        data.createdBy = currentUser;
        return api.post("/quick-links", data);
      },
      onSuccess: () => {
        toast.success("تم حفظ الرابط بنجاح");
        queryClient.invalidateQueries(["quick-links"]);
      },
    }),
    deleteLink: useMutation({
      mutationFn: async (id) => api.delete(`/quick-links/${id}`),
      onSuccess: () => {
        toast.success("تم الحذف بنجاح");
        queryClient.invalidateQueries(["quick-links"]);
      },
    }),
    togglePin: useMutation({
      mutationFn: async ({ id, isPinned }) => api.put(`/quick-links/${id}`, { isPinned, updatedBy: currentUser }),
      onSuccess: () => queryClient.invalidateQueries(["quick-links"]),
    }),
    reorderLinks: useMutation({
      mutationFn: async (data) => api.post("/quick-links/reorder", data),
      onSuccess: () => queryClient.invalidateQueries(["quick-links"]),
    }),
    incrementUsage: useMutation({
      mutationFn: async (id) => api.post(`/quick-links/${id}/increment`),
      onSuccess: () => queryClient.invalidateQueries(["quick-links"]),
    }),
    addCategory: useMutation({
      mutationFn: async (name) => api.post("/quick-links/categories", { name }),
      onSuccess: () => {
        toast.success("تم إضافة التصنيف");
        queryClient.invalidateQueries(["link-categories"]);
      },
    }),
    deleteCategory: useMutation({
      mutationFn: async (id) => api.delete(`/quick-links/categories/${id}`),
      onSuccess: () => {
        toast.success("تم الحذف");
        queryClient.invalidateQueries(["link-categories"]);
      },
    }),
  };

  // Logic: Filtering, Sorting, and Grouping
  const groupedLinks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    
    const filtered = !q
      ? links
      : links.filter((link) => (
          link.title?.toLowerCase().includes(q) ||
          link.url?.toLowerCase().includes(q) ||
          link.description?.toLowerCase().includes(q) ||
          link.category?.name?.toLowerCase().includes(q) ||
          link.accessLevel?.toLowerCase().includes(q)
        ));

    const sorted = [...filtered].sort((a, b) => {
      if (a.isPinned && b.isPinned) return a.pinOrder - b.pinOrder;
      if (a.isPinned) return -1;
      if (b.isPinned) return 1;
      return sortBy === "usage" ? b.usageCount - a.usageCount : new Date(b.createdAt) - new Date(a.createdAt);
    });

    const groups = {};
    sorted.forEach((link) => {
      const catName = link.category?.name || "بدون تصنيف";
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(link);
    });

    return groups;
  }, [links, sortBy, searchQuery]);

  // Derived Stats
  const stats = {
    total: links.length,
    pinned: links.filter(l => l.isPinned).length,
    protected: links.filter(l => l.requiresLogin).length,
    categoriesCount: Object.keys(groupedLinks).length,
  };

  return {
    links, categories, groupedLinks, stats, isLoadingLinks,
    searchQuery, setSearchQuery, sortBy, setSortBy, mutations
  };
};