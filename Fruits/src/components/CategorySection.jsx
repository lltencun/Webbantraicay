import { assets } from "../assets/assets";// Assuming assets are in a file named assets.js

const categories = [
  {
    title: "SEASONAL FRUITS",
    image: assets.apple,
  },
  {
    title: "TROPICAL FRUITS",
    image: assets.banana,
  },
  {
    title: "SUMMER FRUITS",
    image: assets.durian,
  },
  {
    title: "IMPORTED FRUITS",
    image: assets.kiwii,
  },
]

const CategorySection = () => {
  return (
    <div className="grid grid-cols-4 gap-2 mt-2">
      {categories.map((category, index) => (
        <div key={index} className="relative h-[150px] overflow-hidden group cursor-pointer">
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          <img
            src={category.image || "/placeholder.svg"}
            alt={category.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <h3 className="absolute bottom-4 left-4 text-white text-xl font-bold z-20">{category.title}</h3>
        </div>
      ))}
    </div>
  )
}

export default CategorySection
