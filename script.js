const apiKey = "ffe3f921a4cc4d769e8efa691a5d1523";
const endpoint = `https://newsapi.org/v2/everything?q=AI&language=ja&pageSize=5&sortBy=publishedAt&apiKey=${apiKey}`;

async function fetchAINews() {
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    if (data.status !== "ok") {
      console.error("API error:", data);
      alert("ニュースの取得に失敗しました");
      return;
    }
    renderNews(data.articles);
  } catch (error) {
    console.error("Fetch error:", error);
    alert("通信に失敗しました");
    
    // フォールバック: モックデータを使用
    renderNews(getMockArticles());
  }
}

function renderNews(articles) {
  const list = document.getElementById("news-list");
  list.innerHTML = "";
  articles.forEach((a) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <a href="${a.url}" target="_blank">${a.title}</a><br>
      <small>${a.description || ""}</small>
    `;
    list.appendChild(li);
  });
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

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("refresh-btn")
    .addEventListener("click", fetchAINews);
}); 