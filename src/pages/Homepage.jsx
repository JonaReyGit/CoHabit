import { useNavigate } from 'react-router-dom'

import Footer from "@/components/shared/Footer";

import Arizona from "@/assets/images/Arizona.jpg"
import California from "@/assets/images/California.jpg"
import Florida from "@/assets/images/Florida.jpg"
import NewYork from "@/assets/images/New-York.jpg"
import Washington from "@/assets/images/Washington.jpg"
import Wyoming from "@/assets/images/Wyoming.jpg"

import matching_icon from "@/assets/images/smart-matching.svg"
import messaging_icon from "@/assets/images/messaging.png"
import animal_icon from "@/assets/images/animal-lover.png"

const cities = [
  { name: "Arizona", img: Arizona },
  { name: "California", img: California },
  { name: "Florida", img: Florida },
  { name: "New York", img: NewYork },
  { name: "Washington", img: Washington },
  { name: "Wyoming", img: Wyoming },
]

const features = [
    {
        icon: matching_icon,
        title: "Smart Matching",
        desc: "Filter roommates by preference and lifestyle options",
    },
    {
        icon: messaging_icon,
        title: "Secure Messaging",
        desc: "Only message who you want easily and safely in one place",
    },
    {
        icon: animal_icon,
        title: "Pet Friendly",
        desc: "Easily make sure that your fur baby is only around fellow pet lovers",
    },

]

function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* hero */}
      <section className="bg-[#659af6] dark:bg-gray-800  text-white">
        <div className="max-w-6xl mx-auto py-16 flex flex-col items-center text-center gap-4 px-6">

          <h1 className="text-black dark:text-white text-4xl sm:text-5xl font-bold">
            Start CoHabiting Smarter
          </h1>

          <p className="text-gray-950 dark:text-gray-300 text-lg">
            Find compatible roommates through smart matching
          </p>

          {/* call to action */}
          <div className="w-full max-w-xl mt-4">
            <button
              onClick={() => navigate('/matching')}
              className="w-full bg-white dark:bg-gray-900 
                        text-gray-900 dark:text-white text-center
                        rounded-xl p-6 border border-gray-200 dark:border-gray-700
                        hover:shadow-md hover:shadow-slate-400 dark:hover:shadow-gray-700
                        transition-shadow"
            >
              <p className="font-bold mb-3">
                Ready to find your roommate?
              </p>

              <span className="inline-flex items-center gap-2
                                bg-orange-700 dark:bg-gray-600
                                text-white text-sm font-semibold px-4 py-2 rounded-full">
                Start Smart Matching →
              </span>
            </button>
          </div>

        </div>
      </section>

      {/* why use cohabit */}
      <section className="bg-[#b2dcf1b9] dark:bg-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-14">

          <h2 className="text-2xl font-bold text-center items-center 
                        text-gray-900 dark:text-white mb-10">
            Why CoHabit?
          </h2>

          <div className="flex flex-col sm:flex-row justify-center gap-8">
            {features.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center gap-3 max-w-xs mx-auto"
              >
                <div className="w-24 bg-white 
                                rounded-xl p-4 shadow-sm border 
                                border-gray-200 dark:border-gray-700
                                shadow-black dark:shadow-gray-500">
                  <img src={icon} alt={title} />
                </div>

                <p className="font-bold text-gray-900 dark:text-white">
                  {title}
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* look at these states */}
      <section className="bg-[#b2dcf1b9] dark:bg-gray-700 
                             mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Explore rooms in popular states
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4 justify-items-center">
          {cities.map(({ name, img }) => (
            <button
              key={name}
              onClick={() => navigate('/matching')}
              className="relative overflow-hidden rounded-xl aspect-4/3 group
                         border border-gray-200 dark:border-gray-800
                         hover:shadow-md transition-shadow"
            >
              <img
                src={img}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              <div className="absolute inset-0 bg-black/40" />

              <span className="absolute bottom-3 left-0 right-0 text-center text-white font-semibold text-sm uppercase">
                {name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* footer */}
      <Footer />
    </div>
  )
}

export default HomePage
