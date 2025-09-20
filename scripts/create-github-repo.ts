#!/usr/bin/env tsx

import { createRepository, getAuthenticatedUser } from '../server/github-service';

async function main() {
  try {
    console.log('GitHubユーザー情報を取得中...');
    const userResult = await getAuthenticatedUser();
    
    if (!userResult.success) {
      console.error('GitHubユーザー情報の取得に失敗:', userResult.error);
      return;
    }
    
    console.log('GitHubユーザー:', userResult.user?.login);
    console.log('名前:', userResult.user?.name);
    console.log();
    
    console.log('新しいリポジトリを作成中...');
    const repoResult = await createRepository(
      'shinojima-fishery-backend-app',
      '篠島漁師向けバックオフィス自動化アプリ - 魚種認識、音声出荷記録、レシートOCR、自動帳簿、補助金申請サポート、AI経営相談機能を搭載した高齢者向けDXソリューション',
      false // パブリックリポジトリ
    );
    
    if (!repoResult.success) {
      console.error('リポジトリ作成に失敗:', repoResult.error);
      return;
    }
    
    console.log('✅ リポジトリが正常に作成されました!');
    console.log('リポジトリ名:', repoResult.repository?.name);
    console.log('リポジトリURL:', repoResult.repository?.html_url);
    console.log('クローンURL:', repoResult.repository?.clone_url);
    console.log();
    console.log('次のステップ:');
    console.log('1. git remote add origin', repoResult.repository?.clone_url);
    console.log('2. git add .');
    console.log('3. git commit -m "Initial commit: 篠島漁業DXアプリ"');
    console.log('4. git push -u origin main');
    
  } catch (error) {
    console.error('スクリプト実行エラー:', error);
  }
}

main();