import type { User } from 'star-kitten-lib/db';
import { CharacterAPI } from 'star-kitten-lib/eve';

export default function Nav({
  user,
}: {
  user: User;
}) {
  return (
    <div class="navbar bg-base-100 shadow-sm">
      <div class="flex-1">
        <a class="btn btn-ghost text-xl">Star Kitten</a>
      </div>
      <div class="flex gap-2">
        <input type="text" placeholder="Search" class="input input-bordered w-24 md:w-auto" />
        <div class="dropdown dropdown-end">
          <div tabIndex={0} role="button" class="btn btn-ghost btn-circle avatar">
            <div class="w-10 rounded-full">
              <img
                alt="Tailwind CSS Navbar component"
                src={CharacterAPI.getPortraitURL(user.mainCharacter!.eveID)} />
            </div>
          </div>
          <ul
            tabIndex={0}
            class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
            <li>
              {user.mainCharacter!.name}
            </li>
            <li>
              <a class="justify-between">
                Characters
                <span class="badge">{user.characters.length}</span>
              </a>
            </li>
            <li><a>Link Character</a></li>
            <li><a>Settings</a></li>
            <li><a>Logout</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
