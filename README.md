# AIニュース更新アプリ（Part 4 完全版）

このアプリは NewsAPI を使用して AI関連のニュースを取得し、表示するWebアプリケーションです。Part 4では将来的な拡張機能とAPIキー管理機能を実装しました。

## 🚀 新機能（Part 4）

### ✨ 拡張機能
- **📤 シェア機能**: 記事をSNSやクリップボードでシェア
- **⭐ お気に入り機能**: 記事をローカルストレージに保存・管理
- **📊 データソース表示**: APIまたはモックデータの表示状態を通知
- **🕐 相対時間表示**: 「〜分前」「〜時間前」など直感的な時間表示
- **🎯 改善されたUI**: より使いやすく美しいデザイン

### 🔐 APIキー管理
- **環境変数対応**: Netlify環境変数でAPIキーを安全に管理
- **Netlify Functions**: CORS問題を解決するプロキシAPI
- **フォールバック機能**: API障害時のモックデータ対応

## 🛠️ 技術仕様

- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **バックエンド**: Netlify Functions (Node.js)
- **API**: NewsAPI v2
- **ストレージ**: LocalStorage（お気に入り機能）
- **デプロイ**: Netlify

## 📋 機能一覧

### 基本機能
- 🔄 **ニュース更新**: 最新AI関連ニュース5件を取得
- 📱 **レスポンシブデザイン**: モバイル・デスクトップ対応
- ⚡ **高速表示**: 軽量で高速な動作

### 拡張機能（Part 4）
- 📤 **記事シェア**: Web Share API + クリップボードフォールバック
- ⭐ **お気に入り管理**: 保存・表示・削除機能
- 🕐 **相対時間**: 人間が読みやすい時間表示
- 📊 **データソース通知**: APIまたはモック データの表示
- 🎨 **モダンUI**: カード型レイアウト、ホバーエフェクト

## 🔧 セットアップ・デプロイ

### ローカル開発
```bash
# プロジェクトクローン
git clone https://github.com/SATONODOKA/shibushibu-yomuyade.git
cd shibushibu-yomuyade

# ローカルサーバー起動
python -m http.server 8000
# または
npx serve .
```

### Netlify デプロイ
1. **GitHub連携**: リポジトリをNetlifyに連携
2. **環境変数設定**: 
   - Site settings → Environment variables
   - `NEWSAPI_KEY` = あなたのAPIキー
3. **自動デプロイ**: プッシュ時に自動デプロイ

## 🔑 APIキー管理

### 開発環境
- APIキーはソースコードに直書き（Part 4では問題なし）
- `netlify/functions/news.js` でフォールバック設定

### 本番環境
```bash
# Netlify環境変数に設定
NEWSAPI_KEY=your_actual_api_key_here
```

### セキュリティ注意事項
- ⚠️ GitHubにAPIキーを含めない
- ✅ Netlify環境変数を使用
- ✅ Netlify Functionsでプロキシ化

## 📁 ファイル構成
```
AInews/
├── index.html                    # メインHTMLファイル
├── style.css                     # スタイルシート（Part 4拡張）
├── script.js                     # JavaScript機能（Part 4拡張）
├── netlify/functions/news.js     # Netlify Functions（Part 4新規）
└── README.md                     # このファイル
```

## 🔮 将来的な拡張予定

- **🤖 AI要約機能**: 記事の要約を生成AIで補完
- **🏷️ キーワード提案**: 関連キーワードの自動提案
- **📄 ページング機能**: さらに5件ずつ記事を取得
- **🔄 自動更新**: 定期的なニュース自動取得
- **🎨 テーマ機能**: ダーク/ライトモード切り替え

## 📊 Todo（Part 4）

- [x] NewsAPIのCORS問題解決
- [x] お気に入り機能実装
- [x] シェア機能実装
- [x] 相対時間表示実装
- [x] データソース表示機能
- [x] Netlify Functions実装
- [ ] NewsAPIの利用規約・制限確認
- [ ] GNewsやBing News APIの調査
- [ ] UIモックアップの更新
- [ ] パフォーマンス最適化

## 🌐 ブラウザサポート

- Chrome 60+ ✅
- Firefox 60+ ✅
- Safari 12+ ✅
- Edge 79+ ✅

## 📝 開発履歴

- **Part 1**: 基本的なニュース取得・表示機能
- **Part 2**: デザイン改善・構造最適化
- **Part 3**: 標準化・コードの簡素化
- **Part 4**: 拡張機能・API管理・将来対応 ← 現在

## 🎯 使用方法

1. **基本操作**:
   - 「🔄 ニュースを更新」でニュース取得
   - 記事タイトルクリックで詳細ページへ

2. **拡張機能**:
   - 「📤 シェア」ボタンで記事をシェア
   - 「⭐ お気に入り」で記事を保存
   - 「⭐ お気に入り表示」で保存済み記事を閲覧

3. **データソース確認**:
   - 📡 Live: NewsAPIから取得
   - 📝 開発モード: モックデータ表示

---
**開発環境**: Cursor  
**最終更新**: 2025年6月29日（Part 4機能拡張完了）  
**URL**: https://shibushibu-yomuyade.netlify.app 