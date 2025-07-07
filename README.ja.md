# インタラクティブガントチャートデモ

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)](https://tailwindcss.com/)

Next.js 15、React 19、TypeScriptで構築されたモダンなインタラクティブガントチャートアプリケーションです。ドラッグ&ドロップ機能、期間編集、リアルタイム更新を備えた高度なプロジェクトタイムライン管理のデモンストレーションです。

## ✨ 機能

- **🎯 インタラクティブタイムライン**: 日単位の精度でドラッグ&ドロップによる日付範囲選択
- **📝 期間管理**: モーダルフォームでプロジェクト期間の追加・編集
- **🏷️ スマートタグ**: 色分けされた5つのプリセットタグ（開発、デザイン、テスト、レビュー、リリース）
- **📅 日付操作**: 自動閉じ機能付きの直感的なカレンダーインターフェース
- **🔄 リアルタイム更新**: フォーム操作中のライブ期間ハイライト
- **📊 20のサンプルタスク**: レイアウトと機能テスト用の包括的なデータセット
- **♿ アクセシビリティ**: 完全なキーボードナビゲーションとスクリーンリーダー対応
- **📱 レスポンシブデザイン**: 最適化されたスクロール動作を持つ固定ヘッダー
- **🎨 モダンUI**: shadcn/uiコンポーネントとTailwind CSSスタイリング

## 🚀 はじめに

### 前提条件

- [Bun](https://bun.sh/) （必須 - preinstallスクリプトで強制）
- Node.js 18+ （Bun互換性のため）

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd next-gantt-playground

# 依存関係をインストール（自動的にBunを使用）
bun install

# 開発サーバーを起動
bun dev
```

[http://localhost:3000](http://localhost:3000) を開いてインタラクティブガントチャートデモを表示してください。

### 利用可能なスクリプト

```bash
# 開発
bun dev          # Turbopack付き開発サーバーを起動
bun build        # 本番用ビルド
bun start        # 本番サーバーを起動

# コード品質
bun format       # Biomeでコードをフォーマット
bun lint         # リンティングを実行
bun lint:fix     # リンティング問題を自動修正
bun check        # フォーマットとリンティングを同時実行
```

## 🏗️ アーキテクチャ

### 技術スタック

- **フレームワーク**: Next.js 15 with App Router
- **フロントエンド**: React 19 with TypeScript strict mode
- **スタイリング**: Tailwind CSS v4 + shadcn/uiコンポーネント
- **状態管理**: 型安全なZustandストア
- **フォーム処理**: React Hook Form + Zodバリデーション
- **日付ライブラリ**: 計算とフォーマッティング用のdate-fns
- **アイコン**: Lucide React
- **通知**: トーストメッセージ用のSonner
- **コード品質**: Biome（リンティング/フォーマッティング）+ Lefthook（gitフック）

### プロジェクト構造

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # メタデータ付きルートレイアウト
│   └── page.tsx           # メインガントチャートページ
├── components/
│   ├── gantt/             # ガントチャートコンポーネント
│   │   ├── GanttChart.tsx # メインチャートコンテナ
│   │   ├── Timeline.tsx   # 日付ヘッダータイムライン
│   │   ├── TaskList.tsx   # 期間付きタスクリスト
│   │   ├── TaskRow.tsx    # 個別タスク行
│   │   ├── DateRange.tsx  # 期間の視覚化
│   │   ├── AddPeriodModal.tsx   # 新規期間フォーム
│   │   └── EditPeriodModal.tsx  # 期間編集フォーム
│   └── ui/                # shadcn/uiコンポーネント
├── lib/
│   ├── stores/            # Zustand状態管理
│   ├── types/             # TypeScript定義
│   ├── data/              # デモデータ（20のサンプルタスク）
│   └── utils.ts           # ユーティリティ関数
└── docs/                  # 技術文書
```

## 🎮 使用方法

### 基本操作

1. **タイムライン表示**: 今日の1週間前から始まる2ヶ月のプロジェクトタイムラインをナビゲート
2. **期間追加**: 日付範囲をドラッグして選択し、モーダルフォームに入力
3. **期間編集**: 既存の期間をクリックして編集モーダルを開く
4. **スクロールナビゲーション**: Shiftキー+マウスホイールで水平スクロール
5. **フォーム操作**: 日付変更時のリアルタイム期間ハイライトを確認

### キーボードアクセシビリティ

- `Tab` / `Shift+Tab`: インタラクティブ要素間のナビゲーション
- `Enter` / `Space`: ボタンの起動と日付選択
- `Escape`: モーダルとポップオーバーを閉じる
- 矢印キー: カレンダーコンポーネント内のナビゲーション

## 🔧 開発

### コード品質基準

- TypeScript strict mode有効
- `any`型の使用禁止
- 一貫したフォーマットとリンティングのためのBiome
- 包括的なエラーハンドリング
- アクセシビリティファーストアプローチ

### 主要な実装詳細

- **レイアウト制御**: 固定ヘッダーとスクロール可能コンテンツのFlexboxベースレイアウト
- **スクロール同期**: タイムラインとコンテンツエリアの完璧なスクロール同期
- **フォームバリデーション**: 明確なエラーメッセージ付きリアルタイムバリデーション
- **状態管理**: 型安全なアクション付き集中型Zustandストア
- **パフォーマンス**: 仮想化なしで20+タスクの最適化レンダリング

## 📚 ドキュメント

- [レイアウト制御ロジック](./docs/layout-control-logic.md) - レスポンシブレイアウトシステムの詳細説明
- [CLAUDE.md](./CLAUDE.md) - AI開発ガイドラインとプロジェクト仕様

## 🤝 コントリビューション

1. 既存のコードスタイルに従う（Biomeが強制します）
2. プレフィックス付きの従来のコミットメッセージを使用（feat、fix、refactorなど）
3. すべてのTypeScript診断が解決されていることを確認
4. キーボードナビゲーションでアクセシビリティ機能をテスト
5. コミット前に`bun check`を実行

## 📄 ライセンス

このプロジェクトはデモンストレーション目的です。依存関係の個別パッケージライセンスを参照してください。

## 🔗 リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand State Management](https://zustand-demo.pmnd.rs/)

---

**デモバッジ**: ⚡ これはプロジェクト管理アプリケーション向けのモダンなReact開発手法とUI/UXパターンを紹介するインタラクティブなデモンストレーションです。
