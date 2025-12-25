import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../MainHeader';

const PrivacyPolicy: React.FC = () => {
  const handleBack = () => {
    router.back();
  };

  const handleNotificationPress = () => {
    router.push('/(tabs)/notifications');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title="Privacy Policy"
        showNotification={true}
        onBackPress={handleBack}
        onNotificationPress={handleNotificationPress}
      />
      <ScrollView className="flex-1 px-4">
        <View className="mb-6">
          <Text className="text-sm text-gray-500 mt-4 mb-2">Effective Date: May 31, 2025</Text>
          <Text className="text-lg font-bold text-black mb-2">
            We value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you use our platform, which includes our website and mobile application.
          </Text>

          {/* 1. Information We Collect */}
          <Text className="text-base font-bold text-black mt-4 mb-2">1. Information We Collect</Text>
          <Text className="text-sm text-gray-600 mb-4">
            Personal Information:
            {'\n'}• Name, email address, phone number, and mailing address
            {'\n'}• Payment information (e.g., credit card details, bank account information)
            {'\n'}• Profile information, such as your biography, portfolio, and service offerings
            {'\n\n'}
            Usage Data:
            {'\n'}• Details about your interactions with our platform, including search queries, page views, and activity logs
            {'\n'}• Device information, including IP address, browser type, and operating system
          </Text>

          {/* 2. How We Use Your Information */}
          <Text className="text-base font-bold text-black mt-4 mb-2">2. How We Use Your Information</Text>
          <Text className="text-sm text-gray-600 mb-4">
            We use the information we collect to:
            {'\n'}• Provide, operate, and maintain our platform
            {'\n'}• Process transactions and manage payments
            {'\n'}• Communicate with you about your account, services, and updates
            {'\n'}• Personalize your experience on our platform
            {'\n'}• Improve our services and develop new features
            {'\n'}• Ensure compliance with our terms and policies
            {'\n'}• Detect, prevent, and address technical issues or fraud
          </Text>

          {/* 3. How We Share Your Information */}
          <Text className="text-base font-bold text-black mt-4 mb-2">3. How We Share Your Information</Text>
          <Text className="text-sm text-gray-600 mb-4">
            We may share your information with:
            {'\n'}• Service Providers: Third-party vendors who assist us in operating our platform and providing services to you
            {'\n'}• Payment Processors: Financial institutions and payment processors to facilitate transactions
            {'\n'}• Business Partners: Other companies with whom we collaborate for co-branded services or joint marketing activities
            {'\n'}• Legal Requirements: Authorities, if required by law or to protect our legal rights
          </Text>

          {/* 4. Data Security */}
          <Text className="text-base font-bold text-black mt-4 mb-2">4. Data Security</Text>
          <Text className="text-sm text-gray-600 mb-4">
            We implement a variety of security measures to maintain the safety of your personal information. However, please be aware that no method of transmission over the internet or electronic storage is 100% secure.
          </Text>

          {/* 5. Your Choices */}
          <Text className="text-base font-bold text-black mt-4 mb-2">5. Your Choices</Text>
          <Text className="text-sm text-gray-600 mb-4">
            You have the following rights regarding your personal information:
            {'\n'}• Access and Update: You can access and update your personal information through your account settings.
            {'\n'}• Delete: You can request the deletion of your account and personal information.
            {'\n'}• Opt-Out: You can opt-out of receiving promotional emails by following the unsubscribe instructions in those emails.
          </Text>

          {/* 6. Third-Party Links */}
          <Text className="text-base font-bold text-black mt-4 mb-2">6. Third-Party Links</Text>
          <Text className="text-sm text-gray-600 mb-4">
            Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices or content of those third parties.
          </Text>

          {/* 7. Changes to This Privacy Policy */}
          <Text className="text-base font-bold text-black mt-4 mb-2">7. Changes to This Privacy Policy</Text>
          <Text className="text-sm text-gray-600 mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on our platform and updating the effective date. Your continued use of the platform after any changes indicates your acceptance of the new terms.
          </Text>

          {/* 8. Contact Us */}
          <Text className="text-base font-bold text-black mt-4 mb-2">8. Contact Us</Text>
          <Text className="text-sm text-gray-600 mb-4">
            If you have any questions about this Privacy Policy, please contact us at:
            {'\n\n'}
            Email: support@talentconnect.com
            {'\n'}
            Address: TalentConnect Inc., 123 Artist Lane, San Francisco, CA 94105
            {'\n\n'}
            Thank you for using TalentConnect. Your privacy is important to us, and we are committed to protecting your personal information. This Privacy Policy outlines how TalentConnect manages and protects your personal data, ensuring transparency and compliance with applicable privacy laws.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicy;