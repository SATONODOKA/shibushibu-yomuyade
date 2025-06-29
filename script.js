// NewsAPI設定
const API_KEY = 'ffe3f921a4cc4d769e8efa691a5d1523';
const API_URL = 'https://newsapi.org/v2/everything';

// DOM要素の取得
const updateBtn = document.getElementById('updateBtn');
const newsContainer = document.getElementById('newsContainer');
const errorMessage = document.getElementById('errorMessage');
const btnText = document.querySelector('.btn-text');
const loadingSpinner = document.querySelector('.loading-spinner');

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    updateBtn.addEventListener('click', fetchNews);
});

// ニュース取得関数
async function fetchNews() {
    try {
        // ローディング状態に変更
        setLoadingState(true);
        hideError();
        
        // APIパラメータ設定
        const params = new URLSearchParams({
            q: 'AI',
            language: 'ja',
            pageSize: '5',
            sortBy: 'publishedAt',
            apiKey: API_KEY
        });
        
        // APIリクエスト
        const response = await fetch(`${API_URL}?${params}`);
        
        if (!response.ok) {
            throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.status !== 'ok') {
            throw new Error(data.message || 'APIからのデータ取得に失敗しました');
        }
        
        if (!data.articles || data.articles.length === 0) {
            throw new Error('ニュース記事が見つかりませんでした');
        }
        
        // ニュース表示
        displayNews(data.articles);
        
    } catch (error) {
        console.error('ニュース取得エラー:', error);
        showError(error.message);
    } finally {
        // ローディング状態を終了
        setLoadingState(false);
    }
}

// ニュース表示関数
function displayNews(articles) {
    // 既存のコンテンツをクリア
    newsContainer.innerHTML = '';
    
    articles.forEach(article => {
        const newsItem = createNewsItem(article);
        newsContainer.appendChild(newsItem);
    });
}

// 個別ニュースアイテム作成
function createNewsItem(article) {
    const newsItem = document.createElement('div');
    newsItem.className = 'news-item';
    
    // タイトル
    const title = document.createElement('div');
    title.className = 'news-title';
    
    if (article.url) {
        title.innerHTML = `<a href="${article.url}" target="_blank" rel="noopener noreferrer">${article.title || 'タイトルなし'}</a>`;
    } else {
        title.textContent = article.title || 'タイトルなし';
    }
    
    // 概要
    const description = document.createElement('div');
    description.className = 'news-description';
    description.textContent = article.description || '概要が利用できません';
    
    // メタ情報
    const meta = document.createElement('div');
    meta.className = 'news-meta';
    
    // 公開日
    const date = document.createElement('div');
    date.className = 'news-date';
    date.textContent = formatDate(article.publishedAt);
    
    // ソース
    const source = document.createElement('div');
    source.className = 'news-source';
    source.textContent = article.source?.name || '不明なソース';
    
    meta.appendChild(date);
    meta.appendChild(source);
    
    // 要素を組み立て
    newsItem.appendChild(title);
    newsItem.appendChild(description);
    newsItem.appendChild(meta);
    
    return newsItem;
}

// 日付フォーマット関数
function formatDate(dateString) {
    if (!dateString) return '日付不明';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        // 時間差の計算
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
            // 日本語形式で表示
            return date.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    } catch (error) {
        console.error('日付フォーマットエラー:', error);
        return '日付不明';
    }
}

// ローディング状態の設定
function setLoadingState(isLoading) {
    updateBtn.disabled = isLoading;
    
    if (isLoading) {
        btnText.style.display = 'none';
        loadingSpinner.style.display = 'inline';
    } else {
        btnText.style.display = 'inline';
        loadingSpinner.style.display = 'none';
    }
}

// エラー表示
function showError(message) {
    errorMessage.textContent = `エラー: ${message}`;
    errorMessage.style.display = 'block';
    
    // 既存のニュースコンテンツをクリア
    newsContainer.innerHTML = `
        <div class="welcome-message">
            <p>ニュースの取得に失敗しました。しばらくしてから再度お試しください。</p>
        </div>
    `;
}

// エラー非表示
function hideError() {
    errorMessage.style.display = 'none';
}

// エラー処理の改善
window.addEventListener('unhandledrejection', function(event) {
    console.error('未処理のPromiseエラー:', event.reason);
    showError('予期しないエラーが発生しました。ページを更新してください。');
});

// キーボードアクセシビリティ
updateBtn.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        fetchNews();
    }
});