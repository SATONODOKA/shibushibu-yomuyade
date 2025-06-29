// NewsAPI設定
const API_KEY = 'ffe3f921a4cc4d769e8efa691a5d1523';
const API_URL = 'https://newsapi.org/v2/everything';

// DOM要素の取得
const refreshBtn = document.getElementById('refresh-btn');
const newsList = document.getElementById('news-list');
const errorMessage = document.getElementById('errorMessage');
const btnText = document.querySelector('.btn-text');
const loadingSpinner = document.querySelector('.loading-spinner');

// モックデータ生成関数
function generateMockNewsData() {
    return {
        status: 'ok',
        totalResults: 5,
        articles: [
            {
                title: 'OpenAI、GPT-4の最新アップデートを発表',
                description: 'OpenAIが新しいGPT-4モデルの改良版をリリース。より高精度な日本語処理と推論能力の向上が特徴。',
                url: 'https://example.com/news1',
                publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30分前
            },
            {
                title: 'Google、Bard AIをビジネス向けに拡張',
                description: 'Googleが企業向けAIアシスタントBard for Businessを正式発表。生産性向上のための新機能を多数搭載。',
                url: 'https://example.com/news2',
                publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2時間前
            },
            {
                title: 'Microsoft、AI搭載Office 365の新機能を発表',
                description: 'MicrosoftがOffice 365にAI機能を統合。文書作成、データ分析、プレゼンテーション作成を大幅に効率化。',
                url: 'https://example.com/news3',
                publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5時間前
            },
            {
                title: '自動運転技術、2024年の最新動向',
                description: 'AI技術の進歩により自動運転車の実用化が加速。テスラ、ウェイモなど主要企業の最新取り組みを紹介。',
                url: 'https://example.com/news4',
                publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() // 8時間前
            },
            {
                title: 'AI倫理ガイドライン、国際的な統一基準へ',
                description: 'G7各国がAI技術の倫理的利用に関する共通ガイドラインの策定で合意。責任あるAI開発を促進。',
                url: 'https://example.com/news5',
                publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() // 12時間前
            }
        ]
    };
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    refreshBtn.addEventListener('click', fetchNews);
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
        
        // まず直接APIにアクセスを試行
        let data;
        try {
            const response = await fetch(`${API_URL}?${params}`, {
                method: 'GET',
                headers: {
                    'X-API-Key': API_KEY
                }
            });
            
            if (!response.ok) {
                throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
            }
            
            data = await response.json();
        } catch (apiError) {
            console.warn('API直接アクセス失敗、モックデータを使用:', apiError.message);
            
            // モックデータを使用（開発環境用）
            data = generateMockNewsData();
            
            // ユーザーに通知
            showMockDataNotice();
        }
        
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
        console.error('エラーの詳細:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        showError(error.message);
    } finally {
        // ローディング状態を終了
        setLoadingState(false);
    }
}

// ニュース表示関数
function displayNews(articles) {
    // 既存のコンテンツをクリア
    newsList.innerHTML = '';
    
    articles.forEach(article => {
        const newsItem = createNewsItem(article);
        newsList.appendChild(newsItem);
    });
}

// 個別ニュースアイテム作成
function createNewsItem(article) {
    const newsItem = document.createElement('li');
    
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
    
    // 公開日
    const date = document.createElement('div');
    date.className = 'news-date';
    date.textContent = formatDate(article.publishedAt);
    
    // 要素を組み立て
    newsItem.appendChild(title);
    newsItem.appendChild(description);
    newsItem.appendChild(date);
    
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
    refreshBtn.disabled = isLoading;
    
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
    const errorText = message && message.includes('CORS') ? 
        'ニュースの取得に失敗しました（CORS制限のため）' : 
        'ニュースの取得に失敗しました';
    
    errorMessage.textContent = errorText;
    errorMessage.style.display = 'block';
    
    // 既存のニュースコンテンツをクリア
    newsList.innerHTML = `
        <li class="welcome-message">
            ニュースの取得に失敗しました。しばらくしてから再度お試しください。<br>
            <small>詳細なエラー情報はブラウザの開発者ツール（F12）のコンソールをご確認ください。</small>
        </li>
    `;
}

// エラー非表示
function hideError() {
    errorMessage.style.display = 'none';
}

// モックデータ使用通知
function showMockDataNotice() {
    const noticeDiv = document.createElement('div');
    noticeDiv.className = 'mock-notice';
    noticeDiv.style.cssText = `
        background-color: #e3f2fd;
        color: #1565c0;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 20px;
        border-left: 4px solid #2196f3;
        font-size: 0.9em;
    `;
    noticeDiv.innerHTML = `
        <strong>開発モード:</strong> NewsAPIにアクセスできないため、サンプルデータを表示しています。
        <br><small>本番環境では実際のニュースデータが表示されます。</small>
    `;
    
    // 既存の通知があれば削除
    const existingNotice = document.querySelector('.mock-notice');
    if (existingNotice) {
        existingNotice.remove();
    }
    
    // ニュースリストの前に挿入
    newsList.parentNode.insertBefore(noticeDiv, newsList);
    
    // 5秒後に通知を削除
    setTimeout(() => {
        if (noticeDiv.parentNode) {
            noticeDiv.remove();
        }
    }, 5000);
}

// エラー処理の改善
window.addEventListener('unhandledrejection', function(event) {
    console.error('未処理のPromiseエラー:', event.reason);
    showError('予期しないエラーが発生しました。ページを更新してください。');
});

// キーボードアクセシビリティ
refreshBtn.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        fetchNews();
    }
});