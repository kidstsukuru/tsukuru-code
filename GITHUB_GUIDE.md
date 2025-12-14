# GitHub 完全ガイド

## 目次
1. [GitHubとは](#githubとは)
2. [Gitとは](#gitとは)
3. [GitHubの主な役割](#githubの主な役割)
4. [基本的な概念](#基本的な概念)
5. [よく使うコマンド](#よく使うコマンド)
6. [このプロジェクトでの使い方](#このプロジェクトでの使い方)
7. [ブランチ戦略](#ブランチ戦略)
8. [トラブルシューティング](#トラブルシューティング)
9. [ベストプラクティス](#ベストプラクティス)

---

## GitHubとは

**GitHub**は、Gitを使ったバージョン管理システムをクラウド上で提供するプラットフォームです。

### 主な特徴
- **コードのホスティング**: コードをクラウド上に保存
- **バージョン管理**: コードの変更履歴を記録・管理
- **コラボレーション**: 複数人での開発を支援
- **バックアップ**: ローカルPCが壊れてもコードを復元可能
- **ポートフォリオ**: 自分のコードを公開して実績を示せる

---

## Gitとは

**Git**は、ファイルの変更履歴を記録・管理する「バージョン管理システム」です。

### Gitでできること

#### 1. 変更履歴の記録
```
バージョン1: ログイン機能を追加
バージョン2: バグを修正
バージョン3: デザインを変更
```

#### 2. 過去のバージョンに戻る
間違えてコードを消しても、過去の状態に復元できます。

#### 3. 複数人での同時作業
他の人と同じプロジェクトを同時に編集できます。

---

## GitHubの主な役割

### 1. 🗄️ コードのバックアップ

**問題**: パソコンが壊れたらコードが全部消える！

**解決**: GitHubにコードを保存しておけば、いつでも復元できます。

```bash
# ローカルのコードをGitHubに保存
git push
```

### 2. 🕐 タイムマシン機能

**問題**: 間違えてコードを消してしまった！

**解決**: 過去のバージョンに戻れます。

```bash
# 過去の履歴を確認
git log

# 特定のバージョンに戻る
git checkout <コミットID>
```

### 3. 👥 チーム開発

**問題**: 複数人で同じファイルを編集すると、誰の変更が正しいかわからない！

**解決**: Gitが自動で変更を統合してくれます。

### 4. 📝 変更の記録

**問題**: いつ、誰が、何を変更したかわからない！

**解決**: すべての変更が記録されます。

```bash
# 変更履歴を表示
git log --oneline

# 誰がどの行を変更したか確認
git blame <ファイル名>
```

### 5. 🌿 実験的な機能の開発

**問題**: 新機能を試したいけど、既存のコードを壊したくない！

**解決**: ブランチを作って、安全に実験できます。

```bash
# 新しいブランチを作成
git branch 新機能

# ブランチを切り替え
git checkout 新機能
```

---

## 基本的な概念

### リポジトリ (Repository)

プロジェクト全体のコードと変更履歴を保存する場所。

- **ローカルリポジトリ**: 自分のPC上のリポジトリ
- **リモートリポジトリ**: GitHub上のリポジトリ

### コミット (Commit)

変更を記録すること。ゲームのセーブポイントのようなもの。

```bash
git add .                          # 変更をステージング
git commit -m "ログイン機能を追加"  # 変更を記録
```

### プッシュ (Push)

ローカルの変更をGitHubに送ること。

```bash
git push
```

### プル (Pull)

GitHubの最新の変更をローカルに取り込むこと。

```bash
git pull
```

### ブランチ (Branch)

コードの分岐。メインのコードに影響を与えずに新機能を開発できます。

```
main (本番用)
  ↓
  └─ feature/login (ログイン機能開発用)
  └─ feature/design (デザイン変更用)
```

### マージ (Merge)

ブランチの変更をメインブランチに統合すること。

```bash
git checkout main
git merge feature/login
```

---

## よく使うコマンド

### 初期設定

```bash
# ユーザー名とメールアドレスを設定（最初の1回だけ）
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### 基本操作

#### 1. 変更を確認

```bash
# 現在の状態を確認
git status

# 変更内容を詳しく確認
git diff
```

#### 2. 変更を記録

```bash
# すべての変更をステージング
git add .

# 特定のファイルだけステージング
git add ファイル名

# コミット（変更を記録）
git commit -m "変更内容の説明"
```

#### 3. GitHubと同期

```bash
# GitHubに送信
git push

# GitHubから取得
git pull

# 強制的にGitHubの状態に合わせる（注意！ローカルの変更は消えます）
git fetch origin
git reset --hard origin/main
```

#### 4. 履歴を確認

```bash
# コミット履歴を表示
git log

# 1行で表示
git log --oneline

# グラフ表示
git log --graph --oneline --all
```

#### 5. ブランチ操作

```bash
# ブランチ一覧を表示
git branch

# 新しいブランチを作成
git branch ブランチ名

# ブランチを切り替え
git checkout ブランチ名

# ブランチを作成して切り替え（ショートカット）
git checkout -b ブランチ名

# ブランチを削除
git branch -d ブランチ名

# ブランチをマージ
git checkout main
git merge ブランチ名
```

---

## このプロジェクトでの使い方

### プロジェクト情報

- **リポジトリURL**: https://github.com/kidstsukuru/tsukuru-code
- **メインブランチ**: `main`
- **認証方式**: SSH

### 日常的な作業フロー

#### 1. コードを変更する

```bash
# エディタでコードを編集
# 例: CoursePage.tsxを編集
```

#### 2. 変更内容を確認

```bash
# どのファイルが変更されたか確認
git status

# 変更内容を確認
git diff
```

#### 3. 変更をコミット

```bash
# すべての変更をステージング
git add .

# コミット（わかりやすいメッセージを書く）
git commit -m "レベル選択画面のデザインを改善"
```

#### 4. GitHubにプッシュ

```bash
# GitHubに送信
git push
```

### 新機能を開発する場合

#### 1. 新しいブランチを作成

```bash
# mainブランチから新しいブランチを作成
git checkout -b feature/user-profile
```

#### 2. コードを変更してコミット

```bash
git add .
git commit -m "ユーザープロフィール機能を追加"
```

#### 3. GitHubにプッシュ

```bash
# 新しいブランチをGitHubに送信
git push -u origin feature/user-profile
```

#### 4. Pull Requestを作成（オプション）

GitHub上で「Pull Request」を作成すると、コードレビューができます。

#### 5. mainブランチにマージ

```bash
# mainブランチに切り替え
git checkout main

# 新機能をマージ
git merge feature/user-profile

# GitHubに反映
git push
```

---

## ブランチ戦略

### シンプルな戦略（個人開発向け）

```
main (本番用)
  ↓
  └─ feature/xxx (新機能開発)
```

- `main`: 常に動作する安定版
- `feature/xxx`: 新機能開発用（完成したらmainにマージ）

### Git Flow（チーム開発向け）

```
main (本番)
  ↓
develop (開発)
  ↓
  └─ feature/login (機能開発)
  └─ feature/dashboard (機能開発)
  └─ hotfix/bug-fix (緊急修正)
```

- `main`: 本番環境のコード
- `develop`: 開発中のコード
- `feature/xxx`: 各機能の開発
- `hotfix/xxx`: 緊急バグ修正

---

## トラブルシューティング

### 1. コミットを間違えた

```bash
# 直前のコミットを取り消す（変更は残る）
git reset --soft HEAD~1

# 直前のコミットを完全に取り消す（変更も消える）
git reset --hard HEAD~1

# コミットメッセージだけ修正
git commit --amend -m "新しいメッセージ"
```

### 2. GitHubにプッシュできない

```bash
# エラー: "rejected"
# 原因: GitHubの方が新しい変更がある

# 解決: GitHubの変更を取り込んでからプッシュ
git pull
git push
```

### 3. マージコンフリクト（競合）が発生

```bash
# 1. ファイルを開いて競合箇所を確認
# <<<<<<< HEAD
# 自分の変更
# =======
# 他人の変更
# >>>>>>> branch-name

# 2. 手動で正しいコードに修正

# 3. 修正をコミット
git add .
git commit -m "マージコンフリクトを解決"
```

### 4. 間違えてファイルを削除した

```bash
# 特定のファイルを復元
git checkout HEAD -- ファイル名

# すべてのファイルを復元
git checkout HEAD -- .
```

### 5. 過去のバージョンに戻したい

```bash
# 過去のコミットを確認
git log --oneline

# 特定のコミットに戻る（新しいコミットとして記録）
git revert <コミットID>

# 特定のコミットに完全に戻る（危険！履歴が消える）
git reset --hard <コミットID>
```

### 6. SSH接続でエラーが出る

```bash
# SSH接続をテスト
ssh -T git@github.com

# エラーが出る場合: SSH鍵を再設定
ssh-keygen -t ed25519 -C "your@email.com"
# 生成された公開鍵をGitHubに登録
cat ~/.ssh/id_ed25519.pub
```

---

## ベストプラクティス

### 1. コミットメッセージの書き方

#### ❌ 悪い例
```bash
git commit -m "修正"
git commit -m "update"
git commit -m "aaa"
```

#### ✅ 良い例
```bash
git commit -m "ログイン機能のバグを修正"
git commit -m "ダッシュボードのデザインを改善"
git commit -m "レベル選択画面を追加"
```

### コミットメッセージのテンプレート

```
[種類] 簡潔な説明（50文字以内）

詳細な説明（必要に応じて）

種類:
- feat: 新機能
- fix: バグ修正
- docs: ドキュメント
- style: コードのフォーマット
- refactor: リファクタリング
- test: テスト追加
- chore: その他の変更
```

#### 例
```bash
git commit -m "feat: ユーザープロフィール編集機能を追加"
git commit -m "fix: ログイン時のエラーハンドリングを修正"
git commit -m "docs: README.mdにインストール手順を追加"
```

### 2. こまめにコミット

#### ❌ 悪い例
```bash
# 1週間分の変更を1つのコミットに
git commit -m "いろいろ修正"
```

#### ✅ 良い例
```bash
# 機能ごとに分けてコミット
git commit -m "ログインフォームを作成"
git commit -m "バリデーション機能を追加"
git commit -m "エラーメッセージを表示"
```

### 3. 定期的にプッシュ

```bash
# 毎日作業終了時にプッシュ
git push

# これでPCが壊れても安心！
```

### 4. mainブランチを守る

```bash
# mainブランチで直接作業しない
git checkout -b feature/new-feature

# 作業してコミット
git commit -m "新機能を追加"

# mainにマージ
git checkout main
git merge feature/new-feature
```

### 5. .gitignoreを設定

機密情報や不要なファイルをGitHubにアップロードしないようにします。

```.gitignore
# 機密情報
.env
.env.local
*.key
*.pem

# 依存関係
node_modules/
dist/
build/

# エディタ設定
.vscode/
.idea/

# OS固有ファイル
.DS_Store
Thumbs.db
```

---

## よくある質問（FAQ）

### Q1. コミットとプッシュの違いは？

- **コミット**: ローカル（自分のPC）に変更を記録
- **プッシュ**: ローカルの変更をGitHub（クラウド）に送信

```bash
git commit -m "変更"  # ローカルに保存
git push              # GitHubに送信
```

### Q2. いつコミットすればいい？

小さな機能が完成したらコミット。目安は1時間〜2時間に1回。

### Q3. いつプッシュすればいい？

1日の作業が終わったら必ずプッシュ。バックアップのため。

### Q4. ブランチは必須？

個人開発なら必須ではありませんが、実験的な機能を試すときは使うと便利。

### Q5. GitHubに間違えて機密情報をプッシュしてしまった！

```bash
# 1. すぐにファイルを削除
git rm .env
git commit -m "機密情報を削除"
git push

# 2. パスワードやAPIキーを変更

# 3. 履歴から完全に削除（高度な操作）
# https://docs.github.com/ja/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
```

---

## 学習リソース

### 公式ドキュメント
- [GitHub公式ガイド（日本語）](https://docs.github.com/ja)
- [Git公式ドキュメント](https://git-scm.com/book/ja/v2)

### 初心者向けチュートリアル
- [サルでもわかるGit入門](https://backlog.com/ja/git-tutorial/)
- [ドットインストール Git入門](https://dotinstall.com/lessons/basic_git)

### 練習サイト
- [Learn Git Branching](https://learngitbranching.js.org/?locale=ja)（インタラクティブ学習）

---

## まとめ

### GitHubを使う理由

1. **バックアップ**: PCが壊れてもコードが消えない
2. **履歴管理**: いつでも過去の状態に戻れる
3. **コラボレーション**: チームで開発できる
4. **ポートフォリオ**: 自分のスキルを証明できる

### 基本的なワークフロー

```bash
# 1. コードを変更
# エディタでファイルを編集

# 2. 変更を確認
git status
git diff

# 3. 変更をステージング
git add .

# 4. コミット
git commit -m "わかりやすいメッセージ"

# 5. GitHubにプッシュ
git push
```

### 困ったときは

1. `git status` で現在の状態を確認
2. `git log` で履歴を確認
3. このガイドのトラブルシューティングを参照
4. Google検索: 「git エラーメッセージ」

---

**作成日**: 2025-12-10
**プロジェクト**: つくるコード (Tsukuru Code)
**リポジトリ**: https://github.com/kidstsukuru/tsukuru-code
