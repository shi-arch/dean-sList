import { useCallback } from 'react';
import api from '../../../api/axiosInstance';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../../../context/AuthContext';

export const useSendMessage = () => {
  const socket = useSocket();
  const { user } = useAuth();

  const sendMessage = useCallback(
    async (receiverId: string, content: string, file?: any) => {
      const trimmed = (content || '').trim();
      const hasFile = !!file?.uri;
      let res;

      try {
        if (hasFile) {
          const form = new FormData();
          form.append('message', trimmed);
          form.append('file', {
            uri: file.uri,
            name: file.name || 'upload',
            type: file.mimeType || 'application/octet-stream',
          } as any);

          res = await api.post(`/api/messages/send/${receiverId}`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          res = await api.post(`/api/messages/send/${receiverId}`, { message: trimmed });
        }

        if (socket && user?.userId) {
          socket.emit('sendMessage', {
            senderId: user.userId,
            receiverId,
            message: trimmed,
            file: res.data?.file,
          });
        }

        return res.data;
      } catch (err: any) {
        console.error('[sendMessage] failed', err?.response?.data || err?.message || err);
        throw err;
      }
    },
    [socket, user?.userId]
  );

  return { sendMessage };
};