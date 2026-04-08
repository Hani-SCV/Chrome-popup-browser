// src/App.tsx
import { useEffect, useState } from 'react';
import type { Bookmark } from './types';

export default function App() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  // 초기 로딩
  useEffect(() => {
    chrome.storage.local.get(['bookmarks'], (res) => {
      setBookmarks((res.bookmarks as Bookmark[]) || []);
    });
  }, []);

  const saveBookmarks = (newBookmarks: Bookmark[]) => {
    chrome.storage.local.set({ bookmarks: newBookmarks }, () => {
      setBookmarks(newBookmarks);
    });
  };

  const addBookmark = () => {
    if (!name || !url) return;
    const newB = [...bookmarks, { name, url }];
    saveBookmarks(newB);
    setName('');
    setUrl('');
  };

  const openPopup = (b: Bookmark) => {
    chrome.runtime.sendMessage({
      type: 'OPEN_POPUP',
      payload: b,
    });
  };

  const removeBookmark = (index: number) => {
    const newB = bookmarks.filter((_, i) => i !== index);
    saveBookmarks(newB);
  };

  return (
    <div className="p-4 space-y-2 w-64">
      <h1 className="text-lg font-bold">즐겨찾기</h1>

      <div className="flex flex-col gap-1">
        <input
          className="border p-1 rounded"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input className="border p-1 rounded" placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button className="bg-blue-500 text-white p-1 rounded" onClick={addBookmark}>
          추가
        </button>
      </div>

      <div className="flex flex-col gap-1 mt-2">
        {bookmarks.map((b, i) => (
          <div key={i} className="flex justify-between items-center">
            <button className="text-left text-blue-600 underline" onClick={() => openPopup(b)}>
              {b.name}
            </button>
            <button className="text-red-500" onClick={() => removeBookmark(i)}>
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
