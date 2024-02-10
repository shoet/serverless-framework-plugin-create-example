# ServerlessFramework の Plugin サンプル

- Go のプログラムを Lambda にデプロイする
- Lambda のランタイムを provided.al2 に対応させる
  - ファイル名を bootstrap で build し、Function 名のファイルに zip 化する
  - ECR でのデプロイと共存できるように指定した関数の build によるデプロイはスキップさせる
