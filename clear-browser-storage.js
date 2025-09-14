// ブラウザストレージとコンソールを完全にクリア
console.log('🧹 全てのストレージとログをクリアしています...');

// LocalStorage をクリア
localStorage.clear();
console.log('✅ LocalStorage クリア完了');

// SessionStorage をクリア
sessionStorage.clear();
console.log('✅ SessionStorage クリア完了');

// IndexedDB をクリア（可能な場合）
if ('indexedDB' in window) {
  indexedDB.databases().then(databases => {
    databases.forEach(db => {
      if (db.name) {
        indexedDB.deleteDatabase(db.name);
      }
    });
  }).catch(() => {
    console.log('⚠️ IndexedDB のクリアに失敗しました');
  });
}

// Cookies をクリア（同一オリジン）
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('✅ Cookies クリア完了');

// コンソールをクリア
console.clear();

// ページをリロード
setTimeout(() => {
  console.log('🔄 ページをリロードします...');
  location.reload();
}, 1000); 