import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios'; // تأكد من مسار الـ axios الخاص بك
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. جلب الإشعارات الحقيقية من الداتا بيز
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data.data;
    },
    // لا تعمل الدالة إلا إذا كان المستخدم مسجلاً للدخول
    enabled: !!user?.id, 
    // السحر هنا: سيقوم بسؤال الباك إند كل 30 ثانية في الخلفية بصمت
    refetchInterval: 30000, 
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // 2. دالة تحديث إشعار واحد كمقروء
  const markAsReadMutation = useMutation({
    mutationFn: async (id) => {
      await api.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      // إجبار React Query على جلب البيانات الحديثة فوراً لتحديث العداد
      queryClient.invalidateQueries(['notifications']);
    }
  });

  // 3. دالة تحديد الكل كمقروء
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.put('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const markAsRead = (id) => markAsReadMutation.mutate(id);
  const markAllAsRead = () => markAllAsReadMutation.mutate();

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};