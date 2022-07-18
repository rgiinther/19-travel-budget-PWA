const indexedDB = window.indexedDB;

let db;


const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('newBudget', { autoIncrement: true});
};

request.onsuccess = function(event) {
    db = event.target.result;

//check if app is online
    if (navigator.onLine) {
        uploadItem();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

//submit a new transaction with no internet
function saveRecord(record) {
    const transaction = db.transaction(['newBudget'], 'readwrite');
    const itemObjectStore = transaction.objectStore('newBudget');
    itemObjectStore.add(record);
};

function uploadItem() {
    const transaction = db.transaction(["newBudget"], "readwrite");
    const itemObjectStore = transaction.objectStore("newBudget");
  
    const getAll = itemObjectStore.getAll();
  
    getAll.onsuccess = function () {
      if (getAll.result.length > 0) {
        fetch("/api/transaction", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((serverResponse) => {
            if (serverResponse.message) {
              throw new Error(serverResponse);
            }
            const transaction = db.transaction(["newBudget"], "readwrite");
            const itemObjectStore = transaction.objectStore("newBudget");
            itemObjectStore.clear();
            alert("All transactions submitted");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    };
  }
  
  window.addEventListener("online", uploadItem);
