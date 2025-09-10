import { assets } from "../assets/products";
import Title from "../components/Title";
const About = () => {
  return (
    <div>
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1="ABOUT" text2="US" />
      </div>
      <div className="my-10 flex flex-col md:flex-row gap-16 ">
        <img className="w-full md:max-w-[450px]" src={assets.panel} alt="" />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-gray-600 ">
          <p>
            Welcome to FreshFruitExpress, your go-to online store for fresh,
            delicious, and high-quality fruits delivered right to your doorstep.
            Our passion is bringing the best produce from farms to your home,
            ensuring that you enjoy the freshest and most nutritious fruits,
            whether you’re stocking up on daily essentials or treating yourself
            to something special.
          </p>
          <b className="text-gray-800">Our Mission</b>
          <p>
            At FreshFruitExpress, our mission is simple: to provide everyone
            with access to healthy and fresh fruits at the click of a button. We
            believe in the power of fruit to nourish, energize, and promote
            well-being. That’s why we source our fruits from trusted local
            farmers and international suppliers, ensuring quality,
            sustainability, and ethical practices in every bite.
          </p>
        </div>
      </div>
      <div className="text-xl py-4">
        <Title text1="WHY" text2="CHOOSEN US" />
      </div>
      <div className="flex flex-col md:flex-row text-sm mb-20">
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Quality Assurance:</b>
          <p className="text-gray-600">
            We believe in offering only the best quality products, and that’s
            why every item at Fruits goes through a stringent quality assurance
            process. From fresh produce to packaged goods, we ensure that every
            product meets the highest standards of freshness, taste, and
            nutritional value. You can shop with confidence, knowing that
            quality is always guaranteed.
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Convenience:</b>
          <p className="text-gray-600">
            Fruits offers a shopping experience that’s all about convenience.
            With fast, easy online ordering and flexible delivery options, we
            make sure that you have access to your favorite products whenever
            and wherever you need them. Plus, our user-friendly website ensures
            that finding exactly what you’re looking for is just a few clicks
            away.
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Exceptional Customer Service:</b>
          <p className="text-gray-600">
            At Fruits, we pride ourselves on delivering exceptional customer
            service that goes above and beyond. Our dedicated team is always
            available to assist you, ensuring a seamless experience from start
            to finish. Whether you have a question, need assistance, or are
            looking for personalized recommendations, we’re here to make your
            shopping experience effortless and enjoyable.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
