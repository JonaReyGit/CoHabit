import { useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-200 dark:bg-gray-900 
                        text-orange-700 dark:text-white text-sm">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row gap-8 justify-between">

        <div>
          <p className="dark:text-white font-bold text-base mb-3">CoHabit</p>
          <ul className="space-y-1">
            <li>
              <button onClick={() => navigate('/about')} className="hover:text-blue-900 dark:hover:text-blue-500">
                About Us
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/matching')} className="hover:text-blue-900 dark:hover:text-blue-500">
                Start CoHabitting
              </button>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-orange-700 dark:text-white font-semibold mb-3">Help</p>
          <ul className="space-y-1">
            <li>
              <button onClick={() => navigate('/contact')} className="hover:text-blue-900 dark:hover:text-blue-500">
                Contact
              </button>
            </li>
          </ul>
        </div>

      </div>

      <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-600">
        © 2026 CoHabit — All rights reserved
      </div>
    </footer>
  );
}

export default Footer;