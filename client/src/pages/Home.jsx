import PulseHeartHero from "../components/homepage/components/Hero";
import About from "./About";
import Contact from "./Contact";


const Home = () => (
  <div>
    <section id="home"><PulseHeartHero /></section>
    <section id="about"><About /></section>
    
    <section id="contact"><Contact /></section>
  </div>
);
export default Home;