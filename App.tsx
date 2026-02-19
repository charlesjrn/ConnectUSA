import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// MVP Landing Pages (4 public pages)
import Home from "./pages/Home";
import About from "./pages/About";
import Join from "./pages/Join";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

// Member area (hidden from main nav, accessible after login)
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Room from "./pages/Room";
import Gifts from "./pages/Gifts";
import Revelations from "./pages/Revelations";
import Visions from "./pages/Visions";
import Encounters from "./pages/Encounters";
import Missions from "./pages/Missions";
import Meetups from "./pages/Meetups";
import Chat from "./pages/Chat";
import DirectMessages from "./pages/DirectMessages";
import UserProfile from "./pages/UserProfile";
import Members from "./pages/Members";
import PrayerRequests from "./pages/PrayerRequests";
import VideoChat from "./pages/VideoChat";
import VideoPrayer from "./pages/VideoPrayer";
import { MembersMap } from "./pages/MembersMap";
import Connections from "./pages/Connections";
import Onboarding from "./pages/Onboarding";
import EmailPreferences from "./pages/EmailPreferences";
import PushNotificationSettings from "./pages/PushNotificationSettings";
import Referrals from "./pages/Referrals";
import AdminModeration from "./pages/AdminModeration";
import VerseArchive from "./pages/VerseArchive";
import PrayerRoom from "./pages/PrayerRoom";
import Donations from "./pages/Donations";
import Events from "./pages/Events";
import AdminEvents from "./pages/AdminEvents";
import Membership from "./pages/Membership";
import MembershipSuccess from "./pages/MembershipSuccess";
import InnerCircleSuccess from "./pages/InnerCircleSuccess";
import MemberDashboard from "./pages/MemberDashboard";
import SubmitTestimony from "./pages/SubmitTestimony";
import SubmitVision from "./pages/SubmitVision";
import Resources from "./pages/Resources";
import TestimonyDetail from "./pages/TestimonyDetail";
import { Analytics } from "./pages/Analytics";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function Router() {
  return (
    <Switch>
      {/* ── MVP Landing Pages ── */}
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/join" component={Join} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />

      {/* ── Auth ── */}
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />

      {/* ── Member Area (hidden from main nav, still accessible) ── */}
      <Route path="/dashboard" component={MemberDashboard} />
      <Route path="/feed" component={Dashboard} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/profile" component={Profile} />
      <Route path="/user/:id" component={UserProfile} />
      <Route path="/members" component={Members} />
      <Route path="/submit-testimony" component={SubmitTestimony} />
      <Route path="/submit-vision" component={SubmitVision} />
      <Route path="/testimony/:id" component={TestimonyDetail} />
      <Route path="/resources" component={Resources} />
      <Route path="/prayer-requests" component={PrayerRequests} />
      <Route path="/prayer-room" component={PrayerRoom} />
      <Route path="/gifts" component={Gifts} />
      <Route path="/revelations" component={Revelations} />
      <Route path="/visions" component={Visions} />
      <Route path="/encounters" component={Encounters} />
      <Route path="/missions" component={Missions} />
      <Route path="/meetups" component={Meetups} />
      <Route path="/events" component={Events} />
      <Route path="/donations" component={Donations} />
      <Route path="/membership" component={Membership} />
      <Route path="/membership/success" component={MembershipSuccess} />
      <Route path="/inner-circle" component={Membership} />
      <Route path="/inner-circle/success" component={InnerCircleSuccess} />
      <Route path="/room/:roomId" component={Room} />
      <Route path="/chat" component={Chat} />
      <Route path="/messages" component={DirectMessages} />
      <Route path="/video-chat" component={VideoChat} />
      <Route path="/video-prayer" component={VideoPrayer} />
      <Route path="/members-map" component={MembersMap} />
      <Route path="/connections" component={Connections} />
      <Route path="/verses" component={VerseArchive} />
      <Route path="/referrals" component={Referrals} />

      {/* ── Settings ── */}
      <Route path="/settings/email-preferences" component={EmailPreferences} />
      <Route path="/settings/push-notifications" component={PushNotificationSettings} />

      {/* ── Admin ── */}
      <Route path="/admin/moderation" component={AdminModeration} />
      <Route path="/admin/events" component={AdminEvents} />
      <Route path="/analytics" component={Analytics} />

      {/* ── 404 ── */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
