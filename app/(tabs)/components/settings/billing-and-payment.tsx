import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Assets from '../../../../assets';
import Header from '../../components/MainHeader';
import ActionButtons from '../../components/buttons/action-button';
import AddPaymentMethodModal from '../../components/settings/add-payment-method-modal';

const BillingAndPayment: React.FC = () => {
  const [connectedCards, setConnectedCards] = useState([
    { id: '1', type: 'Visa', lastFour: '9275', expiry: '04/27', icon: 'visa' },
    { id: '2', type: 'MasterCard', lastFour: '3466', expiry: '02/28', icon: 'mastercard' },
  ]);

  const [connectedAccounts, setConnectedAccounts] = useState([
    { id: '1', name: 'Robert Fox', email: '***********@gmail.com', type: 'paypal' },
    { id: '2', name: 'Robert F.', account: 'Chase - *********6427', type: 'bank' },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [isAddPaymentModalVisible, setIsAddPaymentModalVisible] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleAddPaymentMethod = () => {
    setIsAddPaymentModalVisible(true);
  };

  const handleRemoveCard = (id: string) => {
    setConnectedCards(connectedCards.filter(card => card.id !== id));
    setIsEditing(true);
  };

  const handleRemoveAccount = (id: string) => {
    setConnectedAccounts(connectedAccounts.filter(account => account.id !== id));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original state if needed
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
    // Save changes logic here
    console.log('Changes saved');
  };

  const handleAddPayment = (newPayment: any) => {
    if (newPayment.type === 'card') {
      setConnectedCards([...connectedCards, {
        id: String(connectedCards.length + 1),
        type: newPayment.cardType,
        lastFour: newPayment.lastFour,
        expiry: newPayment.expiry,
        icon: newPayment.cardType.toLowerCase(),
      }]);
    } else if (newPayment.type === 'account') {
      setConnectedAccounts([...connectedAccounts, {
        id: String(connectedAccounts.length + 1),
        name: newPayment.accountHolderName,
        email: newPayment.type === 'paypal' ? newPayment.email : undefined,
        account: newPayment.type === 'bank' ? `${newPayment.bankName} - ********${newPayment.accountNumber.slice(-4)}` : undefined,
        type: newPayment.accountType,
      }]);
    }
    setIsEditing(true);
    setIsAddPaymentModalVisible(false);
  };

const renderCardIcon = (type: string) => {
  if (type === 'visa') {
    return (
      <View className="w-9 h-9 bg-white rounded items-center justify-center">
        <Assets.icons.visa height={24} width={24} />
      </View>
    );
  } else if (type === 'mastercard') {
    return (
      <View className="w-9 h-9 bg-white rounded items-center justify-center">
        <Assets.icons.mastercard height={24} width={24} />

      </View>
    );
  }
  return <Assets.icons.dollar width={24} height={24} stroke="#000000" />;
};

const renderAccountIcon = (type: string) => {
  if (type === 'paypal') {
    return (
      <View className="w-9 h-9 bg-white rounded items-center justify-center">
        <Assets.icons.paypal height={24} width={24} />

      </View>
    );
  } else if (type === 'bank') {
    return (
      <View className="w-9 h-9 bg-white rounded items-center justify-center">
        <Assets.icons.bank height={24} width={24} />

      </View>
    );
  }
  return <Assets.icons.dollar width={24} height={24} stroke="#000000" />;
};9

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <Header
        title="Billing & Payments"
        onBackPress={handleBack}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Payment Methods Header */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-black mb-1">
            Payment Methods
          </Text>
          <Text className="text-gray-500 text-sm mb-4">
            Add or remove payment methods.
          </Text>

          {/* Connected Cards Section */}
          <Text className="text-gray-600 text-sm font-medium mb-3">
            Connected Cards
          </Text>
          
          {connectedCards.map(card => (
            <View
              key={card.id}
              className="flex-row items-center justify-between bg-white border border-gray-200 rounded-lg p-4 mb-3"
            >
              <View className="flex-row items-center flex-1">
                {renderCardIcon(card.icon)}
                <View className="ml-3 flex-1">
                  <Text className="text-black text-base font-medium">
                    •••• •••• •••• {card.lastFour}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    Exp. date {card.expiry}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveCard(card.id)}
                className="p-2"
              >
                <Assets.icons.delete width={18} height={18} stroke="#666666" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Connected Accounts Section */}
          <Text className="text-gray-600 text-sm font-medium mb-3 mt-4">
            Connected Accounts
          </Text>
          
          {connectedAccounts.map(account => (
            <View
              key={account.id}
              className="flex-row items-center justify-between bg-white border border-gray-200 rounded-lg p-4 mb-3"
            >
              <View className="flex-row items-center flex-1">
                {renderAccountIcon(account.type)}
                <View className="ml-3 flex-1">
                  <Text className="text-black text-base font-medium">
                    {account.name}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {account.email || account.account}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveAccount(account.id)}
                className="p-2"
              >
                <Assets.icons.delete width={18} height={18} stroke="#666666" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Add Payment Method Button */}
        <TouchableOpacity
          onPress={handleAddPaymentMethod}
          className="bg-black rounded-lg py-4 px-4 items-center justify-center mb-6"
        >
          <Text className="text-white font-medium text-sm">
            Add Payment Method
          </Text>
        </TouchableOpacity>

        {/* Action Buttons - Show when editing */}
        {isEditing && (
          <View className="mb-6">
            <ActionButtons
              onCancel={handleCancel}
              onPrimaryAction={handleSaveChanges}
              cancelText="Cancel"
              primaryText="Save Changes"
              containerStyle="flex-row space-x-2 min-h-[44px]"
              cancelButtonStyle="border border-gray-300 rounded-lg py-3 px-4 flex-1 items-center justify-center min-w-[120px]"
              primaryButtonStyle="bg-red-500 rounded-lg py-3 px-4 flex-1 items-center justify-center min-w-[120px]"
              cancelTextStyle="text-gray-700 font-medium text-sm whitespace-nowrap"
              primaryTextStyle="text-white font-medium text-sm whitespace-nowrap"
            />
          </View>
        )}
      </ScrollView>

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        visible={isAddPaymentModalVisible}
        onClose={() => setIsAddPaymentModalVisible(false)}
        onAddPayment={handleAddPayment}
      />
    </SafeAreaView>
  );
};

export default BillingAndPayment;