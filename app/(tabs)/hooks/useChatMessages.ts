// import { useState, useEffect } from 'react';
// import { useSocket } from '../context/SocketContext';
// import api from '../../../api/axiosInstance';
// import { useAuth } from '../../../context/AuthContext';


// // Custom hook to manage chat messages
// export const useChatMessages = (receiverId: string) => {
//   const [messages, setMessages] = useState<any[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const socket = useSocket();
//   const { user } = useAuth();

//   useEffect(() => {
//     const fetchMessages = async () => {
//       try {
//         const response = await api.get(`/api/messages/${receiverId}`);
//         setMessages(response.data);
//       } catch (err) {
//         console.error('Failed to fetch messages:', err);
//       }
//     };
//     if (receiverId) fetchMessages();
//   }, [receiverId]);

//   useEffect(() => {
//     if (!socket || !user) return;

//     socket.on('newMessage', (message: any) => {
//       if (message.receiverId === user.userId) {
//         setMessages((prev) => [...prev, message]);
//         if (!message.read) setUnreadCount((prev) => prev + 1);
//       }
//     });

//     socket.on('messageRead', (messageId: string) => {
//       setMessages((prev) =>
//         prev.map((msg) => (msg._id === messageId ? { ...msg, read: true } : msg))
//       );
//       setUnreadCount(0);
//     });

//     return () => {
//       socket.off('newMessage');
//       socket.off('messageRead');
//     };
//   }, [socket, user]);

//   return { messages, unreadCount, setUnreadCount };
// };