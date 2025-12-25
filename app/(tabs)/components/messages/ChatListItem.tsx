// import React from 'react';
// import { View, Text, Image, TouchableOpacity } from 'react-native';
// import { useRouter } from 'expo-router';

// // Component for seller list item in search
// const ChatListItem: React.FC<{ seller: any }> = ({ seller }) => {
//   const router = useRouter();

//   const handleChat = () => {
//     router.push(`/messages/${seller.id}`);
//   };

//   return (
//     <TouchableOpacity onPress={handleChat} className="flex-row items-center p-2 border-b">
//       <Image
//         source={{ uri: seller.image || 'http://192.168.29.179:5000/stories/profile1.png' }}
//         className="w-12 h-12 rounded-full mr-2"
//       />
//       <View>
//         <Text className="font-bold">{seller.name}</Text>
//         <Text className="text-gray-500">{seller.location}</Text>
//       </View>
//     </TouchableOpacity>
//   );
// };

// export default ChatListItem;