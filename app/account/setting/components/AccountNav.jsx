// app/account/settings/components/AccountNav.js
export default function AccountNav({ activeTab, setActiveTab }) {
    const navItems = [
      { id: 'profile', label: 'Profile Information' },
      { id: 'password', label: 'Password' },
      { id: 'notifications', label: 'Notifications' }
    ];
  
    return (
      <div className="bg-white rounded-lg shadow">
        <nav className="flex flex-col">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`text-left px-4 py-3 border-l-4 transition-colors ${
                activeTab === item.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                  : 'border-transparent hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    );
  }