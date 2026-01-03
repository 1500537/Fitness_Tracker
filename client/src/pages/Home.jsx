import PulseHeartHero from "../components/homepage/components/Hero";
import About from "./About";
import Contact from "./Contact";
import TestimonialPricing from "./Pricing";

const Home = () => (
  <div>
    <section id="home"><PulseHeartHero /></section>
    <section id="about"><About /></section>
    <section id="pricing"><TestimonialPricing /></section>
    <section id="contact"><Contact /></section>
  </div>
);
export default Home;