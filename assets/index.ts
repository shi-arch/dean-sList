// assets/index.ts
// Centralized index file for all image and icon assets.
import React from 'react';
import { SvgProps } from 'react-native-svg';

// Images (PNG assets)
const images = {
  logo: require('./images/logo.png'),
  profile1: require('./images/profile1.png'),
  onboarding1: require('./images/1.jpg'),
  onboarding2: require('./images/2.jpg'),
  onboarding3: require('./images/3.jpg'),
};

// PNG Icons (static assets)
const pngIcons = {
  // filter: require('./icons/filter.png'),
  // calendar: require('./icons/calendar.png'),
  // notification: require('./icons/notification.svg'),
  // heart: require('./icons/heart.svg'),
  // home:require('./icons/home.svg'),
 
};

// SVG Icons (imported as components)
import AppleIcon from './icons/apple.svg';
import CalendarIcon from './icons/calendar.svg';
import CloseEyeIcon from './icons/close_eye.svg';
import FilterIcon from './icons/filter.svg';
import GoogleIcon from './icons/google.svg';
import HeartIcon from './icons/heart.svg';
import HomeIcon from './icons/home.svg';
import JobsIcon from './icons/jobs.svg';
import MessagesIcon from './icons/messages.svg';
import NotificationIcon from './icons/notification.svg';
import OpenEyeIcon from './icons/open_eye.svg';

import AeroplaneIcon from './icons/aeroplane.svg';
import AttachmentIcon from './icons/attachment.svg';
import BackIcon from './icons/back.svg';
import BankIcon from './icons/bank.svg';
import BookIcon from './icons/book.svg';
import CertificateIcon from './icons/certificate.svg';
import CheckMarkIcon from './icons/checkmark.svg';
import CloseIcon from './icons/close.svg';
import CreditCardIcon from './icons/credit-card.svg';
import DeleteIcon from './icons/delete.svg';
import DocumentIcon from './icons/document.svg';
import DollarIcon from './icons/dollar_payment.svg';
import MoreIcon from './icons/dot-more.svg';
import DoubleCheckIcon from './icons/double-check.svg';
import DownArrowIcon from './icons/down_arrow.svg';
import DownloadIcon from './icons/download.svg';
import EditIcon from './icons/edit.svg';
import EducationIcon from './icons/education.svg';
import EmailIcon from './icons/email.svg';
import ImageIcon from './icons/image.svg';
import LeftArrowIcon from './icons/left-arrow.svg';
import LocationIcon from './icons/location.svg';
import LogoutIcon from './icons/logout.svg';
import MasterCardIcon from './icons/mastercard.svg';
import MicIcon from './icons/mic.svg';
import OrdersIcon from './icons/orders.svg';
import PasswordSecurityIcon from './icons/password-security.svg';
import PaypalIcon from './icons/paypal.svg';
import PhoneIcon from './icons/phone.svg';
import PlayIcon from './icons/play.svg';
import PrivacyPolicyIcon from './icons/privacy-policy.svg';
import ProfileIcon from './icons/profile.svg';
import QuestionMarkIcon from './icons/question-mark.svg';
import RadioSelectedIcon from './icons/radio-selected.svg';
import RadioIcon from './icons/radio.svg';
import RightArrowIcon from './icons/right-arrow.svg';
import SearchIcon from './icons/search.svg';
import SendIcon from './icons/send.svg';
import StarIcon from './icons/star.svg';
import SuccessRightIcon from './icons/success-right-icon.svg';
import TermsAndServicesIcon from './icons/terms-and-services.svg';
import TimeIcon from './icons/time.svg';
import UpArrowIcon from './icons/up_arrow.svg';
import UploadIcon from './icons/upload.svg';
import VisaIcon from './icons/visa.svg';
import WarningIcon from './icons/warning.svg';
import PauseIcon from './icons/pause.svg';



