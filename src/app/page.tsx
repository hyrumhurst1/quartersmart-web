import AppShell from "@/components/AppShell";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import LearnSection from "@/components/LearnSection";
import IndustrySection from "@/components/IndustrySection";
import HowItWorksSection from "@/components/HowItWorksSection";
import CoursePreviewSection from "@/components/CoursePreviewSection";
import CTASection from "@/components/CTASection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main id="main-content">
      <AppShell>
        <HeroSection />
        <ProblemSection />
        <LearnSection />
        <IndustrySection />
        <HowItWorksSection />
        <CoursePreviewSection />
        <CTASection />
        <FAQSection />
        <Footer />
      </AppShell>
    </main>
  );
}
