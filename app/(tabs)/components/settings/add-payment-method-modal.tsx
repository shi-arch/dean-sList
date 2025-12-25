import Assets from "@/assets";
import { router } from "expo-router";
import React, { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import ActionButtons from "../buttons/action-button";

interface AddPaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onAddPayment: (payment: any) => void;
}

const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
  visible,
  onClose,
  onAddPayment,
}) => {
  const [currentStep, setCurrentStep] = useState<"select" | "card" | "bank">(
    "select"
  );
  const [selectedPaypal, setSelectedPaypal] = useState(false); // Track PayPal selection

  // Card form state
  const [cardFormData, setCardFormData] = useState({
    cardNumber: "",
    nameOnCard: "",
    expiryDate: "",
    cvc: "",
  });

  // Bank form state
  const [bankFormData, setBankFormData] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    accountType: "",
  });

  // PayPal form state (if needed)
  const [paypalData, setPaypalData] = useState({
    email: "",
  });

  const [showAccountTypeOptions, setShowAccountTypeOptions] = useState(false);
  const accountTypeOptions = ["Savings", "Checking"];

  const paymentMethods = [
    { id: "paypal", label: "Paypal", icon: "paypal", type: "radio" },
    {
      id: "card",
      label: "Credit/Debit Card",
      icon: "creditCard",
      type: "button",
    },
    { id: "bank", label: "Bank Account", icon: "bank", type: "button" },
  ];

  const resetModal = () => {
    setCurrentStep("select");
    setSelectedPaypal(false);
    setCardFormData({
      cardNumber: "",
      nameOnCard: "",
      expiryDate: "",
      cvc: "",
    });
    setBankFormData({
      accountHolderName: "",
      bankName: "",
      accountNumber: "",
      accountType: "",
    });
    setPaypalData({ email: "" });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSelectMethod = (method: string) => {
    if (method === "paypal") {
      setSelectedPaypal(!selectedPaypal); // Toggle PayPal selection
    } else if (method === "card") {
      setCurrentStep("card");
    } else if (method === "bank") {
      setCurrentStep("bank");
    }
  };

  const handleCardFormChange = (field: string, value: string) => {
    setCardFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBankFormChange = (field: string, value: string) => {
    setBankFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaypalSubmit = () => {
    if (!selectedPaypal) return;
    // For PayPal, we might just need email or handle OAuth
    onAddPayment({
      type: "account",
      accountType: "paypal",
      accountHolderName: "PayPal User", // This would come from PayPal API
      email: paypalData.email || "user@paypal.com",
    });
    router.push("/(tabs)/payment");

    handleClose();
  };

  const handleCardSubmit = () => {
    if (
      !cardFormData.cardNumber ||
      !cardFormData.nameOnCard ||
      !cardFormData.expiryDate ||
      !cardFormData.cvc
    ) {
      return;
    }

    // Determine card type based on card number (simplified)
    const cardType = cardFormData.cardNumber.startsWith("4")
      ? "Visa"
      : "MasterCard";

    onAddPayment({
      type: "card",
      cardType: cardType,
      lastFour: cardFormData.cardNumber.slice(-4),
      expiry: cardFormData.expiryDate,
    });
    handleClose();
  };

  const handleBankSubmit = () => {
    if (
      !bankFormData.accountHolderName ||
      !bankFormData.bankName ||
      !bankFormData.accountNumber
    ) {
      return;
    }

    onAddPayment({
      type: "account",
      accountType: "bank",
      accountHolderName: bankFormData.accountHolderName,
      bankName: bankFormData.bankName,
      accountNumber: bankFormData.accountNumber,
    });
    handleClose();
  };

  const handleBack = () => {
    setCurrentStep("select");
  };

  const handleAccountTypeSelect = (type: string) => {
    setBankFormData((prev) => ({ ...prev, accountType: type }));
    setShowAccountTypeOptions(false);
  };

  const renderIcon = (icon: string) => {
    if (icon === "creditCard") {
      return (
        <View className="w-9 h-9 bg-gray-100 rounded items-center justify-center">
          <Assets.icons.creditcard height={24} width={24} />
        </View>
      );
    } else if (icon === "paypal") {
      return (
        <View className="w-9 h-9 bg-blue-100 rounded items-center justify-center">
          <Assets.icons.paypal height={24} width={24} />
        </View>
      );
    } else if (icon === "bank") {
      return (
        <View className="w-9 h-9 bg-gray-100 rounded items-center justify-center">
          <Assets.icons.bank height={24} width={24} />
        </View>
      );
    }
    return null;
  };

  const renderSelectMethodModal = () => (
    <View className="flex-1 bg-black/50 justify-end">
      <View className="bg-white rounded-t-lg p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-lg font-semibold text-black">
            New Payment Method
          </Text>
          <TouchableOpacity onPress={handleClose}>
            <Assets.icons.close height={24} width={24} />
          </TouchableOpacity>
        </View>

        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            className="flex-row items-center justify-between border-b border-gray-100 py-4"
            onPress={() => handleSelectMethod(method.id)}
          >
            <View className="flex-row items-center">
              {renderIcon(method.icon)}
              <Text className="ml-3 text-black text-base">{method.label}</Text>
            </View>
            {method.type === "radio" ? (
              <View className="w-6 h-6">
                {selectedPaypal && method.id === "paypal" ? (
                  <Assets.icons.radioSelected
                    height={24}
                    width={24}
                    fill="#FF0000"
                    stroke="#FF0000"
                  />
                ) : (
                  <Assets.icons.radio
                    height={24}
                    width={24}
                    stroke="#FF0000"
                    fill="#FF0000"
                  />
                )}
              </View>
            ) : (
              <Assets.icons.rightArrow
                height={24}
                width={24}
                stroke="#9CA3AF"
              />
            )}
          </TouchableOpacity>
        ))}

        <View className="mt-6">
          <ActionButtons
            onCancel={handleClose}
            onPrimaryAction={handlePaypalSubmit}
            cancelText="Cancel"
            primaryText="Connect"
            containerStyle="flex-row space-x-2 min-h-[44px]"
            cancelButtonStyle="border border-gray-300 rounded-lg py-3 px-4 flex-1 items-center justify-center min-w-[120px]"
            primaryButtonStyle={`rounded-lg py-3 px-4 flex-1 items-center justify-center min-w-[120px] ${
              selectedPaypal ? "bg-red-500" : "bg-gray-300"
            }`}
            cancelTextStyle="text-gray-700 font-medium text-sm whitespace-nowrap"
            primaryTextStyle="text-white font-medium text-sm whitespace-nowrap"
            isPrimaryDisabled={!selectedPaypal}
          />
        </View>
      </View>
    </View>
  );

  const renderCardFormModal = () => (
    <View className="flex-1 bg-black/50 justify-end">
      <View className="bg-white rounded-t-lg p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-lg font-semibold text-black">
            New Payment Method
          </Text>
          <TouchableOpacity onPress={handleClose}>
            <Assets.icons.close height={24} width={24} />
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 text-sm font-medium mb-2">
            Card Number
          </Text>
          <TextInput
            placeholder="6374 3856 8174 9174"
            placeholderTextColor="#9CA3AF"
            className="border border-gray-200 rounded-lg p-3 text-base"
            value={cardFormData.cardNumber}
            onChangeText={(text) => handleCardFormChange("cardNumber", text)}
            keyboardType="numeric"
          />
          <View className="absolute right-3 top-8">
            <View className="w-8 h-5 bg-red-500 rounded">
              <Text className="text-white text-xs text-center leading-5">
                MC
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 text-sm font-medium mb-2">
            Name on Card
          </Text>
          <TextInput
            placeholder="Ex. Robert Fox"
            placeholderTextColor="#9CA3AF"
            className="border border-gray-200 rounded-lg p-3 text-base"
            value={cardFormData.nameOnCard}
            onChangeText={(text) => handleCardFormChange("nameOnCard", text)}
          />
        </View>

        <View className="flex-row space-x-3 mb-6">
          <View className="flex-1">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Expiry Date
            </Text>
            <TextInput
              placeholder="MM/YY"
              placeholderTextColor="#9CA3AF"
              className="border border-gray-200 rounded-lg p-3 text-base"
              value={cardFormData.expiryDate}
              keyboardType="numeric"
              maxLength={5} // restrict to MM/YY
              onChangeText={(text) => {
                // Remove any non-digit and slash characters
                let cleaned = text.replace(/[^\d]/g, "");

                // Format and validate MM/YY
                if (cleaned.length === 0) {
                  handleCardFormChange("expiryDate", "");
                  return;
                }

                // Limit MM to 01-12
                if (cleaned.length >= 1) {
                  if (parseInt(cleaned[0]) > 1) {
                    cleaned = "0" + cleaned[0]; // e.g., 4 -> 04
                  }
                }

                if (cleaned.length >= 2) {
                  const month = parseInt(cleaned.slice(0, 2), 10);
                  if (month < 1 || month > 12) {
                    return; // Don't allow invalid month
                  }
                }

                let formatted = cleaned;
                if (cleaned.length > 2) {
                  formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
                }

                handleCardFormChange("expiryDate", formatted);
              }}
            />
          </View>
          <View className="flex-1">
            <Text className="text-gray-700 text-sm font-medium mb-2">CVC</Text>
            <TextInput
              placeholder="•••"
              placeholderTextColor="#9CA3AF"
              className="border border-gray-200 rounded-lg p-3 text-base"
              value={cardFormData.cvc}
              onChangeText={(text) => handleCardFormChange("cvc", text)}
              keyboardType="numeric"
              secureTextEntry
            />
          </View>
        </View>

        <View className="mt-6">
          <ActionButtons
            onCancel={handleBack}
            onPrimaryAction={handleCardSubmit}
            cancelText="Cancel"
            primaryText="Add Card"
            containerStyle="flex-row space-x-2 min-h-[44px]"
            cancelButtonStyle="border border-gray-300 rounded-lg py-3 px-4 flex-1 items-center justify-center min-w-[120px]"
            primaryButtonStyle="bg-red-500 rounded-lg py-3 px-4 flex-1 items-center justify-center min-w-[120px]"
            cancelTextStyle="text-gray-700 font-medium text-sm whitespace-nowrap"
            primaryTextStyle="text-white font-medium text-sm whitespace-nowrap"
          />
        </View>
      </View>
    </View>
  );

  const renderBankFormModal = () => (
    <View className="flex-1 bg-black/50 justify-end">
      <View className="bg-white rounded-t-lg p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-lg font-semibold text-black">
            New Payment Method
          </Text>
          <TouchableOpacity onPress={handleClose}>
            <Assets.icons.close height={24} width={24} />
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <TextInput
            placeholder="Robert Fox"
            placeholderTextColor="#9CA3AF"
            className="border border-gray-200 rounded-lg p-3 text-base"
            value={bankFormData.accountHolderName}
            onChangeText={(text) =>
              handleBankFormChange("accountHolderName", text)
            }
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 text-sm font-medium mb-2">
            Bank Name
          </Text>
          <TextInput
            placeholder="Ex. Chase"
            placeholderTextColor="#9CA3AF"
            className="border border-gray-200 rounded-lg p-3 text-base"
            value={bankFormData.bankName}
            onChangeText={(text) => handleBankFormChange("bankName", text)}
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 text-sm font-medium mb-2">
            Account Number
          </Text>
          <TextInput
            placeholder="463728459204758"
            placeholderTextColor="#9CA3AF"
            className="border border-gray-200 rounded-lg p-3 text-base"
            value={bankFormData.accountNumber}
            onChangeText={(text) => handleBankFormChange("accountNumber", text)}
            keyboardType="numeric"
          />
        </View>

        <View className="mb-6 relative">
          <Text className="text-gray-700 text-sm font-medium mb-2">
            Account Type
          </Text>
          <TouchableOpacity
            className="border border-gray-200 rounded-lg p-3 flex-row justify-between items-center"
            onPress={() => setShowAccountTypeOptions(!showAccountTypeOptions)}
          >
            <Text
              className={
                bankFormData.accountType ? "text-black" : "text-gray-400"
              }
            >
              {bankFormData.accountType || "Ex. Savings"}
            </Text>
            <Assets.icons.downArrow height={24} width={24} />
          </TouchableOpacity>

          {showAccountTypeOptions && (
            <View className="absolute top-[100%] left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 z-10">
              {accountTypeOptions.map((type) => (
                <TouchableOpacity
                  key={type}
                  className="p-3 border-b border-gray-100 last:border-b-0"
                  onPress={() => handleAccountTypeSelect(type)}
                >
                  <Text className="text-gray-700">{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View className="mt-6">
          <ActionButtons
            onCancel={handleBack}
            onPrimaryAction={handleBankSubmit}
            cancelText="Cancel"
            primaryText="Add Account"
            containerStyle="flex-row space-x-2 min-h-[44px]"
            cancelButtonStyle="border border-gray-300 rounded-lg py-3 px-4 flex-1 items-center justify-center min-w-[120px]"
            primaryButtonStyle="bg-red-500 rounded-lg py-3 px-4 flex-1 items-center justify-center min-w-[120px]"
            cancelTextStyle="text-gray-700 font-medium text-sm whitespace-nowrap"
            primaryTextStyle="text-white font-medium text-sm whitespace-nowrap"
          />
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      {currentStep === "select" && renderSelectMethodModal()}
      {currentStep === "card" && renderCardFormModal()}
      {currentStep === "bank" && renderBankFormModal()}
    </Modal>
  );
};

export default AddPaymentMethodModal;
