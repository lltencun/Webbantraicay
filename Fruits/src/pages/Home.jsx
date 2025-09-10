import { BestSeller } from "../components/BestSeller";
import Hero from "../components/Hero";
import LatestStore from "../components/LatestStore";
import NewsletterBox from "../components/NewsletterBox";
import Ourpolicy from "../components/OurPolicy";
import Carousel from "../components/Carousel ";
import CategorySection from "../components/CategorySection";
const Home = () => {
  return (
    <div >
      <Carousel />
      <CategorySection />
      <LatestStore />
      <br />
      <Hero />
      <BestSeller />
      <Ourpolicy />
      <NewsletterBox/>
    </div>
  );
};

export default Home;
