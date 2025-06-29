exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // NewsAPI設定
    const API_KEY = process.env.NEWSAPI_KEY || 'ffe3f921a4cc4d769e8efa691a5d1523';
    const API_URL = 'https://newsapi.org/v2/everything';
    
    // APIパラメータ
    const params = new URLSearchParams({
      q: 'AI',
      language: 'ja',
      pageSize: '5',
      sortBy: 'publishedAt',
      apiKey: API_KEY
    });

    // NewsAPIにリクエスト
    const response = await fetch(`${API_URL}?${params}`);
    const data = await response.json();

    // レスポンス検証
    if (!response.ok || data.status !== 'ok') {
      console.error('NewsAPI Error:', data);
      
      // フォールバック: モックデータを返す
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'ok',
          totalResults: 5,
          articles: getMockArticles(),
          source: 'mock' // モックデータであることを示す
        })
      };
    }

    // 成功時のレスポンス
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ...data,
        source: 'api' // 実際のAPIデータであることを示す
      })
    };

  } catch (error) {
    console.error('Function Error:', error);
    
    // エラー時のフォールバック
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'ok',
        totalResults: 5,
        articles: getMockArticles(),
        source: 'mock'
      })
    };
  }
};

// モックデータ生成関数
function getMockArticles() {
  return [
    {
      title: "OpenAI、GPT-4の最新アップデートを発表",
      description: "OpenAIが新しいGPT-4モデルの改良版をリリース。より高精度な日本語処理と推論能力の向上が特徴。",
      url: "https://openai.com/news",
      publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      source: { name: "OpenAI" }
    },
    {
      title: "Google、Bard AIをビジネス向けに拡張",
      description: "Googleが企業向けAIアシスタントBard for Businessを正式発表。生産性向上のための新機能を多数搭載。",
      url: "https://blog.google/technology/ai/",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      source: { name: "Google" }
    },
    {
      title: "Microsoft、AI搭載Office 365の新機能を発表",
      description: "MicrosoftがOffice 365にAI機能を統合。文書作成、データ分析、プレゼンテーション作成を大幅に効率化。",
      url: "https://www.microsoft.com/en-us/microsoft-365/blog/",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      source: { name: "Microsoft" }
    },
    {
      title: "自動運転技術、2024年の最新動向",
      description: "AI技術の進歩により自動運転車の実用化が加速。テスラ、ウェイモなど主要企業の最新取り組みを紹介。",
      url: "https://www.tesla.com/blog",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      source: { name: "Tesla" }
    },
    {
      title: "AI倫理ガイドライン、国際的な統一基準へ",
      description: "G7各国がAI技術の倫理的利用に関する共通ガイドラインの策定で合意。責任あるAI開発を促進。",
      url: "https://www.whitehouse.gov/ai/",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      source: { name: "政府機関" }
    }
  ];
} 