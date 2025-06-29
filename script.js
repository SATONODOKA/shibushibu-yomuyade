// Part 4: APIキー管理とNetlify Functions対応
const API_ENDPOINT = '/.netlify/functions/news';

async function fetchAINews() {
  try {
    // Netlify Functionsを使用してCORS問題を解決
    const res = await fetch(API_ENDPOINT);
    const data = await res.json();
    
    if (data.status !== "ok") {
      console.error("API error:", data);
      showErrorWithFallback("ニュースの取得に失敗しました");
      return;
    }
    
    // データソース表示
    showDataSource(data.source);
    renderNews(data.articles);
    
  } catch (error) {
    console.error("Fetch error:", error);
    showErrorWithFallback("通信に失敗しました");
  }
}

// Part 4: 改善されたエラーハンドリング
function showErrorWithFallback(message) {
  console.warn(`${message} - フォールバックデータを表示します`);
  
  // モックデータで代替表示
  renderNews(getMockArticles());
  showDataSource('mock');
}

// Part 4: 拡張された記事表示機能
function renderNews(articles) {
  const list = document.getElementById("news-list");
  list.innerHTML = "";
  
  articles.forEach((article, index) => {
    const li = document.createElement("li");
    li.className = "news-item";
    li.innerHTML = `
      <div class="news-header">
        <a href="${article.url}" target="_blank" class="news-title">
          ${article.title}
        </a>
        <span class="news-source">${article.source?.name || "不明"}</span>
      </div>
      <p class="news-description">${article.description || "概要が利用できません"}</p>
      <div class="news-meta">
        <span class="news-date">${formatDate(article.publishedAt)}</span>
        <div class="news-actions">
          <button onclick="shareArticle('${article.url}', '${article.title}')" class="share-btn">
            📤 シェア
          </button>
          <button onclick="toggleFavorite(${index})" class="favorite-btn">
            ⭐ お気に入り
          </button>
        </div>
      </div>
    `;
    list.appendChild(li);
  });
}

// Part 4: 日付フォーマット機能
function formatDate(dateString) {
  if (!dateString) return "日付不明";
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return `${minutes}分前`;
    } else if (hours < 24) {
      return `${hours}時間前`;
    } else if (days < 7) {
      return `${days}日前`;
    } else {
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch (error) {
    return "日付不明";
  }
}

// Part 4: データソース表示機能
function showDataSource(source) {
  const existingNotice = document.querySelector('.data-source-notice');
  if (existingNotice) {
    existingNotice.remove();
  }
  
  const notice = document.createElement('div');
  notice.className = 'data-source-notice';
  
  if (source === 'mock') {
    notice.innerHTML = `
      <span class="source-badge mock">📝 開発モード</span>
      サンプルデータを表示しています
    `;
  } else {
    notice.innerHTML = `
      <span class="source-badge api">📡 Live</span>
      NewsAPIから最新データを取得
    `;
  }
  
  const container = document.querySelector('.container');
  const list = document.getElementById('news-list');
  container.insertBefore(notice, list);
}

// Part 4: 将来的な拡張機能の基盤

// シェア機能
function shareArticle(url, title) {
  if (navigator.share) {
    navigator.share({
      title: title,
      url: url
    }).catch(err => console.log('シェアエラー:', err));
  } else {
    // フォールバック: クリップボードにコピー
    navigator.clipboard.writeText(`${title} - ${url}`)
      .then(() => alert('リンクをクリップボードにコピーしました'))
      .catch(() => prompt('リンクをコピーしてください:', `${title} - ${url}`));
  }
}

// お気に入り機能（localStorage使用）
function toggleFavorite(index) {
  const favorites = JSON.parse(localStorage.getItem('ai-news-favorites') || '[]');
  const articleElement = document.querySelectorAll('.news-item')[index];
  const title = articleElement.querySelector('.news-title').textContent;
  
  const existingIndex = favorites.findIndex(fav => fav.title === title);
  
  if (existingIndex > -1) {
    favorites.splice(existingIndex, 1);
    alert('お気に入りから削除しました');
  } else {
    const newsItem = {
      title: title,
      url: articleElement.querySelector('.news-title').href,
      savedAt: new Date().toISOString()
    };
    favorites.push(newsItem);
    alert('お気に入りに追加しました');
  }
  
  localStorage.setItem('ai-news-favorites', JSON.stringify(favorites));
}

// モックデータ（開発環境用）
function getMockArticles() {
  return [
    {
      title: "OpenAI、GPT-4の最新アップデートを発表",
      description: "OpenAIが新しいGPT-4モデルの改良版をリリース。より高精度な日本語処理と推論能力の向上が特徴。",
      url: "https://example.com/news1"
    },
    {
      title: "Google、Bard AIをビジネス向けに拡張",
      description: "Googleが企業向けAIアシスタントBard for Businessを正式発表。生産性向上のための新機能を多数搭載。",
      url: "https://example.com/news2"
    },
    {
      title: "Microsoft、AI搭載Office 365の新機能を発表",
      description: "MicrosoftがOffice 365にAI機能を統合。文書作成、データ分析、プレゼンテーション作成を大幅に効率化。",
      url: "https://example.com/news3"
    },
    {
      title: "自動運転技術、2024年の最新動向",
      description: "AI技術の進歩により自動運転車の実用化が加速。テスラ、ウェイモなど主要企業の最新取り組みを紹介。",
      url: "https://example.com/news4"
    },
    {
      title: "AI倫理ガイドライン、国際的な統一基準へ",
      description: "G7各国がAI技術の倫理的利用に関する共通ガイドラインの策定で合意。責任あるAI開発を促進。",
      url: "https://example.com/news5"
    }
  ];
}

// Part 4: お気に入り表示・管理機能
function showFavorites() {
  const favorites = JSON.parse(localStorage.getItem('ai-news-favorites') || '[]');
  const modal = document.getElementById('favorites-modal');
  const favoritesList = document.getElementById('favorites-list');
  
  favoritesList.innerHTML = '';
  
  if (favorites.length === 0) {
    favoritesList.innerHTML = '<li style="text-align: center; color: #999;">お気に入り記事がありません</li>';
  } else {
    favorites.forEach((item, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 1;">
            <a href="${item.url}" target="_blank" style="color: #333; text-decoration: none; font-weight: bold;">
              ${item.title}
            </a>
            <div style="color: #999; font-size: 0.8em; margin-top: 5px;">
              保存日: ${new Date(item.savedAt).toLocaleDateString('ja-JP')}
            </div>
          </div>
          <button onclick="removeFavorite(${index})" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
            削除
          </button>
        </div>
      `;
      favoritesList.appendChild(li);
    });
  }
  
  modal.style.display = 'block';
}

function closeFavorites() {
  document.getElementById('favorites-modal').style.display = 'none';
}

function removeFavorite(index) {
  const favorites = JSON.parse(localStorage.getItem('ai-news-favorites') || '[]');
  favorites.splice(index, 1);
  localStorage.setItem('ai-news-favorites', JSON.stringify(favorites));
  showFavorites(); // リストを再表示
}

// Part 4: 初期化とイベントリスナー
document.addEventListener("DOMContentLoaded", () => {
  // ボタンイベント設定
  document.getElementById("refresh-btn").addEventListener("click", fetchAINews);
  
  // モーダルの外側クリックで閉じる
  document.getElementById('favorites-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      closeFavorites();
    }
  });
  
  // ESCキーでモーダルを閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeFavorites();
    }
  });
  
  // 初回読み込み時にニュースを取得
  fetchAINews();
}); 