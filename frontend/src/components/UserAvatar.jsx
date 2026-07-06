import { useState } from 'react';

export default function UserAvatar({ user, className = 'w-8 h-8', textClassName = 'text-sm' }) {
  const [failed, setFailed] = useState(false);
  const initial = user?.name?.[0]?.toUpperCase() || '?';

  if (!user?.avatar || failed) {
    return (
      <div
        className={`${className} rounded-full bg-primary-600 flex items-center justify-center text-white font-bold shrink-0 ${textClassName}`}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={user.avatar}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${className} rounded-full object-cover shrink-0`}
    />
  );
}
