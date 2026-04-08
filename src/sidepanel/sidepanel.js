const listEl = document.getElementById("list");

function render() {
  chrome.storage.local.get(["bookmarks"], (res) => {
    const bookmarks = res.bookmarks || [];
    listEl.innerHTML = "";

    bookmarks.forEach((b, i) => {
      const btn = document.createElement("button");
      btn.innerText = b.name;
      btn.onclick = () => openPopup(b);
      listEl.appendChild(btn);
    });
  });
}

function openPopup(bookmark) {
  chrome.runtime.sendMessage({
    type: "OPEN_POPUP",
    payload: bookmark
  });
}

document.getElementById("add").onclick = () => {
  const name = document.getElementById("name").value;
  const url = document.getElementById("url").value;

  chrome.storage.local.get(["bookmarks"], (res) => {
    const bookmarks = res.bookmarks || [];
    bookmarks.push({ name, url });

    chrome.storage.local.set({ bookmarks }, render);
  });
};

render();