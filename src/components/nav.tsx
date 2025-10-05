import { Coins } from "lucide-react";
import Link from "next/link";

export default function Nav({ coins }: { coins: number }) {
  return (
    <div className="navbar bg-base-100 shadow-sm max-w-7xl mx-auto">
      <div className="flex-1">
        <Link className="btn btn-ghost text-xl" href="/">
          AI Knowledge Base
        </Link>
      </div>
      <div className="flex-none">
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle mr-4"
          >
            <div className="indicator">
              <span className="mr-1 text-yellow-300">{coins}</span>
              <Coins className="h-5 w-5 z-10 text-yellow-300" />
            </div>
          </div>
          <div
            tabIndex={0}
            className="card card-compact dropdown-content bg-base-100 z-1 mt-3 w-52 shadow"
          >
            <div className="card-body">
              <div className="card-actions">
                <button className="btn btn-primary btn-block">
                  Buy more coins
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full">
              <img
                alt="Tailwind CSS Navbar component"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li>
              <a className="justify-between">
                Profile
                <span className="badge">New</span>
              </a>
            </li>
            <li>
              <a>Settings</a>
            </li>
            <li>
              <a>Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
