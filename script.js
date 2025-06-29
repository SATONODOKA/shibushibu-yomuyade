// Part 4: APIキー管理とマルチ環境対応
const API_KEY = "ffe3f921a4cc4d769e8efa691a5d1523";
const NETLIFY_ENDPOINT = '/.netlify/functions/news';
const DIRECT_API_ENDPOINT = `https://newsapi.org/v2/everything?q=AI&language=ja&pageSize=5&sortBy=publishedAt&apiKey=${API_KEY}`;

// 環境判定: ローカル環境かNetlify環境かを判断
function isLocalEnvironment() {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.port !== '';
}

// ローカル環境用: 複数のCORSプロキシを試行
async function fetchNewsLocal() {
  const corsProxies = [
    { name: 'AllOrigins', url: 'https://api.allorigins.win/get?url=' },
    { name: 'CORS-Anywhere', url: 'https://cors-anywhere.herokuapp.com/' },
    { name: 'ThingProxy', url: 'https://thingproxy.freeboard.io/fetch/' }
  ];
  
  // AllOrigins用のエンドポイント変更
  const allOriginsUrl = corsProxies[0].url + encodeURIComponent(DIRECT_API_ENDPOINT);
  
  try {
    console.log('🔄 AllOriginsプロキシを試行中...');
    console.log('📍 リクエストURL:', allOriginsUrl);
    console.log('📍 元のAPIエンドポイント:', DIRECT_API_ENDPOINT);
    
    const response = await fetch(allOriginsUrl);
    console.log('📊 AllOriginsレスポンス状態:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const proxyData = await response.json();
    console.log('📊 AllOriginsプロキシデータ:', proxyData);
    
    if (proxyData.contents) {
      console.log('🔧 contents を JSON パース中...');
      const newsData = JSON.parse(proxyData.contents);
      console.log('📊 パース後のニュースデータ:', newsData);
      
      // NewsAPIレスポンスの構造検証
      if (newsData && newsData.status) {
        console.log('✅ AllOriginsプロキシ経由で取得成功');
        return { data: newsData, method: 'AllOrigins' };
      } else {
        console.warn('⚠️ NewsAPIレスポンス構造が不正');
        throw new Error('不正なNewsAPIレスポンス');
      }
    } else {
      console.warn('⚠️ AllOriginsレスポンスに contents がありません');
      throw new Error('AllOriginsレスポンスにcontentsが含まれていません');
    }
  } catch (error) {
    console.warn('❌ AllOriginsプロキシ失敗:', error);
    console.warn('❌ エラー詳細:', error.message);
  }
  
  // 他のプロキシを順次試行
  for (let i = 1; i < corsProxies.length; i++) {
    try {
      console.log(`🔄 ${corsProxies[i].name}プロキシを試行中...`);
      const proxyUrl = corsProxies[i].url + DIRECT_API_ENDPOINT;
      console.log(`📍 ${corsProxies[i].name} URL:`, proxyUrl);
      
      const response = await fetch(proxyUrl, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      console.log(`📊 ${corsProxies[i].name}レスポンス状態:`, response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`📊 ${corsProxies[i].name}レスポンスデータ:`, data);
      
      // データ構造の検証
      if (data && data.status) {
        console.log(`✅ ${corsProxies[i].name}プロキシ経由で取得成功`);
        return { data: data, method: corsProxies[i].name };
      } else {
        throw new Error('不正なNewsAPIレスポンス構造');
      }
    } catch (error) {
      console.warn(`❌ ${corsProxies[i].name}プロキシ失敗:`, error);
      console.warn(`❌ ${corsProxies[i].name}エラー詳細:`, error.message);
    }
  }
  
  // 最後の手段：直接APIアクセス試行
  try {
    console.log('🔄 直接APIアクセスを試行中...');
    console.log('📍 直接API URL:', DIRECT_API_ENDPOINT);
    
    const response = await fetch(DIRECT_API_ENDPOINT);
    console.log('📊 直接APIレスポンス状態:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📊 直接APIレスポンスデータ:', data);
    
    // データ構造の検証
    if (data && data.status) {
      console.log('✅ 直接APIアクセス成功（CORSが許可されました）');
      return { data: data, method: '直接API' };
    } else {
      throw new Error('不正なNewsAPIレスポンス構造');
    }
  } catch (corsError) {
    console.warn('❌ 直接APIアクセス失敗（CORS問題）:', corsError);
    console.warn('❌ 直接APIエラー詳細:', corsError.message);
    throw new Error('すべてのAPI接続方法が失敗しました');
  }
}

// Netlify環境用: Netlify Functionsを使用
async function fetchNewsNetlify() {
  const response = await fetch(NETLIFY_ENDPOINT);
  return await response.json();
}

async function fetchAINews() {
  console.log('🔄 fetchAINews() 開始');
  
  try {
    let result;
    let method = null;
    
    if (isLocalEnvironment()) {
      console.log('🏠 ローカル環境を検出 - 直接NewsAPIにアクセス');
      const localResult = await fetchNewsLocal();
      console.log('📊 fetchNewsLocal() の戻り値:', localResult);
      
      if (!localResult || !localResult.data) {
        throw new Error('ローカル環境でのデータ取得に失敗');
      }
      
      method = localResult.method;
      result = localResult.data; // データ部分を取り出し
      console.log('📊 取り出したデータ:', result);
    } else {
      console.log('🌐 Netlify環境を検出 - Netlify Functionsを使用');
      result = await fetchNewsNetlify();
      method = 'Netlify Functions';
    }
    
    if (!result) {
      console.error('❌ result が null または undefined');
      showErrorWithFallback("データの取得に失敗しました");
      return;
    }
    
    if (result.status !== "ok") {
      console.error("❌ API error:", result);
      showErrorWithFallback("ニュースの取得に失敗しました");
      return;
    }
    
    console.log('📊 APIレスポンス全体:', result);
    console.log('📊 記事配列:', result.articles);
    console.log('📊 記事数:', result.articles ? result.articles.length : 'undefined');
    
    // データソース表示（成功した取得方法も表示）
    showDataSource(result.source || 'api', method);
    
    // 記事の表示
    if (result.articles && result.articles.length > 0) {
      console.log('✅ renderNews() を呼び出し中...');
      renderNews(result.articles);
      console.log(`🎉 ニュース取得成功! 記事数: ${result.articles.length}件`);
    } else {
      console.warn('⚠️ 記事配列が空または未定義');
      showErrorWithFallback("取得された記事がありません");
    }
    
  } catch (error) {
    console.error("❌ Fetch error:", error);
    console.error("❌ Error stack:", error.stack);
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

// Part 4: 拡張された記事表示機能（修正版）
function renderNews(articles) {
  console.log('🎨 renderNews() 開始');
  console.log('📊 受信した記事配列:', articles);
  
  const list = document.getElementById("news-list");
  if (!list) {
    console.error('❌ news-list 要素が見つかりません');
    return;
  }
  
  console.log('🎯 news-list 要素を取得:', list);
  list.innerHTML = "";
  
  if (!articles || articles.length === 0) {
    console.warn('⚠️ 記事配列が空です');
    list.innerHTML = '<li style="text-align: center; color: #999; padding: 20px;">表示する記事がありません</li>';
    return;
  }
  
  articles.forEach((article, index) => {
    console.log(`🔧 記事 ${index + 1} を処理中:`, article.title);
    
    // データの検証とサニタイズ
    const safeTitle = escapeHtml(article.title || "タイトル不明");
    const safeUrl = article.url || "#";
    const safeDescription = escapeHtml(article.description || "概要が利用できません");
    const safeSourceName = escapeHtml(article.source?.name || "不明");
    
    const li = document.createElement("li");
    li.className = "news-item";
    
    // 安全なHTML構造の構築
    li.innerHTML = `
      <div class="news-header">
        <a href="${safeUrl}" target="_blank" class="news-title">
          ${safeTitle}
        </a>
        <span class="news-source">${safeSourceName}</span>
      </div>
      <p class="news-description">${safeDescription}</p>
      <div class="news-meta">
        <span class="news-date">${formatDate(article.publishedAt)}</span>
        <div class="news-actions">
          <button class="share-btn" data-url="${safeUrl}" data-title="${safeTitle}">
            📤 シェア
          </button>
          <button class="favorite-btn" data-index="${index}">
            ⭐ お気に入り
          </button>
        </div>
      </div>
    `;
    
    // イベントリスナーを安全に追加
    const shareBtn = li.querySelector('.share-btn');
    const favoriteBtn = li.querySelector('.favorite-btn');
    
    shareBtn.addEventListener('click', () => {
      shareArticle(article.url, article.title);
    });
    
    favoriteBtn.addEventListener('click', () => {
      toggleFavorite(index);
    });
    
    list.appendChild(li);
  });
  
  console.log(`✅ renderNews() 完了: ${articles.length}件の記事を表示`);
}

// HTMLエスケープ関数
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

// Part 4: データソース表示機能（拡張版）
function showDataSource(source, method = null) {
  const existingNotice = document.querySelector('.data-source-notice');
  if (existingNotice) {
    existingNotice.remove();
  }
  
  const notice = document.createElement('div');
  notice.className = 'data-source-notice';
  
  if (source === 'mock') {
    notice.innerHTML = `
      <span class="source-badge mock">📝 開発モード</span>
      サンプルデータを表示しています（API接続に失敗）
    `;
  } else {
    const environment = isLocalEnvironment() ? 'ローカル環境' : 'Netlify環境';
    let methodText = '';
    
    if (method) {
      methodText = ` (${method}経由)`;
    } else if (isLocalEnvironment()) {
      methodText = ' (CORSプロキシ経由)';
    } else {
      methodText = ' (Netlify Functions経由)';
    }
    
    notice.innerHTML = `
      <span class="source-badge api">📡 Live API</span>
      NewsAPIから最新データを取得 - ${environment}${methodText}
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
  console.log('🚀 DOMContentLoaded - アプリケーション初期化開始');
  
  // ボタンイベント設定
  const refreshBtn = document.getElementById("refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", fetchAINews);
    console.log('✅ 更新ボタンにイベントリスナーを設定');
  } else {
    console.error('❌ refresh-btn 要素が見つかりません');
  }
  
  // モーダルの外側クリックで閉じる
  const modal = document.getElementById('favorites-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        closeFavorites();
      }
    });
    console.log('✅ モーダルにイベントリスナーを設定');
  } else {
    console.error('❌ favorites-modal 要素が見つかりません');
  }
  
  // ESCキーでモーダルを閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeFavorites();
    }
  });
  
  // 環境情報表示
  console.log('🌍 環境情報:');
  console.log('  - ホスト名:', window.location.hostname);
  console.log('  - ポート:', window.location.port);
  console.log('  - ローカル環境:', isLocalEnvironment());
  console.log('  - APIキー:', API_KEY ? `${API_KEY.substring(0, 8)}...` : 'undefined');
  
  // 初回読み込み時にニュースを取得
  console.log('🔄 初回ニュース取得を開始...');
  fetchAINews();
}); 