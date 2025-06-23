import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RoomCard from '../components/RoomCard';
import { toast } from 'react-toastify';

const Profile = () => {
  const { isAuthenticated } = useAuth();
  const [reviewedRooms, setReviewedRooms] = useState([]);
  const [bookmarkedRooms, setBookmarkedRooms] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetch(`http://127.0.0.1:8000/api/rooms/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          // Fallback to empty arrays if not defined
          setReviewedRooms(data.reviewed_rooms ?? []);
          setBookmarkedRooms(data.bookmarked_rooms ?? []);
        })
        .catch(error => {
          console.error("Profile fetch error:", error);
        });
    }
  }, []);

  const handleRemoveBookmark = (roomId) => {
    const confirmed = window.confirm("Are you sure you want to remove this room from your bookmarks?");
    if (!confirmed) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    fetch(`http://127.0.0.1:8000/api/rooms/bookmark/${roomId}/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(() => {
        setBookmarkedRooms(prev =>
          prev.filter(b => {
            const room = b?.room || b;
            return room?.id !== roomId;
          })
        );
        toast.success("✅ Bookmark removed");
      })
      .catch(err => {
        console.error("Bookmark removal error:", err);
        toast.error("❌ Failed to remove bookmark");
      });
  };

  if (!isAuthenticated) {
    return <div className="text-center mt-10">🔒 Please login to view profile.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">👤 My Profile</h1>

      {/* ⭐ Reviewed Rooms Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">⭐ Reviewed Rooms</h2>
        {Array.isArray(reviewedRooms) && reviewedRooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reviewedRooms.map(room => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You haven't reviewed any rooms yet.</p>
        )}
      </section>

      {/* 🔖 Bookmarked Rooms Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-purple-700 mb-4">🔖 Bookmarked Rooms</h2>

        {Array.isArray(bookmarkedRooms) && bookmarkedRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookmarkedRooms.map((bookmark, index) => {
              const room = bookmark?.room || bookmark;
              return room?.id ? (
                <div key={index} className="relative">
                  <RoomCard room={room} />
                  <div className="mt-2 text-right">
                    <button
                      onClick={() => handleRemoveBookmark(room.id)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      💔 Remove from Bookmark
                    </button>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        ) : (
          <p className="text-gray-500">You haven't bookmarked any rooms yet.</p>
        )}
      </section>
    </div>
  );
};

export default Profile;