// Define TypeScript interface for SVG icons
interface SvgIconAssets {
  home: React.FC<SvgProps>;
  orders: React.FC<SvgProps>;
  jobs: React.FC<SvgProps>;
  messages: React.FC<SvgProps>;
  google: React.FC<SvgProps>;
  apple: React.FC<SvgProps>;
  notification: React.FC<SvgProps>;
  heart: React.FC<SvgProps>;
  search: React.FC<SvgProps>;
  calendar: React.FC<SvgProps>;
  filter: React.FC<SvgProps>;
  closeEye: React.FC<SvgProps>;
  openEye: React.FC<SvgProps>;
  back: React.FC<SvgProps>;
  star: React.FC<SvgProps>;
  aeroplane: React.FC<SvgProps>;
  education: React.FC<SvgProps>;
  certificate: React.FC<SvgProps>;
  mic: React.FC<SvgProps>;
  play: React.FC<SvgProps>;
  download: React.FC<SvgProps>;
  book: React.FC<SvgProps>;
  location: React.FC<SvgProps>;
  time: React.FC<SvgProps>;
  dollar: React.FC<SvgProps>;
  upArrow: React.FC<SvgProps>;
  downArrow: React.FC<SvgProps>;
  send: React.FC<SvgProps>;
  more: React.FC<SvgProps>;
  document: React.FC<SvgProps>;
  attachment: React.FC<SvgProps>;
  leftArrow: React.FC<SvgProps>;
  rightArrow: React.FC<SvgProps>;
  warning: React.FC<SvgProps>;
  delete: React.FC<SvgProps>;
  upload: React.FC<SvgProps>;
  edit: React.FC<SvgProps>;
  profile: React.FC<SvgProps>;
  bank: React.FC<SvgProps>;
  passwordSecurity: React.FC<SvgProps>;
  logout: React.FC<SvgProps>;
  image: React.FC<SvgProps>;
  successRight: React.FC<SvgProps>;
  phone:React.FC<SvgProps>;
  email:React.FC<SvgProps>;
  close:React.FC<SvgProps>;
  radio:React.FC<SvgProps>
  radioSelected:React.FC<SvgProps>;
  paypal:React.FC<SvgProps>;
  mastercard:React.FC<SvgProps>;
  visa:React.FC<SvgProps>;
  creditcard:React.FC<SvgProps>;
  checkmark:React.FC<SvgProps>;
  doublecheck:React.FC<SvgProps>;
  questionmark:React.FC<SvgProps>;
  privacypolicy:React.FC<SvgProps>;
  termsandservices:React.FC<SvgProps>;
  pause:React.Fc<SvgProps>;






 

}

const svgIcons: SvgIconAssets = {
  home: HomeIcon,
  orders: OrdersIcon,
  jobs: JobsIcon,
  messages: MessagesIcon,
  google: GoogleIcon,
  apple: AppleIcon,
  notification: NotificationIcon,
  heart: HeartIcon,
  search: SearchIcon,
  calendar: CalendarIcon,
  filter: FilterIcon,
  closeEye: CloseEyeIcon,
  openEye: OpenEyeIcon,
  back: BackIcon,
  star: StarIcon,
  aeroplane: AeroplaneIcon,
  education: EducationIcon,
  certificate: CertificateIcon,
  mic: MicIcon,
  play: PlayIcon,
  download: DownloadIcon,
  book: BookIcon,
  location: LocationIcon,
  time: TimeIcon,
  dollar: DollarIcon,
  upArrow: UpArrowIcon,
  downArrow: DownArrowIcon,
  send: SendIcon,
  more: MoreIcon,
  document: DocumentIcon,
  attachment: AttachmentIcon,
  leftArrow: LeftArrowIcon,
  rightArrow: RightArrowIcon,
  warning: WarningIcon,
  delete: DeleteIcon,
  upload: UploadIcon,
  edit: EditIcon,
  profile: ProfileIcon,
  bank: BankIcon,
  passwordSecurity: PasswordSecurityIcon,
  logout: LogoutIcon,
  image: ImageIcon,
  successRight: SuccessRightIcon,
  phone:PhoneIcon,
  email:EmailIcon,
  close:CloseIcon,
  radio:RadioIcon,
  radioSelected:RadioSelectedIcon,
  paypal:PaypalIcon,
  mastercard:MasterCardIcon,
  visa:VisaIcon,
  creditcard:CreditCardIcon,
  checkmark:CheckMarkIcon,
  doublecheck:DoubleCheckIcon,
  questionmark:QuestionMarkIcon,
  privacypolicy:PrivacyPolicyIcon,
  termsandservices:TermsAndServicesIcon,
  pause:PauseIcon,
  

};

// Export all assets
export const Assets = {
  images,
  icons: {
    ...pngIcons,
    ...svgIcons,
  },
};

export default Assets;
