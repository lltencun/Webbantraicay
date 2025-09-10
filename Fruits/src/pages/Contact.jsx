import { assets } from "../assets/products";
import Title from "../components/Title";
const Contact = () => {
  return (
    <div>
      <div className="text-2xl text-center pt-10 border-t">
        <Title text1="CONTACT" text2="US" />
      </div>
      <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28">
        <img className="w-full md:max-w-[480px]" src={assets.panel1} alt="" />
        <div className="flex flex-col justify-center items-start gap-6">
          <p className="font-semibold text-xl text-gray-600 ">Our Store</p>
          <p className="text-gray-500">
            Trường Đại học Công nghệ Sài Gòn <br />
            STU 180 Cao Lỗ, Phường 4, Quận 8, Tp. Hồ Chí Minh
          </p>
          <p className="text-gray-500">
            Tel:0784351925 <br /> 
            Email:DH52108695@student.stu.edu.vn <br />
            
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
