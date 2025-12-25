import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../MainHeader';

const TermsOfService: React.FC = () => {
  const handleBack = () => {
    router.back();
  };

  const handleNotificationPress = () => {
    router.push('/(tabs)/notifications');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title="Terms of Service"
        showNotification={true}
        onBackPress={handleBack}
        onNotificationPress={handleNotificationPress}
      />
      <ScrollView className="flex-1 px-4">
        <View className="mb-6">
          <Text className="text-sm text-gray-500 mt-4 mb-2">Effective Date: May 31, 2025</Text>
          <Text className="text-lg font-bold text-black mb-2">
            Welcome to TalentConnect! These Terms of Service ("Terms") govern your use of our platform, which includes our website and mobile application. By accessing or using our platform, you agree to comply with and be bound by these Terms. If you do not agree to these Terms, please do not use our platform.
          </Text>

          {/* 1. Acceptance of Terms */}
          <Text className="text-base font-bold text-black mt-4 mb-2">1. Acceptance of Terms</Text>
          <Text className="text-sm text-gray-600 mb-4">
            By creating an account, accessing, or using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
          </Text>

          {/* 2. Use of the Platform */}
          <Text className="text-base font-bold text-black mt-4 mb-2">2. Use of the Platform</Text>
          <Text className="text-sm text-gray-600 mb-4">
            Eligibility: You must be at least 18 years old to use our platform. By using our platform, you represent and warrant that you meet this age requirement.
            {'\n\n'}
            Account Registration: To access certain features, you may need to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            {'\n\n'}
            Prohibited Activities: You agree not to:
            {'\n'}• Violate any local, state, national, or international law or regulation.
            {'\n'}• Engage in any fraudulent, deceptive, or misleading practices.
            {'\n'}• Post, upload, or distribute any content that is unlawful, infringing, defamatory, or harmful.
            {'\n'}• Interfere with or disrupt the platform or its servers or networks.
            {'\n'}• Use the platform for any commercial purpose without our express consent.
          </Text>

          {/* 3. Services and Payments */}
          <Text className="text-base font-bold text-black mt-4 mb-2">3. Services and Payments</Text>
          <Text className="text-sm text-gray-600 mb-4">
            Service Listings: Sellers (musicians) can create listings for their services. All listings must be accurate and not misleading. We reserve the right to remove any listings that violate these Terms.
            {'\n\n'}
            Booking and Payments: Buyers can book services from sellers through the platform. Payments will be processed through our secure payment gateway. Funds will be held in escrow and released according to our payment policies.
            {'\n\n'}
            Cancellation and Refunds: Cancellations and refunds are governed by our cancellation policies. Please review these policies before booking services.
          </Text>

          {/* 4. Dispute Resolution */}
          <Text className="text-base font-bold text-black mt-4 mb-2">4. Dispute Resolution</Text>
          <Text className="text-sm text-gray-600 mb-4">
            Dispute Management: We provide a dispute management system to help resolve conflicts between buyers and sellers. If a dispute arises, you agree to work in good faith with the other party and our support team to resolve the issue.
            {'\n\n'}
            Binding Arbitration: Any disputes that cannot be resolved through our dispute management system will be resolved through binding arbitration, rather than in court. This includes any claims related to the interpretation or enforcement of these Terms.
          </Text>

          {/* 5. User Content */}
          <Text className="text-base font-bold text-black mt-4 mb-2">5. User Content</Text>
          <Text className="text-sm text-gray-600 mb-4">
            Responsibility for Content: You are solely responsible for any content you post, upload, or otherwise make available on the platform. You agree not to post content that infringes on the rights of others or violates any laws.
            {'\n\n'}
            License to Use Content: By posting content on our platform, you grant us a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute your content in connection with the operation and promotion of the platform.
          </Text>

          {/* 6. Intellectual Property */}
          <Text className="text-base font-bold text-black mt-4 mb-2">6. Intellectual Property</Text>
          <Text className="text-sm text-gray-600 mb-4">
            Ownership: All intellectual property rights in and to the platform, including but not limited to software, text, graphics, and logos, are owned by or licensed to us. You may not use our intellectual property without our prior written consent.
            {'\n\n'}
            Infringement Claims: If you believe that your intellectual property rights have been infringed, please contact us at support@talentconnect.com with a detailed description of the alleged infringement.
          </Text>

          {/* 7. Limitation of Liability */}
          <Text className="text-base font-bold text-black mt-4 mb-2">7. Limitation of Liability</Text>
          <Text className="text-sm text-gray-600 mb-4">
            No Warranty: The platform is provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not guarantee that the platform will be uninterrupted or error-free.
            {'\n\n'}
            Limitation of Liability: To the fullest extent permitted by law, we disclaim all liability for any indirect, incidental, consequential, or punitive damages arising out of or related to your use of the platform. Our total liability to you for any claims arising from your use of the platform will not exceed the amount paid by you to us in the past twelve months.
          </Text>

          {/* 8. Indemnification */}
          <Text className="text-base font-bold text-black mt-4 mb-2">8. Indemnification</Text>
          <Text className="text-sm text-gray-600 mb-4">
            You agree to indemnify, defend, and hold harmless TalentConnect, its affiliates, and their respective officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses, including legal fees, arising out of or related to your use of the platform or violation of these Terms.
          </Text>

          {/* 9. Changes to These Terms */}
          <Text className="text-base font-bold text-black mt-4 mb-2">9. Changes to These Terms</Text>
          <Text className="text-sm text-gray-600 mb-4">
            We may update these Terms from time to time. We will notify you of any changes by posting the new Terms on our platform and updating the effective date. Your continued use of the platform after any changes indicates your acceptance of the new Terms.
          </Text>

          {/* 10. Termination */}
          <Text className="text-base font-bold text-black mt-4 mb-2">10. Termination</Text>
          <Text className="text-sm text-gray-600 mb-4">
            We reserve the right to suspend or terminate your account and access to the platform at our discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users of the platform, us, or third parties.
          </Text>

          {/* 11. Governing Law */}
          <Text className="text-base font-bold text-black mt-4 mb-2">11. Governing Law</Text>
          <Text className="text-sm text-gray-600 mb-4">
            These Terms are governed by and construed in accordance with the laws of California, USA, without regard to its conflict of law principles.
          </Text>

          {/* 12. Contact Us */}
          <Text className="text-base font-bold text-black mt-4 mb-2">12. Contact Us</Text>
          <Text className="text-sm text-gray-600 mb-4">
            If you have any questions about these Terms, please contact us at:
            {'\n\n'}
            Email: support@talentconnect.com
            {'\n'}
            Address: TalentConnect Inc., 123 Artist Lane, San Francisco, CA 94105
            {'\n\n'}
            Thank you for using TalentConnect. We hope you have a great experience!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsOfService;